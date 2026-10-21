-- Restructure schedule rules to the typed / prioritized shape.
-- NOTE (dev stage): existing rows in the small config tables place_occupation_rules
-- and place_working_period_rules may be lost when migrating from the legacy shape;
-- recreate them after running this changeset.

-- 1. place_schedule_rule_work_types: migrate legacy VARCHAR table (from 04) or create in the new typed shape
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'place_schedule_rule_work_types'
    ) THEN
        ALTER TABLE place_schedule_rule_work_types
            ALTER COLUMN work_type TYPE work_type USING work_type::work_type;
        ALTER TABLE place_schedule_rule_work_types
            ADD COLUMN IF NOT EXISTS priority_index INTEGER;
        UPDATE place_schedule_rule_work_types wt
        SET priority_index = sub.rn - 1
        FROM (
            SELECT rule_id, work_type,
                   row_number() OVER (PARTITION BY rule_id ORDER BY work_type) AS rn
            FROM place_schedule_rule_work_types
        ) sub
        WHERE wt.rule_id = sub.rule_id AND wt.work_type = sub.work_type
          AND wt.priority_index IS NULL;
        ALTER TABLE place_schedule_rule_work_types
            ALTER COLUMN priority_index SET NOT NULL;
    ELSE
        CREATE TABLE place_schedule_rule_work_types (
            rule_id INTEGER NOT NULL REFERENCES place_schedule_rules(id) ON DELETE CASCADE,
            work_type work_type NOT NULL,
            priority_index INTEGER NOT NULL,
            UNIQUE(rule_id, work_type),
            UNIQUE(rule_id, priority_index)
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'place_schedule_rule_work_types_rule_id_work_type_key'
    ) THEN
        ALTER TABLE place_schedule_rule_work_types
            ADD CONSTRAINT place_schedule_rule_work_types_rule_id_work_type_key UNIQUE (rule_id, work_type);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'place_schedule_rule_work_types_rule_id_priority_index_key'
    ) THEN
        ALTER TABLE place_schedule_rule_work_types
            ADD CONSTRAINT place_schedule_rule_work_types_rule_id_priority_index_key UNIQUE (rule_id, priority_index);
    END IF;
END $$;

-- 2. place_schedule_rules: drop legacy columns (array priorities + person count)
ALTER TABLE place_schedule_rules DROP COLUMN IF EXISTS work_type_priorities;
ALTER TABLE place_schedule_rules DROP COLUMN IF EXISTS person_count;

-- 3. Rebuild place_occupation_rules / place_working_period_rules in the new shape,
--    but only when the legacy shape is detected (fresh databases already have it)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'place_occupation_rules' AND column_name = 'person_count'
    ) OR EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'place_working_period_rules' AND column_name = 'place_id'
    ) THEN
        DROP TABLE IF EXISTS place_working_period_rules CASCADE;
        DROP TABLE IF EXISTS place_occupation_rules CASCADE;

        CREATE TABLE place_occupation_rules (
           id SERIAL PRIMARY KEY,
           place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
           week_day INTEGER NOT NULL CHECK ( week_day >= 1 AND week_day <= 7),
           occupation_id INTEGER NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
           UNIQUE(place_id,week_day,occupation_id)
        ) INHERITS (abstract_auditable_entity);

        CREATE TABLE place_working_period_rules (
           id SERIAL PRIMARY KEY,
           occupation_rule_id INTEGER NOT NULL REFERENCES place_occupation_rules(id) ON DELETE CASCADE,
           working_period_id INTEGER NOT NULL REFERENCES working_periods(id) ON DELETE CASCADE,
           person_count INTEGER NOT NULL,
           UNIQUE(occupation_rule_id,working_period_id)
        ) INHERITS (abstract_auditable_entity);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_place_occ_rules_place_id ON place_occupation_rules(place_id);
CREATE INDEX IF NOT EXISTS idx_place_occ_rules_occ_id ON place_occupation_rules(occupation_id);
CREATE INDEX IF NOT EXISTS idx_place_occ_rules_week_day ON place_occupation_rules(week_day);
CREATE INDEX IF NOT EXISTS idx_place_wp_rules_occ_rule_id ON place_working_period_rules(occupation_rule_id);
CREATE INDEX IF NOT EXISTS idx_place_wp_rules_wp_id ON place_working_period_rules(working_period_id);

-- 4. schedule_generation_tasks: generation scope (place + target month)
ALTER TABLE schedule_generation_tasks ADD COLUMN IF NOT EXISTS place_id INTEGER REFERENCES places(id);
ALTER TABLE schedule_generation_tasks ADD COLUMN IF NOT EXISTS target_year INTEGER;
ALTER TABLE schedule_generation_tasks ADD COLUMN IF NOT EXISTS target_month INTEGER;

-- 5. schedules: link the occupation a shift was generated for
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS occupation_id INTEGER REFERENCES occupations(id);
CREATE INDEX IF NOT EXISTS idx_schedules_occupation_id ON schedules(occupation_id);
