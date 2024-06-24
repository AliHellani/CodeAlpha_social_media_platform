const sql = require('mssql');

const dbConfig = {
    server: "AH",
    port: 1433,
    database: "social-media",
    user: "as",
    password: "MSsql1234",
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
};

const pool = new sql.ConnectionPool(dbConfig);

module.exports = pool;