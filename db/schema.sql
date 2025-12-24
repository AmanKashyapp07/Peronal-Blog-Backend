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
-- =========================
-- COMMENTS TABLE
-- =========================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

ALTER TABLE comments
ADD CONSTRAINT comments_blog_id_fkey
FOREIGN KEY (blog_id)
REFERENCES blogs(id)
ON DELETE CASCADE;


ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION set_comment_username_from_users()
RETURNS TRIGGER AS $$
BEGIN
    SELECT username
    INTO NEW.username
    FROM users
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_set_comment_username
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION set_comment_username_from_users();