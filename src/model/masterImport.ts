const masterImport = `CREATE TABLE IF NOT EXISTS master_import (
    id SERIAL PRIMARY KEY,
    author_id VARCHAR(255) NULL,
    external_id VARCHAR(255) NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    content TEXT NULL,
    url VARCHAR(255) NULL,
    published_at TIMESTAMP NULL,
    engagement INT NULL,
    CONSTRAINT unique_external_id UNIQUE (external_id),
    CONSTRAINT fk_author_id FOREIGN_KEY(author_id) REFERENCES author(id)
    CONSTRAINT fk_source_id FOREIGN_KEY(source_id) REFERENCES source_list(id)
)`;

const sourceList = `CREATE TABLE IF NOT EXIST source_list (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NULL
)`;

const Author = `CREATE TABLE IF NOT EXIST author (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NULL
)`
export {masterImport, sourceList, Author};