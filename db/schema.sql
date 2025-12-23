--
-- PostgreSQL database dump
--

\restrict nXfPitAho0yACYqefymP5bu9h7QMPW1bzPHmvtfdVGb93t57Ab0PJxAAgNniaj1

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_author_name_from_users(); Type: FUNCTION; Schema: public; Owner: amankashyap
--

CREATE FUNCTION public.set_author_name_from_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT username
  INTO NEW.author_name
  FROM users
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_author_name_from_users() OWNER TO amankashyap;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: amankashyap
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    author_id integer,
    published boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    author_name character varying(255)
);


ALTER TABLE public.blogs OWNER TO amankashyap;

--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: amankashyap
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blogs_id_seq OWNER TO amankashyap;

--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amankashyap
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: amankashyap
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO amankashyap;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: amankashyap
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO amankashyap;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amankashyap
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: blogs trg_set_author_name; Type: TRIGGER; Schema: public; Owner: amankashyap
--

CREATE TRIGGER trg_set_author_name BEFORE INSERT ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.set_author_name_from_users();


--
-- Name: blogs blogs_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blogs fk_blogs_author; Type: FK CONSTRAINT; Schema: public; Owner: amankashyap
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT fk_blogs_author FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict nXfPitAho0yACYqefymP5bu9h7QMPW1bzPHmvtfdVGb93t57Ab0PJxAAgNniaj1

