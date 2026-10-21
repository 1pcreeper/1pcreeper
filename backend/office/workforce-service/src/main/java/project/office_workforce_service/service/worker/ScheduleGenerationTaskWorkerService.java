package project.office_workforce_service.service.worker;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.model.entity.PlaceScheduleRule;
import project.office_workforce_service.model.entity.PlaceWorkingPeriodRule;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffSchedulePreference;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.model.entity.enums.TaskStatus;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.service.manager.PlaceOccupationRuleManagerService;
import project.office_workforce_service.service.manager.PlaceScheduleRuleManagerService;
import project.office_workforce_service.service.manager.PlaceWorkingPeriodRuleManagerService;
import project.office_workforce_service.service.manager.ScheduleGenerationTaskManagerService;
import project.office_workforce_service.service.manager.ScheduleManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.StaffSchedulePreferenceManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ScheduleGenerationTaskWorkerService {

    private final ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService;
    private final PlaceScheduleRuleManagerService placeScheduleRuleManagerService;
    private final PlaceOccupationRuleManagerService placeOccupationRuleManagerService;
    private final PlaceWorkingPeriodRuleManagerService placeWorkingPeriodRuleManagerService;
    private final ScheduleManagerService scheduleManagerService;
    private final StaffManagerService staffManagerService;
    private final StaffSchedulePreferenceManagerService staffSchedulePreferenceManagerService;

    @Autowired
    public ScheduleGenerationTaskWorkerService(
        ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService,
        PlaceScheduleRuleManagerService placeScheduleRuleManagerService,
        PlaceOccupationRuleManagerService placeOccupationRuleManagerService,
        PlaceWorkingPeriodRuleManagerService placeWorkingPeriodRuleManagerService,
        ScheduleManagerService scheduleManagerService,
        StaffManagerService staffManagerService,
        StaffSchedulePreferenceManagerService staffSchedulePreferenceManagerService
    ) {
        this.scheduleGenerationTaskManagerService = scheduleGenerationTaskManagerService;
        this.placeScheduleRuleManagerService = placeScheduleRuleManagerService;
        this.placeOccupationRuleManagerService = placeOccupationRuleManagerService;
        this.placeWorkingPeriodRuleManagerService = placeWorkingPeriodRuleManagerService;
        this.scheduleManagerService = scheduleManagerService;
        this.staffManagerService = staffManagerService;
        this.staffSchedulePreferenceManagerService = staffSchedulePreferenceManagerService;
    }

    @Async("threadPoolExecutor")
    @Transactional
    public void executeGeneration(Long taskId) {
        log.info("Starting schedule generation for Task ID: {}", taskId);

        ScheduleGenerationTask task = scheduleGenerationTaskManagerService.findById(taskId);

        try {
            Place place = task.getPlace();
            if (place == null || task.getTargetYear() == null || task.getTargetMonth() == null) {
                throw new PropertyValidationException("Generation task is missing its place or target month.");
            }
            Long placeId = place.getId();
            Long departId = place.getDepartment().getId();

            // Ordered work-type priorities; empty means all work types are allowed with no ordering
            List<WorkType> workTypePriorities = placeScheduleRuleManagerService.findOptionalByPlaceId(placeId)
                .map(PlaceScheduleRule::getWorkTypePriorities)
                .orElse(Collections.emptyList());
            if (workTypePriorities == null) {
                workTypePriorities = Collections.emptyList();
            }

            int created = 0;
            int fullSlots = 0;

            YearMonth yearMonth = YearMonth.of(task.getTargetYear(), task.getTargetMonth());
            for (LocalDate date = yearMonth.atDay(1); !date.isAfter(yearMonth.atEndOfMonth()); date = date.plusDays(1)) {
                int weekDay = date.getDayOfWeek().getValue(); // 1 = Monday .. 7 = Sunday

                List<PlaceOccupationRule> occupationRules =
                    placeOccupationRuleManagerService.findByPlaceIdAndWeekDay(placeId, weekDay);

                for (PlaceOccupationRule occRule : occupationRules) {
                    List<PlaceWorkingPeriodRule> wpRules =
                        placeWorkingPeriodRuleManagerService.findByOccupationRuleId(occRule.getId());

                    for (PlaceWorkingPeriodRule wpRule : wpRules) {
                        WorkingPeriod period = wpRule.getWorkingPeriod();

                        LocalDateTime dayStart = date.atStartOfDay();
                        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
                        long existing = scheduleManagerService.countSlotOccupancy(
                            placeId, occRule.getOccupation().getId(), period.getId(),
                            dayStart, dayEnd, ScheduleStatus.INACTIVE);
                        int needed = wpRule.getPersonCount() - (int) existing;
                        if (needed <= 0) {
                            fullSlots++; // gap-filling only: never touch a full slot
                            continue;
                        }

                        LocalDateTime slotStart = LocalDateTime.of(date, period.getStartAt());
                        LocalDateTime slotEnd = LocalDateTime.of(date, period.getEndAt());
                        if (!slotEnd.isAfter(slotStart)) {
                            slotEnd = slotEnd.plusDays(1); // overnight shift crosses midnight
                        }

                        List<Staff> candidates = new ArrayList<>(
                            staffManagerService.findActiveByDepartmentIdAndOccupationId(
                                departId, occRule.getOccupation().getId()));

                        if (!workTypePriorities.isEmpty()) {
                            List<WorkType> priorities = workTypePriorities;
                            candidates.removeIf(s -> !priorities.contains(s.getType()));
                        }
                        if (candidates.isEmpty()) {
                            log.warn("No eligible staff for occupation {} at place {} on {}",
                                occRule.getOccupation().getId(), placeId, date);
                            continue;
                        }

                        List<Long> staffIds = candidates.stream().map(Staff::getId).toList();
                        Map<Long, StaffSchedulePreference> prefByStaff = staffSchedulePreferenceManagerService
                            .findByStaffIdInAndPlaceIdAndWeekDay(staffIds, placeId, weekDay).stream()
                            .collect(Collectors.toMap(p -> p.getStaff().getId(), p -> p, (a, b) -> a));

                        // Exclude staff already booked in an overlapping shift at this place that day
                        LocalDateTime overlapStart = slotStart;
                        LocalDateTime overlapEnd = slotEnd;
                        candidates.removeIf(s -> !scheduleManagerService.findConflicts(
                            s.getId(), placeId, overlapStart, overlapEnd, ScheduleStatus.INACTIVE, null).isEmpty());

                        List<WorkType> priorities = workTypePriorities;
                        Long periodId = period.getId();
                        candidates.sort(Comparator
                            .comparingInt((Staff s) -> priorities.isEmpty() ? 0 : priorities.indexOf(s.getType()))
                            .thenComparingInt(s -> {
                                StaffSchedulePreference pref = prefByStaff.get(s.getId());
                                if (pref == null) return 1; // staff with no preference last
                                boolean exactPeriodMatch = pref.getWorkingPeriod() != null
                                    && pref.getWorkingPeriod().getId().equals(periodId);
                                return exactPeriodMatch ? -1 : 0;
                            })
                            .thenComparingInt(s -> {
                                StaffSchedulePreference pref = prefByStaff.get(s.getId());
                                return pref != null && pref.getPriorityIndex() != null
                                    ? -pref.getPriorityIndex() : 0; // priorityIndex DESC
                            }));

                        List<Schedule> newSchedules = new ArrayList<>();
                        for (Staff staff : candidates) {
                            if (newSchedules.size() >= needed) break;
                            newSchedules.add(Schedule.builder()
                                .startAt(slotStart)
                                .endAt(slotEnd)
                                .place(place)
                                .staff(staff)
                                .workingPeriod(period)
                                .occupation(occRule.getOccupation())
                                .status(ScheduleStatus.DRAFT)
                                .remark(occRule.getOccupation().getName())
                                .build());
                        }
                        scheduleManagerService.saveAll(newSchedules);
                        created += newSchedules.size();
                    }
                }
            }

            log.info("Generation summary for Task ID {}: {} schedules created, {} slots already full.",
                taskId, created, fullSlots);

            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
            scheduleGenerationTaskManagerService.save(task);
            log.info("Successfully completed schedule generation for Task ID: {}", taskId);
        } catch (Exception e) {
            log.error("Failed schedule generation for Task ID: {}", taskId, e);

            task.setStatus(TaskStatus.FAILED);
            task.setCompletedAt(LocalDateTime.now());
            task.setErrorMessage(e.getMessage());
            scheduleGenerationTaskManagerService.save(task);
        }
    }
}
