const masterImport = `CREATE TABLE IF NOT EXISTS master_import (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255) NULL,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    content TEXT NULL,
    url VARCHAR(255) NULL,
    published_at TIMESTAMP NULL,
    engagement INT NULL,
    CONSTRAINT unique_external_id UNIQUE (external_id) 
)`;

export {masterImport};