--
-- PostgreSQL database dump
--

\restrict t0S5702MOcbhbJTTG0BnxywftlqK239q7wY6gRaaGlIcSzzrlqHbzYcdbihOV3s

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text,
    "userId" integer NOT NULL,
    "postId" integer,
    "questionId" integer,
    "parentId" integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    "followerId" integer NOT NULL,
    "followingId" integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_tags (
    "postId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public.post_tags OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    "userId" integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) without time zone
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: question_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_tags (
    "questionId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public.question_tags OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    "userId" integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) without time zone
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: user_favorite_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorite_posts (
    "userId" integer NOT NULL,
    "postId" integer NOT NULL
);


ALTER TABLE public.user_favorite_posts OWNER TO postgres;

--
-- Name: user_favorite_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorite_questions (
    "userId" integer NOT NULL,
    "questionId" integer NOT NULL
);


ALTER TABLE public.user_favorite_questions OWNER TO postgres;

--
-- Name: user_like_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_like_posts (
    "userId" integer NOT NULL,
    "postId" integer NOT NULL
);


ALTER TABLE public.user_like_posts OWNER TO postgres;

--
-- Name: user_like_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_like_questions (
    "userId" integer NOT NULL,
    "questionId" integer NOT NULL
);


ALTER TABLE public.user_like_questions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    phone character varying(11) NOT NULL,
    nickname character varying(50),
    password character varying(255) NOT NULL,
    avatar character varying(255),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dd899d35-a0bc-4c0c-b61e-5ca81898e01d	d0bf29455eac9804ff663c1504715d70235cb7d18efd6d7f48168ec169d3a7ab	2026-02-14 13:19:07.196766+08	20260214051907_add_alltables	\N	\N	2026-02-14 13:19:07.117553+08	1
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, "userId", "postId", "questionId", "parentId", created_at) FROM stdin;
1	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
2	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
3	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
4	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
5	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
6	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
7	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
8	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
9	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
10	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
11	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
12	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
13	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
14	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
15	这篇文章写得太好了，受益匪浅！	8	30	\N	\N	2026-02-14 15:45:31.533293+08
16	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
17	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
18	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
19	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
20	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
21	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
22	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
23	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
24	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
25	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
26	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
27	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
28	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
29	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
30	我建议你检查一下依赖版本，或者重装一下试试。	2	\N	15	\N	2026-02-14 15:45:39.717475+08
31	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
32	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
33	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
34	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
35	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
36	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
37	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
38	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
39	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
40	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
41	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
42	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
43	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
44	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
45	我建议你检查一下依赖版本，或者重装一下试试。	4	\N	10	\N	2026-02-14 15:45:46.658856+08
46	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
47	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
48	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
49	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
50	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
51	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
52	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
53	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
54	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
55	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
56	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
57	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
58	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
59	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
60	我建议你检查一下依赖版本，或者重装一下试试。	7	\N	13	\N	2026-02-14 15:45:56.043114+08
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows ("followerId", "followingId", created_at) FROM stdin;
\.


--
-- Data for Name: post_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_tags ("postId", "tagId") FROM stdin;
3	1
3	2
3	3
3	4
6	1
6	2
6	3
6	4
9	1
9	2
9	3
9	4
12	1
12	2
12	3
12	4
15	1
15	2
15	3
15	4
18	1
18	2
18	3
18	4
21	1
21	2
21	3
21	4
24	1
24	2
24	3
24	4
27	1
27	2
27	3
27	4
30	1
30	2
30	3
30	4
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, title, content, "userId", created_at, updated_at) FROM stdin;
1	关于JavaScript的学习笔记	这是由用户 ID 1 发布的关于 JavaScript 的深度解析文章。	1	2026-02-14 15:44:29.718133+08	\N
2	关于Node.js的学习笔记	这是由用户 ID 1 发布的关于 Node.js 的深度解析文章。	1	2026-02-14 15:44:29.718133+08	\N
3	关于React的学习笔记	这是由用户 ID 1 发布的关于 React 的深度解析文章。	1	2026-02-14 15:44:29.718133+08	\N
4	关于JavaScript的学习笔记	这是由用户 ID 2 发布的关于 JavaScript 的深度解析文章。	2	2026-02-14 15:44:29.718133+08	\N
5	关于Node.js的学习笔记	这是由用户 ID 2 发布的关于 Node.js 的深度解析文章。	2	2026-02-14 15:44:29.718133+08	\N
6	关于React的学习笔记	这是由用户 ID 2 发布的关于 React 的深度解析文章。	2	2026-02-14 15:44:29.718133+08	\N
7	关于JavaScript的学习笔记	这是由用户 ID 3 发布的关于 JavaScript 的深度解析文章。	3	2026-02-14 15:44:29.718133+08	\N
8	关于Node.js的学习笔记	这是由用户 ID 3 发布的关于 Node.js 的深度解析文章。	3	2026-02-14 15:44:29.718133+08	\N
9	关于React的学习笔记	这是由用户 ID 3 发布的关于 React 的深度解析文章。	3	2026-02-14 15:44:29.718133+08	\N
10	关于JavaScript的学习笔记	这是由用户 ID 4 发布的关于 JavaScript 的深度解析文章。	4	2026-02-14 15:44:29.718133+08	\N
11	关于Node.js的学习笔记	这是由用户 ID 4 发布的关于 Node.js 的深度解析文章。	4	2026-02-14 15:44:29.718133+08	\N
12	关于React的学习笔记	这是由用户 ID 4 发布的关于 React 的深度解析文章。	4	2026-02-14 15:44:29.718133+08	\N
13	关于JavaScript的学习笔记	这是由用户 ID 5 发布的关于 JavaScript 的深度解析文章。	5	2026-02-14 15:44:29.718133+08	\N
14	关于Node.js的学习笔记	这是由用户 ID 5 发布的关于 Node.js 的深度解析文章。	5	2026-02-14 15:44:29.718133+08	\N
15	关于React的学习笔记	这是由用户 ID 5 发布的关于 React 的深度解析文章。	5	2026-02-14 15:44:29.718133+08	\N
16	关于JavaScript的学习笔记	这是由用户 ID 6 发布的关于 JavaScript 的深度解析文章。	6	2026-02-14 15:44:29.718133+08	\N
17	关于Node.js的学习笔记	这是由用户 ID 6 发布的关于 Node.js 的深度解析文章。	6	2026-02-14 15:44:29.718133+08	\N
18	关于React的学习笔记	这是由用户 ID 6 发布的关于 React 的深度解析文章。	6	2026-02-14 15:44:29.718133+08	\N
19	关于JavaScript的学习笔记	这是由用户 ID 7 发布的关于 JavaScript 的深度解析文章。	7	2026-02-14 15:44:29.718133+08	\N
20	关于Node.js的学习笔记	这是由用户 ID 7 发布的关于 Node.js 的深度解析文章。	7	2026-02-14 15:44:29.718133+08	\N
21	关于React的学习笔记	这是由用户 ID 7 发布的关于 React 的深度解析文章。	7	2026-02-14 15:44:29.718133+08	\N
22	关于JavaScript的学习笔记	这是由用户 ID 8 发布的关于 JavaScript 的深度解析文章。	8	2026-02-14 15:44:29.718133+08	\N
23	关于Node.js的学习笔记	这是由用户 ID 8 发布的关于 Node.js 的深度解析文章。	8	2026-02-14 15:44:29.718133+08	\N
24	关于React的学习笔记	这是由用户 ID 8 发布的关于 React 的深度解析文章。	8	2026-02-14 15:44:29.718133+08	\N
25	关于JavaScript的学习笔记	这是由用户 ID 9 发布的关于 JavaScript 的深度解析文章。	9	2026-02-14 15:44:29.718133+08	\N
26	关于Node.js的学习笔记	这是由用户 ID 9 发布的关于 Node.js 的深度解析文章。	9	2026-02-14 15:44:29.718133+08	\N
27	关于React的学习笔记	这是由用户 ID 9 发布的关于 React 的深度解析文章。	9	2026-02-14 15:44:29.718133+08	\N
28	关于JavaScript的学习笔记	这是由用户 ID 10 发布的关于 JavaScript 的深度解析文章。	10	2026-02-14 15:44:29.718133+08	\N
29	关于Node.js的学习笔记	这是由用户 ID 10 发布的关于 Node.js 的深度解析文章。	10	2026-02-14 15:44:29.718133+08	\N
30	关于React的学习笔记	这是由用户 ID 10 发布的关于 React 的深度解析文章。	10	2026-02-14 15:44:29.718133+08	\N
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_tags ("questionId", "tagId") FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, title, "userId", created_at, updated_at) FROM stdin;
1	为什么我的JavaScript代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
2	为什么我的Node.js代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
3	为什么我的React代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
4	为什么我的TypeScript代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
5	为什么我的数据库代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
6	为什么我的狗熊岭日常代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
7	为什么我的职场经验代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
8	为什么我的Bug求助代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
9	为什么我的闲聊代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
10	为什么我的架构设计代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
11	为什么我的Go代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
12	为什么我的Rust代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
13	为什么我的JavaScript代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
14	为什么我的Node.js代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
15	为什么我的React代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
16	为什么我的TypeScript代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
17	为什么我的数据库代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
18	为什么我的狗熊岭日常代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
19	为什么我的职场经验代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
20	为什么我的Bug求助代码跑不起来？	8	2026-02-14 15:45:17.096275+08	\N
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name) FROM stdin;
1	JavaScript
2	Node.js
3	React
4	TypeScript
5	数据库
6	狗熊岭日常
7	职场经验
8	Bug求助
9	闲聊
10	架构设计
11	Go
12	Rust
\.


