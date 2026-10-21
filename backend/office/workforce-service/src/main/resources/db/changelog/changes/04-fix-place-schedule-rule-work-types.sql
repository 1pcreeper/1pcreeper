CREATE TABLE IF NOT EXISTS place_schedule_rule_work_types (
    rule_id INTEGER NOT NULL REFERENCES place_schedule_rules(id) ON DELETE CASCADE,
    work_type VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_place_schedule_rule_work_types_unique ON place_schedule_rule_work_types(rule_id, work_type);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'place_schedule_rules' AND column_name = 'work_type_priorities'
    ) THEN
        INSERT INTO place_schedule_rule_work_types (rule_id, work_type)
        SELECT s.rule_id, s.work_type
        FROM (
            SELECT id AS rule_id, unnest(work_type_priorities)::text AS work_type
            FROM place_schedule_rules
            WHERE work_type_priorities IS NOT NULL
        ) s
        WHERE NOT EXISTS (
            SELECT 1 FROM place_schedule_rule_work_types wt
            WHERE wt.rule_id = s.rule_id AND wt.work_type = s.work_type
        );

        ALTER TABLE place_schedule_rules DROP COLUMN work_type_priorities;
    END IF;
END $$;
