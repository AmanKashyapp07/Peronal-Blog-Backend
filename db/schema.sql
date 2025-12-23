-- Clean, portable PostgreSQL schema
-- Compatible with Render / cloud PostgreSQL

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- BLOGS TABLE
-- =========================
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER,
    author_name VARCHAR(255),
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT blogs_author_id_fkey
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- FUNCTION: Set author_name from users
-- =========================
CREATE OR REPLACE FUNCTION set_author_name_from_users()
RETURNS TRIGGER AS $$
BEGIN
    SELECT username
    INTO NEW.author_name
    FROM users
    WHERE id = NEW.author_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGER
-- =========================
CREATE TRIGGER trg_set_author_name
BEFORE INSERT ON blogs
FOR EACH ROW
EXECUTE FUNCTION set_author_name_from_users();