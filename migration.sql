-- Run this once against your EXISTING D1 database so old rows get a
-- valid updated_at value (new rows will get one automatically going forward).

ALTER TABLE terms ADD COLUMN updated_at TEXT DEFAULT (CURRENT_TIMESTAMP);
UPDATE terms SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
