const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('micro-blog.db');

const query = `
    CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    createDate TEXT,
    author TEXT)`

database.run(query)

module.exports = {
    database
}
