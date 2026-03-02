CREATE TABLE shortlinks (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  isPermanent INTEGER NOT NULL DEFAULT 0, -- boolean
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
