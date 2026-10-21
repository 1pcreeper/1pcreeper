ALTER TABLE schedules ADD COLUMN IF NOT EXISTS working_period_id INTEGER REFERENCES working_periods(id);

UPDATE schedules s SET working_period_id = (
    SELECT wp.id
    FROM working_periods wp
    JOIN places p ON p.depart_id = wp.depart_id
    WHERE p.id = s.place_id
    ORDER BY wp.id
    LIMIT 1
) WHERE working_period_id IS NULL;

UPDATE schedules SET working_period_id = (SELECT MIN(id) FROM working_periods) WHERE working_period_id IS NULL;

ALTER TABLE schedules ALTER COLUMN working_period_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_working_period_id ON schedules(working_period_id);
