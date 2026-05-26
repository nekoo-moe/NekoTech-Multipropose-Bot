const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);
for (const table of tables) {
  try {
    const count = db.prepare(`SELECT count(*) as count FROM [${table.name}]`).get();
    console.log(`Table ${table.name} has ${count.count} rows`);
    if (table.name === 'giveaways') {
      const rows = db.prepare('SELECT * FROM giveaways').all();
      console.log('Giveaways data:', rows.map(r => JSON.parse(r.data)));
    }
  } catch (err) {
    console.error(err);
  }
}
