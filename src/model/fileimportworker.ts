const StatusFileImport = `CREATE TABLE IF NOT EXISTS file_import_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL
);\n`;

const FileImport = `CREATE TABLE IF NOT EXISTS file_import (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    status_id INT NOT NULL REFERENCES file_import_status(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;


export { StatusFileImport, FileImport };