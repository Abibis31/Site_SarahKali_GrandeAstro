// database.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'chat_history.db');

export class ChatDatabase {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH);
        this.init();
    }

    init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Erro ao criar tabela:', err);
            } else {
                console.log('✅ Database de conversas inicializado');
            }
        });
    }

    async addMessage(sessionId, role, content) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO conversations (session_id, role, content) VALUES (?, ?, ?)`,
                [sessionId, role, content],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async getConversationHistory(sessionId, limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT role, content FROM conversations 
                 WHERE session_id = ? 
                 ORDER BY timestamp ASC 
                 LIMIT ?`,
                [sessionId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // ✅ NOVO: Buscar comprovantes por session
    async getComprovantes(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT content FROM conversations 
                 WHERE session_id = ? AND role = 'comprovante'
                 ORDER BY timestamp DESC`,
                [sessionId],
                (err, rows) => {
                    if (err) reject(err);
                    else {
                        const comprovantes = rows.map(row => JSON.parse(row.content));
                        resolve(comprovantes);
                    }
                }
            );
        });
    }

    // Método para fechar a conexão (opcional)
    close() {
        this.db.close();
    }
}