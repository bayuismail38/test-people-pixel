const masterImport = `CREATE TABLE IF NOT EXISTS master_import (
    id SERIAL PRIMARY KEY,
    author_id int NULL,
    external_id VARCHAR(255) NOT NULL,
    source_id int NOT NULL,
    title VARCHAR(255) NULL,
    content TEXT NULL,
    url VARCHAR(255) NULL,
    published_at TIMESTAMP NULL,
    engagement INT NULL,
    CONSTRAINT unique_external_id UNIQUE (external_id),
    CONSTRAINT fk_author_id FOREIGN KEY(author_id) REFERENCES author(id) ON DELETE CASCADE,
    CONSTRAINT fk_source_id FOREIGN KEY(source_id) REFERENCES source_list(id) ON DELETE CASCADE
);\n`;

const sourceList = `CREATE TABLE IF NOT EXISTS source_list (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NULL
);\n`;

const Author = `CREATE TABLE IF NOT EXISTS author (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NULL
);\n`
export {masterImport, sourceList, Author};