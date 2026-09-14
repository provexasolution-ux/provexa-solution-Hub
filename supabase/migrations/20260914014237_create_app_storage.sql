
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_app_data" ON app_data FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_app_data" ON app_data FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_app_data" ON app_data FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_app_data" ON app_data FOR DELETE
  TO anon, authenticated USING (true);