--
-- Data for Name: user_favorite_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favorite_posts ("userId", "postId") FROM stdin;
\.


--
-- Data for Name: user_favorite_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favorite_questions ("userId", "questionId") FROM stdin;
\.


--
-- Data for Name: user_like_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_like_posts ("userId", "postId") FROM stdin;
\.


--
-- Data for Name: user_like_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_like_questions ("userId", "questionId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, phone, nickname, password, avatar, created_at, updated_at) FROM stdin;
1	15179059079	admin	$2b$10$oIblqBB68C.DUK2NaSk5H.ql5SBKHmg3iYKHRHlYxQ9R6q28n3I6K	\N	2026-02-14 15:36:17.24+08	2026-02-14 15:36:17.24+08
2	15100000001	光头强	$2b$10$f4jvHmbjbklLKhTAVtd97.fR/wIdQTUiQ0Yo3WdQSygC.Avk2Gt.u	\N	2026-02-14 15:38:52.925+08	2026-02-14 15:38:52.925+08
3	15100000002	熊二	$2b$10$tbNMODAs2Nc5B9Fu.tky..Ak9tvr3QPDy0GSfTLvQZCmPrKYrs3au	\N	2026-02-14 15:39:04.543+08	2026-02-14 15:39:04.543+08
4	15100000003	熊大	$2b$10$3mzCjmRpPyc7alW/ScTVhOQ72yN7VV2Lq5GwYXR9zrc1Xk1dKzbYG	\N	2026-02-14 15:39:17.222+08	2026-02-14 15:39:17.222+08
5	15100000004	吉吉	$2b$10$B0p5zQa0K/V..9c21Pr2nuhkpQG/Pf24U/qg/nKbwo3iK/LUVpoK6	\N	2026-02-14 15:39:27.914+08	2026-02-14 15:39:27.914+08
6	15100000005	毛毛	$2b$10$hwoscbQbpP0RSM42MFqp3ebB.pgCa3WpQBYXRnRfg3UnjwuQ1K17m	\N	2026-02-14 15:39:36.621+08	2026-02-14 15:39:36.621+08
7	15100000006	蹦蹦	$2b$10$BFvIz/qtqQcAuO4NBnxvNeIM9I4rb2yeOEIBZ97/wGoYj99bC7MRe	\N	2026-02-14 15:39:45.609+08	2026-02-14 15:39:45.609+08
8	15100000007	萝卜头	$2b$10$pgbzRF1waEzBtulxn4JZbOXY/giaYUpf0V6uCtGvs05FrE2nrcl3m	\N	2026-02-14 15:39:54.25+08	2026-02-14 15:39:54.25+08
9	15100000008	老鳄	$2b$10$isBAYDuXf9Yk1ie6rlW.huD/mR.OmQu8soIeSyLmq5OwbinIVYoZy	\N	2026-02-14 15:40:08.525+08	2026-02-14 15:40:08.525+08
10	15100000009	托托	$2b$10$64ayRSfDR5CDCQIpddQsauujBXhL50TDq0d9Yfgv4e0c5hYo6ruAC	\N	2026-02-14 15:40:19.568+08	2026-02-14 15:40:19.568+08
12	15100000010	铁掌大师	$2b$10$GtJRthviu4cTxsFC8I5Sne4Xplb5nm/xgSkjWcHqMZX85F/RyFRem	\N	2026-02-14 15:40:42.009+08	2026-02-14 15:40:42.009+08
13	15100000011	高启强	$2b$10$JDRBYqn3aYWByxlMqA5sduNYQDdXeKd.P0DxmhH38txR4U3ySsXl6	\N	2026-02-14 15:41:00.379+08	2026-02-14 15:41:00.379+08
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 60, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 30, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 20, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY ("followerId", "followingId");


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY ("postId", "tagId");


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: question_tags question_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_pkey PRIMARY KEY ("questionId", "tagId");


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_favorite_posts user_favorite_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_posts
    ADD CONSTRAINT user_favorite_posts_pkey PRIMARY KEY ("userId", "postId");


--
-- Name: user_favorite_questions user_favorite_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_questions
    ADD CONSTRAINT user_favorite_questions_pkey PRIMARY KEY ("userId", "questionId");


--
-- Name: user_like_posts user_like_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_posts
    ADD CONSTRAINT user_like_posts_pkey PRIMARY KEY ("userId", "postId");


--
-- Name: user_like_questions user_like_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_questions
    ADD CONSTRAINT user_like_questions_pkey PRIMARY KEY ("userId", "questionId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: comments_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_parentId_idx" ON public.comments USING btree ("parentId");


--
-- Name: comments_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_postId_idx" ON public.comments USING btree ("postId");


--
-- Name: comments_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_questionId_idx" ON public.comments USING btree ("questionId");


--
-- Name: comments_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "comments_userId_idx" ON public.comments USING btree ("userId");


--
-- Name: follows_followerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "follows_followerId_idx" ON public.follows USING btree ("followerId");


--
-- Name: follows_followingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "follows_followingId_idx" ON public.follows USING btree ("followingId");


--
-- Name: post_tags_tagId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "post_tags_tagId_idx" ON public.post_tags USING btree ("tagId");


--
-- Name: posts_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "posts_userId_idx" ON public.posts USING btree ("userId");


--
-- Name: question_tags_tagId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "question_tags_tagId_idx" ON public.question_tags USING btree ("tagId");


--
-- Name: questions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "questions_userId_idx" ON public.questions USING btree ("userId");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: user_favorite_posts_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_favorite_posts_postId_idx" ON public.user_favorite_posts USING btree ("postId");


--
-- Name: user_favorite_questions_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_favorite_questions_questionId_idx" ON public.user_favorite_questions USING btree ("questionId");


--
-- Name: user_like_posts_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_like_posts_postId_idx" ON public.user_like_posts USING btree ("postId");


--
-- Name: user_like_questions_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_like_questions_questionId_idx" ON public.user_like_questions USING btree ("questionId");


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: comments comments_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: follows follows_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: follows follows_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_tags post_tags_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_tags question_tags_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT "question_tags_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: question_tags question_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT "question_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: questions questions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_favorite_posts user_favorite_posts_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_posts
    ADD CONSTRAINT "user_favorite_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favorite_posts user_favorite_posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_posts
    ADD CONSTRAINT "user_favorite_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favorite_questions user_favorite_questions_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_questions
    ADD CONSTRAINT "user_favorite_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favorite_questions user_favorite_questions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_questions
    ADD CONSTRAINT "user_favorite_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_like_posts user_like_posts_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_posts
    ADD CONSTRAINT "user_like_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_like_posts user_like_posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_posts
    ADD CONSTRAINT "user_like_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_like_questions user_like_questions_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_questions
    ADD CONSTRAINT "user_like_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_like_questions user_like_questions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_questions
    ADD CONSTRAINT "user_like_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict t0S5702MOcbhbJTTG0BnxywftlqK239q7wY6gRaaGlIcSzzrlqHbzYcdbihOV3s

