const masterImport = `CREATE TABLE IF NOT EXISTS master_import (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    content LONGTEXT NULL,
    url VARCHAR(255) NULL,
    published_at DATETIME NULL,
    engagement INT NULL,
    UNIQUE KEY unique_external_id (external_id, source)
)`