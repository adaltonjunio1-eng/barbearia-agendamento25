const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err);
      } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        this.initTables();
      }
    });
  }

  initTables() {
    this.db.serialize(() => {
      // Tabela de agendamentos
      this.db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente TEXT NOT NULL,
          telefone TEXT NOT NULL,
          servicoId INTEGER NOT NULL,
          servicoNome TEXT NOT NULL,
          valor REAL NOT NULL,
          duracao INTEGER NOT NULL,
          hora TEXT NOT NULL,
          dataISO TEXT NOT NULL,
          status TEXT DEFAULT 'Pendente',
          reminderSent INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de logs de lembretes
      this.db.run(`
        CREATE TABLE IF NOT EXISTS reminder_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookingId INTEGER NOT NULL,
          sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL,
          message TEXT,
          FOREIGN KEY (bookingId) REFERENCES bookings(id)
        )
      `);

      // Tabela de configurações
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tabelas do banco de dados inicializadas');
    });
  }

  // Wrapper para queries assíncronas
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();
