/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const initDb = (db) => {
  const init = db.prepare(`CREATE TABLE if not exists notes (
    title TEXT,
    about TEXT,
    body JSON,
    cover TEXT,
    created_at TEXT,
    updated_at TEXT
    )`
  );

  init.run();
}

const getNotes = function(db) {
  const query = db.prepare(`SELECT rowid, * FROM notes ORDER BY updated_at DESC`)
  return query.all().map(item => ({
    ...item,
    body: JSON.parse(item.body)
  }))
};

const storeNote = function(db, title) {
  const query = db.prepare(`INSERT INTO notes VALUES (?, NULL, NULL, NULL, datetime('now', 'localtime'), datetime('now', 'localtime'))`)
  return query.run(title)
};

const deleteNote = function(db, rowId) {
  const query = db.prepare(`DELETE FROM notes WHERE rowid=?`)
  return query.run(rowId)
};

const updateNote = function(db, rowId, title, about, body, cover) {
  const query = db.prepare(`UPDATE notes SET title=?, about=?, body=?, cover=?, updated_at=datetime('now', 'localtime') WHERE rowid=?`)
  return query.run(title, about, body, cover, rowId)
};

export { initDb, getNotes, storeNote, deleteNote, updateNote }