CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  permanent INTEGER NOT NULL DEFAULT 0, -- boolean
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE slugs (
  slug TEXT PRIMARY KEY,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  is_primary INTEGER NOT NULL DEFAULT 0, -- boolean, marks 'canonical' slug vs alias
  careated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_slugs_link_id ON slugs(link_id);
