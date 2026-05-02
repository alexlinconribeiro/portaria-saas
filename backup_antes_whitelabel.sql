--
-- PostgreSQL database dump
--

\restrict vhD6XmU2dIV9kY3ckAFYRqxlv22kYvPjq7iC2OgnJpCxDNYqznOxFoMxXe2SC3s

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: portaria
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO portaria;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: portaria
--

COMMENT ON SCHEMA public IS '';


--
-- Name: PerfilUsuario; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."PerfilUsuario" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN_CONDOMINIO',
    'PORTARIA',
    'TECNICO',
    'MORADOR'
);


ALTER TYPE public."PerfilUsuario" OWNER TO portaria;

--
-- Name: StatusAcesso; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."StatusAcesso" AS ENUM (
    'AUTORIZADO',
    'NEGADO',
    'PENDENTE'
);


ALTER TYPE public."StatusAcesso" OWNER TO portaria;

--
-- Name: StatusVisita; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."StatusVisita" AS ENUM (
    'PENDENTE',
    'AUTORIZADO',
    'NEGADO',
    'EM_ANDAMENTO',
    'FINALIZADO',
    'CANCELADO'
);


ALTER TYPE public."StatusVisita" OWNER TO portaria;

--
-- Name: TemaUsuario; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TemaUsuario" AS ENUM (
    'ESCURO',
    'CLARO'
);


ALTER TYPE public."TemaUsuario" OWNER TO portaria;

--
-- Name: TipoAcesso; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoAcesso" AS ENUM (
    'FACIAL',
    'TAG',
    'SENHA',
    'VISITANTE_IA',
    'VISITANTE_MANUAL'
);


ALTER TYPE public."TipoAcesso" OWNER TO portaria;

--
-- Name: TipoAcionamentoPortao; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoAcionamentoPortao" AS ENUM (
    'SIMULADO',
    'HTTP',
    'RELE',
    'API'
);


ALTER TYPE public."TipoAcionamentoPortao" OWNER TO portaria;

--
-- Name: TipoCredencial; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoCredencial" AS ENUM (
    'FACIAL',
    'TAG',
    'SENHA'
);


ALTER TYPE public."TipoCredencial" OWNER TO portaria;

--
-- Name: TipoEmpresa; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoEmpresa" AS ENUM (
    'TERCEIRIZADA',
    'PRESTADORA',
    'FORNECEDOR'
);


ALTER TYPE public."TipoEmpresa" OWNER TO portaria;

--
-- Name: TipoPessoa; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoPessoa" AS ENUM (
    'MORADOR',
    'FUNCIONARIO',
    'TERCEIRO',
    'PRESTADOR',
    'VISITANTE',
    'SINDICO',
    'ADMINISTRADOR'
);


ALTER TYPE public."TipoPessoa" OWNER TO portaria;

--
-- Name: TipoVisita; Type: TYPE; Schema: public; Owner: portaria
--

CREATE TYPE public."TipoVisita" AS ENUM (
    'AVULSA',
    'AGENDADA',
    'PRESTADOR',
    'ENTREGA'
);


ALTER TYPE public."TipoVisita" OWNER TO portaria;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Condominio; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Condominio" (
    id integer NOT NULL,
    nome text NOT NULL,
    documento text,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bairro text,
    cep text,
    cidade text,
    email text,
    endereco text,
    estado text,
    numero text,
    responsavel text,
    telefone text
);


ALTER TABLE public."Condominio" OWNER TO portaria;

--
-- Name: CondominioModulo; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."CondominioModulo" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "moduloId" integer NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public."CondominioModulo" OWNER TO portaria;

--
-- Name: CondominioModulo_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."CondominioModulo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CondominioModulo_id_seq" OWNER TO portaria;

--
-- Name: CondominioModulo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."CondominioModulo_id_seq" OWNED BY public."CondominioModulo".id;


--
-- Name: Condominio_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Condominio_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Condominio_id_seq" OWNER TO portaria;

--
-- Name: Condominio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Condominio_id_seq" OWNED BY public."Condominio".id;


--
-- Name: Configuracao; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Configuracao" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "tempoMaximoPermanenciaHoras" integer DEFAULT 12 NOT NULL,
    "permitirEntradaSemAutorizacao" boolean DEFAULT false NOT NULL,
    "exigirUnidade" boolean DEFAULT true NOT NULL,
    "exigirMoradorResponsavel" boolean DEFAULT true NOT NULL,
    "abrirPortaoAutomaticamente" boolean DEFAULT false NOT NULL,
    "registrarEntradaAutomaticamente" boolean DEFAULT true NOT NULL,
    "exigirConfirmacaoPorteiro" boolean DEFAULT true NOT NULL,
    "permitirEntradaDireta" boolean DEFAULT false NOT NULL,
    "tipoAcionamentoPortao" public."TipoAcionamentoPortao" DEFAULT 'SIMULADO'::public."TipoAcionamentoPortao" NOT NULL,
    "ipDispositivoPortao" text,
    "portaDispositivoPortao" integer,
    "tempoAberturaSegundos" integer DEFAULT 2 NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "atualizadoEm" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Configuracao" OWNER TO portaria;

--
-- Name: Configuracao_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Configuracao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Configuracao_id_seq" OWNER TO portaria;

--
-- Name: Configuracao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Configuracao_id_seq" OWNED BY public."Configuracao".id;


--
-- Name: CredencialAcesso; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."CredencialAcesso" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "moradorId" integer NOT NULL,
    tipo public."TipoCredencial" NOT NULL,
    identificador text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pessoaId" integer
);


ALTER TABLE public."CredencialAcesso" OWNER TO portaria;

--
-- Name: CredencialAcesso_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."CredencialAcesso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CredencialAcesso_id_seq" OWNER TO portaria;

--
-- Name: CredencialAcesso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."CredencialAcesso_id_seq" OWNED BY public."CredencialAcesso".id;


--
-- Name: Dispositivo; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Dispositivo" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    nome text NOT NULL,
    tipo text NOT NULL,
    ip text,
    localizacao text,
    ativo boolean DEFAULT true NOT NULL,
    config jsonb,
    fabricante text,
    modelo text,
    porta integer,
    senha text,
    status text DEFAULT 'DESCONHECIDO'::text,
    "ultimoCheck" timestamp(3) without time zone,
    usuario text
);


ALTER TABLE public."Dispositivo" OWNER TO portaria;

--
-- Name: Dispositivo_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Dispositivo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Dispositivo_id_seq" OWNER TO portaria;

--
-- Name: Dispositivo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Dispositivo_id_seq" OWNED BY public."Dispositivo".id;


--
-- Name: EmpresaTerceira; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."EmpresaTerceira" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    nome text NOT NULL,
    documento text,
    telefone text,
    email text,
    tipo public."TipoEmpresa" NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmpresaTerceira" OWNER TO portaria;

--
-- Name: EmpresaTerceira_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."EmpresaTerceira_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmpresaTerceira_id_seq" OWNER TO portaria;

--
-- Name: EmpresaTerceira_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."EmpresaTerceira_id_seq" OWNED BY public."EmpresaTerceira".id;


--
-- Name: EventoAcesso; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."EventoAcesso" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "moradorId" integer,
    "dispositivoId" integer,
    tipo public."TipoAcesso" NOT NULL,
    origem text,
    nome text,
    unidade text,
    status public."StatusAcesso" NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pessoaId" integer
);


ALTER TABLE public."EventoAcesso" OWNER TO portaria;

--
-- Name: EventoAcesso_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."EventoAcesso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventoAcesso_id_seq" OWNER TO portaria;

--
-- Name: EventoAcesso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."EventoAcesso_id_seq" OWNED BY public."EventoAcesso".id;


--
-- Name: Modulo; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Modulo" (
    id integer NOT NULL,
    chave text NOT NULL,
    nome text NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    ordem integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Modulo" OWNER TO portaria;

--
-- Name: Modulo_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Modulo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Modulo_id_seq" OWNER TO portaria;

--
-- Name: Modulo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Modulo_id_seq" OWNED BY public."Modulo".id;


--
-- Name: Morador; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Morador" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "unidadeId" integer NOT NULL,
    nome text NOT NULL,
    telefone text,
    email text,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Morador" OWNER TO portaria;

--
-- Name: Morador_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Morador_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Morador_id_seq" OWNER TO portaria;

--
-- Name: Morador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Morador_id_seq" OWNED BY public."Morador".id;


--
-- Name: PerfilPermissao; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."PerfilPermissao" (
    id integer NOT NULL,
    perfil public."PerfilUsuario" NOT NULL,
    "permissaoId" integer NOT NULL
);


ALTER TABLE public."PerfilPermissao" OWNER TO portaria;

--
-- Name: PerfilPermissao_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."PerfilPermissao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PerfilPermissao_id_seq" OWNER TO portaria;

--
-- Name: PerfilPermissao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."PerfilPermissao_id_seq" OWNED BY public."PerfilPermissao".id;


--
-- Name: Permissao; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Permissao" (
    id integer NOT NULL,
    chave text NOT NULL,
    descricao text
);


ALTER TABLE public."Permissao" OWNER TO portaria;

--
-- Name: Permissao_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Permissao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Permissao_id_seq" OWNER TO portaria;

--
-- Name: Permissao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Permissao_id_seq" OWNED BY public."Permissao".id;


--
-- Name: Pessoa; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Pessoa" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "empresaId" integer,
    nome text NOT NULL,
    documento text,
    telefone text,
    email text,
    tipo public."TipoPessoa" NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    funcao text,
    observacao text,
    rg text,
    "validadeFim" timestamp(3) without time zone,
    "validadeInicio" timestamp(3) without time zone
);


ALTER TABLE public."Pessoa" OWNER TO portaria;

--
-- Name: PessoaUnidade; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."PessoaUnidade" (
    id integer NOT NULL,
    "pessoaId" integer NOT NULL,
    "unidadeId" integer NOT NULL,
    relacao text,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PessoaUnidade" OWNER TO portaria;

--
-- Name: PessoaUnidade_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."PessoaUnidade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PessoaUnidade_id_seq" OWNER TO portaria;

--
-- Name: PessoaUnidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."PessoaUnidade_id_seq" OWNED BY public."PessoaUnidade".id;


--
-- Name: Pessoa_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Pessoa_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pessoa_id_seq" OWNER TO portaria;

--
-- Name: Pessoa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Pessoa_id_seq" OWNED BY public."Pessoa".id;


--
-- Name: Unidade; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Unidade" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    identificacao text NOT NULL,
    bloco text,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Unidade" OWNER TO portaria;

--
-- Name: Unidade_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Unidade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Unidade_id_seq" OWNER TO portaria;

--
-- Name: Unidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Unidade_id_seq" OWNED BY public."Unidade".id;


--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Usuario" (
    id integer NOT NULL,
    "condominioId" integer,
    nome text NOT NULL,
    email text NOT NULL,
    "senhaHash" text NOT NULL,
    perfil public."PerfilUsuario" NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tema public."TemaUsuario" DEFAULT 'ESCURO'::public."TemaUsuario" NOT NULL
);


ALTER TABLE public."Usuario" OWNER TO portaria;

--
-- Name: Usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Usuario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Usuario_id_seq" OWNER TO portaria;

--
-- Name: Usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Usuario_id_seq" OWNED BY public."Usuario".id;


--
-- Name: Visita; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Visita" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    "visitanteId" integer,
    "unidadeId" integer,
    "nomeVisitante" text NOT NULL,
    motivo text,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "autorizadoEm" timestamp(3) without time zone,
    "atualizadoEm" timestamp(3) without time zone NOT NULL,
    "autorizadoPorId" integer,
    "canceladoEm" timestamp(3) without time zone,
    "dataPrevista" timestamp(3) without time zone,
    "dispositivoId" integer,
    documento text,
    "entradaEm" timestamp(3) without time zone,
    "negadoEm" timestamp(3) without time zone,
    observacao text,
    "saidaEm" timestamp(3) without time zone,
    telefone text,
    tipo public."TipoVisita" DEFAULT 'AVULSA'::public."TipoVisita" NOT NULL,
    status public."StatusVisita" DEFAULT 'PENDENTE'::public."StatusVisita" NOT NULL,
    "autorizadoPorPessoaId" integer,
    "pessoaResponsavelId" integer
);


ALTER TABLE public."Visita" OWNER TO portaria;

--
-- Name: Visita_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Visita_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Visita_id_seq" OWNER TO portaria;

--
-- Name: Visita_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Visita_id_seq" OWNED BY public."Visita".id;


--
-- Name: Visitante; Type: TABLE; Schema: public; Owner: portaria
--

CREATE TABLE public."Visitante" (
    id integer NOT NULL,
    "condominioId" integer NOT NULL,
    nome text NOT NULL,
    documento text,
    telefone text,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Visitante" OWNER TO portaria;

--
-- Name: Visitante_id_seq; Type: SEQUENCE; Schema: public; Owner: portaria
--

CREATE SEQUENCE public."Visitante_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Visitante_id_seq" OWNER TO portaria;

--
-- Name: Visitante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: portaria
--

ALTER SEQUENCE public."Visitante_id_seq" OWNED BY public."Visitante".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: portaria
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


ALTER TABLE public._prisma_migrations OWNER TO portaria;

--
-- Name: Condominio id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Condominio" ALTER COLUMN id SET DEFAULT nextval('public."Condominio_id_seq"'::regclass);


--
-- Name: CondominioModulo id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CondominioModulo" ALTER COLUMN id SET DEFAULT nextval('public."CondominioModulo_id_seq"'::regclass);


--
-- Name: Configuracao id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Configuracao" ALTER COLUMN id SET DEFAULT nextval('public."Configuracao_id_seq"'::regclass);


--
-- Name: CredencialAcesso id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CredencialAcesso" ALTER COLUMN id SET DEFAULT nextval('public."CredencialAcesso_id_seq"'::regclass);


--
-- Name: Dispositivo id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Dispositivo" ALTER COLUMN id SET DEFAULT nextval('public."Dispositivo_id_seq"'::regclass);


--
-- Name: EmpresaTerceira id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EmpresaTerceira" ALTER COLUMN id SET DEFAULT nextval('public."EmpresaTerceira_id_seq"'::regclass);


--
-- Name: EventoAcesso id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso" ALTER COLUMN id SET DEFAULT nextval('public."EventoAcesso_id_seq"'::regclass);


--
-- Name: Modulo id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Modulo" ALTER COLUMN id SET DEFAULT nextval('public."Modulo_id_seq"'::regclass);


--
-- Name: Morador id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Morador" ALTER COLUMN id SET DEFAULT nextval('public."Morador_id_seq"'::regclass);


--
-- Name: PerfilPermissao id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PerfilPermissao" ALTER COLUMN id SET DEFAULT nextval('public."PerfilPermissao_id_seq"'::regclass);


--
-- Name: Permissao id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Permissao" ALTER COLUMN id SET DEFAULT nextval('public."Permissao_id_seq"'::regclass);


--
-- Name: Pessoa id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Pessoa" ALTER COLUMN id SET DEFAULT nextval('public."Pessoa_id_seq"'::regclass);


--
-- Name: PessoaUnidade id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PessoaUnidade" ALTER COLUMN id SET DEFAULT nextval('public."PessoaUnidade_id_seq"'::regclass);


--
-- Name: Unidade id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Unidade" ALTER COLUMN id SET DEFAULT nextval('public."Unidade_id_seq"'::regclass);


--
-- Name: Usuario id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Usuario" ALTER COLUMN id SET DEFAULT nextval('public."Usuario_id_seq"'::regclass);


--
-- Name: Visita id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita" ALTER COLUMN id SET DEFAULT nextval('public."Visita_id_seq"'::regclass);


--
-- Name: Visitante id; Type: DEFAULT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visitante" ALTER COLUMN id SET DEFAULT nextval('public."Visitante_id_seq"'::regclass);


--
-- Data for Name: Condominio; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Condominio" (id, nome, documento, ativo, "criadoEm", bairro, cep, cidade, email, endereco, estado, numero, responsavel, telefone) FROM stdin;
1	Condomínio Teste	00.000.000/0001-00	t	2026-04-26 13:01:27.586	\N	\N	Florianópolis	\N	\N	\N	\N	\N	48999999999
\.


--
-- Data for Name: CondominioModulo; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."CondominioModulo" (id, "condominioId", "moduloId", ativo) FROM stdin;
2	1	2	t
3	1	3	t
4	1	4	t
5	1	5	t
6	1	6	t
8	1	8	t
9	1	9	t
10	1	10	t
7	1	7	f
1	1	1	t
\.


--
-- Data for Name: Configuracao; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Configuracao" (id, "condominioId", "tempoMaximoPermanenciaHoras", "permitirEntradaSemAutorizacao", "exigirUnidade", "exigirMoradorResponsavel", "abrirPortaoAutomaticamente", "registrarEntradaAutomaticamente", "exigirConfirmacaoPorteiro", "permitirEntradaDireta", "tipoAcionamentoPortao", "ipDispositivoPortao", "portaDispositivoPortao", "tempoAberturaSegundos", "criadoEm", "atualizadoEm") FROM stdin;
1	1	12	f	t	t	f	t	t	f	SIMULADO	\N	\N	2	2026-04-28 15:16:14.719	2026-04-30 18:12:38.721
\.


--
-- Data for Name: CredencialAcesso; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."CredencialAcesso" (id, "condominioId", "moradorId", tipo, identificador, ativo, "criadoEm", "pessoaId") FROM stdin;
1	1	1	FACIAL	face_123456	t	2026-04-26 13:17:08.717	\N
2	1	1	TAG	04:BF:1B:A9:9A:A1	t	2026-04-26 13:19:39.774	\N
\.


--
-- Data for Name: Dispositivo; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Dispositivo" (id, "condominioId", nome, tipo, ip, localizacao, ativo, config, fabricante, modelo, porta, senha, status, "ultimoCheck", usuario) FROM stdin;
1	1	TESTE	LEITOR_FACIAL	172.30.10.117	\N	t	null	INTELBRAS	SS 3530	80	\N	OFFLINE	2026-04-30 12:12:01.572	\N
\.


--
-- Data for Name: EmpresaTerceira; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."EmpresaTerceira" (id, "condominioId", nome, documento, telefone, email, tipo, ativo, "criadoEm") FROM stdin;
\.


--
-- Data for Name: EventoAcesso; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."EventoAcesso" (id, "condominioId", "moradorId", "dispositivoId", tipo, origem, nome, unidade, status, "criadoEm", "pessoaId") FROM stdin;
1	1	1	\N	FACIAL	Portaria Principal	Alex Ribeiro		AUTORIZADO	2026-04-26 13:21:57.893	\N
2	1	1	\N	FACIAL	Portaria Principal	Alex Ribeiro	A 302	AUTORIZADO	2026-04-26 13:35:49.552	\N
3	1	1	\N	FACIAL	Portaria Principal	Alex Ribeiro	A 302	AUTORIZADO	2026-04-26 16:15:47.725	\N
4	1	\N	\N	VISITANTE_MANUAL	VISITANTES	João	302	AUTORIZADO	2026-04-28 14:03:54.587	1
5	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Teste Pessoa	302	AUTORIZADO	2026-04-28 14:22:36.597	1
6	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Bruna	302	AUTORIZADO	2026-04-28 14:28:25.577	1
7	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Bruna	302	AUTORIZADO	2026-04-28 14:37:56.234	1
8	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Jonas	302	AUTORIZADO	2026-04-28 19:10:24.184	1
9	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Gabriel	302	AUTORIZADO	2026-04-29 19:48:41.103	1
10	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Francis	302	AUTORIZADO	2026-04-29 19:51:53.247	1
11	1	\N	\N	VISITANTE_MANUAL	VISITANTES	João	302	AUTORIZADO	2026-04-30 11:10:24.132	1
12	1	\N	\N	VISITANTE_MANUAL	VISITANTES	Jonatan	302	AUTORIZADO	2026-04-30 11:57:33.297	1
\.


--
-- Data for Name: Modulo; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Modulo" (id, chave, nome, descricao, ativo, ordem) FROM stdin;
1	gestao_moradores	Gestão de Moradores	\N	t	1
2	gestao_visitantes	Gestão de Visitantes	\N	t	2
3	portaria	Portaria	\N	t	3
4	encomendas	Encomendas	\N	t	4
5	dispositivos	Dispositivos	\N	t	5
6	relatorios	Relatórios	\N	t	6
7	configuracoes	Configurações	\N	t	7
8	ia	Inteligência Artificial	\N	t	8
9	guarda_volumes	Guarda-volumes	\N	t	9
10	integradores	Integradores	\N	t	10
\.


--
-- Data for Name: Morador; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Morador" (id, "condominioId", "unidadeId", nome, telefone, email, ativo, "criadoEm") FROM stdin;
1	1	1	Alex Ribeiro	48999999999	alex@email.com	t	2026-04-26 13:15:06.963
\.


--
-- Data for Name: PerfilPermissao; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."PerfilPermissao" (id, perfil, "permissaoId") FROM stdin;
1	SUPER_ADMIN	1
2	SUPER_ADMIN	2
3	SUPER_ADMIN	3
4	SUPER_ADMIN	4
5	SUPER_ADMIN	5
6	SUPER_ADMIN	6
7	SUPER_ADMIN	7
8	SUPER_ADMIN	8
9	SUPER_ADMIN	9
10	SUPER_ADMIN	10
11	SUPER_ADMIN	11
12	SUPER_ADMIN	12
13	SUPER_ADMIN	13
14	SUPER_ADMIN	14
15	SUPER_ADMIN	15
16	SUPER_ADMIN	16
17	SUPER_ADMIN	17
18	SUPER_ADMIN	18
19	SUPER_ADMIN	19
20	SUPER_ADMIN	20
21	SUPER_ADMIN	21
22	SUPER_ADMIN	22
23	SUPER_ADMIN	23
24	SUPER_ADMIN	24
25	SUPER_ADMIN	25
26	SUPER_ADMIN	26
27	SUPER_ADMIN	27
28	SUPER_ADMIN	28
29	SUPER_ADMIN	29
30	SUPER_ADMIN	30
31	SUPER_ADMIN	31
32	SUPER_ADMIN	32
33	SUPER_ADMIN	33
34	SUPER_ADMIN	34
35	SUPER_ADMIN	35
36	SUPER_ADMIN	36
37	SUPER_ADMIN	37
38	SUPER_ADMIN	38
39	SUPER_ADMIN	39
40	SUPER_ADMIN	40
41	SUPER_ADMIN	41
42	SUPER_ADMIN	42
43	SUPER_ADMIN	43
44	SUPER_ADMIN	44
45	SUPER_ADMIN	45
46	SUPER_ADMIN	46
47	SUPER_ADMIN	47
48	SUPER_ADMIN	48
49	SUPER_ADMIN	49
50	SUPER_ADMIN	50
51	SUPER_ADMIN	51
52	SUPER_ADMIN	52
53	SUPER_ADMIN	53
54	SUPER_ADMIN	54
55	SUPER_ADMIN	55
56	SUPER_ADMIN	56
57	ADMIN_CONDOMINIO	1
58	ADMIN_CONDOMINIO	2
59	ADMIN_CONDOMINIO	3
60	ADMIN_CONDOMINIO	4
61	ADMIN_CONDOMINIO	5
62	ADMIN_CONDOMINIO	6
63	ADMIN_CONDOMINIO	7
64	ADMIN_CONDOMINIO	8
65	ADMIN_CONDOMINIO	9
66	ADMIN_CONDOMINIO	10
67	ADMIN_CONDOMINIO	13
68	ADMIN_CONDOMINIO	14
69	ADMIN_CONDOMINIO	15
70	ADMIN_CONDOMINIO	16
71	ADMIN_CONDOMINIO	17
72	ADMIN_CONDOMINIO	18
73	ADMIN_CONDOMINIO	19
74	ADMIN_CONDOMINIO	20
75	ADMIN_CONDOMINIO	21
76	ADMIN_CONDOMINIO	25
77	ADMIN_CONDOMINIO	26
80	ADMIN_CONDOMINIO	49
81	ADMIN_CONDOMINIO	50
82	ADMIN_CONDOMINIO	51
83	ADMIN_CONDOMINIO	52
84	ADMIN_CONDOMINIO	53
85	ADMIN_CONDOMINIO	54
86	ADMIN_CONDOMINIO	55
87	ADMIN_CONDOMINIO	56
88	PORTARIA	5
89	PORTARIA	6
90	PORTARIA	7
91	PORTARIA	8
92	PORTARIA	10
93	PORTARIA	11
94	PORTARIA	12
95	PORTARIA	14
96	PORTARIA	15
97	PORTARIA	18
98	PORTARIA	19
99	PORTARIA	1
100	PORTARIA	53
101	TECNICO	21
102	TECNICO	22
103	TECNICO	23
104	TECNICO	24
105	TECNICO	29
106	TECNICO	30
107	TECNICO	34
108	TECNICO	35
109	TECNICO	36
110	MORADOR	1
111	MORADOR	9
112	MORADOR	14
113	MORADOR	20
\.


--
-- Data for Name: Permissao; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Permissao" (id, chave, descricao) FROM stdin;
1	moradores.ver	\N
2	moradores.criar	\N
3	moradores.editar	\N
4	moradores.excluir	\N
5	visitantes.ver	\N
6	visitantes.criar	\N
7	visitantes.autorizar	\N
8	visitantes.negar	\N
9	visitantes.historico	\N
10	portaria.ver	\N
11	portaria.operar	\N
12	portaria.abrir_portao	\N
13	portaria.visualizar_logs	\N
14	encomendas.ver	\N
15	encomendas.registrar	\N
16	encomendas.editar	\N
17	encomendas.excluir	\N
18	encomendas.notificar_morador	\N
19	encomendas.entregar	\N
20	encomendas.historico	\N
21	dispositivos.ver	\N
22	dispositivos.criar	\N
23	dispositivos.editar	\N
24	dispositivos.excluir	\N
25	relatorios.ver	\N
26	relatorios.exportar	\N
27	configuracoes.ver	\N
28	configuracoes.editar	\N
29	ia.ver	\N
30	ia.configurar	\N
31	ia.ativar	\N
32	ia.desativar	\N
33	ia.logs	\N
34	guarda_volumes.ver	\N
35	guarda_volumes.configurar	\N
36	guarda_volumes.abrir_compartimento	\N
37	guarda_volumes.vincular_encomenda	\N
38	guarda_volumes.liberar_retirada	\N
39	guarda_volumes.historico	\N
40	integradores.ver	\N
41	integradores.criar	\N
42	integradores.editar	\N
43	integradores.excluir	\N
44	integradores.configurar_tema	\N
45	condominios.ver	\N
46	condominios.criar	\N
47	condominios.editar	\N
48	condominios.excluir	\N
49	usuarios.ver	\N
50	usuarios.criar	\N
51	usuarios.editar	\N
52	usuarios.excluir	\N
53	unidades.ver	\N
54	unidades.criar	\N
55	unidades.editar	\N
56	unidades.excluir	\N
\.


--
-- Data for Name: Pessoa; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Pessoa" (id, "condominioId", "empresaId", nome, documento, telefone, email, tipo, ativo, "criadoEm", funcao, observacao, rg, "validadeFim", "validadeInicio") FROM stdin;
1	1	\N	Alex Lincon Pereira Ribeiro	03195467135	64993223416	alexlinconribeiro@yahoo.com	MORADOR	t	2026-04-28 13:33:25.271	\N	\N	6290304	\N	\N
\.


--
-- Data for Name: PessoaUnidade; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."PessoaUnidade" (id, "pessoaId", "unidadeId", relacao, ativo, "criadoEm") FROM stdin;
1	1	1	\N	t	2026-04-28 13:33:25.278
\.


--
-- Data for Name: Unidade; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Unidade" (id, "condominioId", identificacao, bloco, ativo) FROM stdin;
1	1	302	A	t
2	1	303	A	t
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Usuario" (id, "condominioId", nome, email, "senhaHash", perfil, ativo, "criadoEm", tema) FROM stdin;
1	\N	Super Admin	admin@portaria.com	$2a$10$5.NvVBg8ZUxu3UaKuJJIOe4P2jit4f3iTw8rsWVb3aJRt7CGeTy6i	SUPER_ADMIN	t	2026-04-25 21:53:25.188	ESCURO
2	1	Admin Condominio	admin@condominio.com	$2a$10$eDJrY8sznc4dQQK88vGCSu6keeh4XkLuJm6gf2xC.Ug1wO3e9qUyO	ADMIN_CONDOMINIO	t	2026-04-26 13:05:01.852	ESCURO
4	1	Porteiro	porteiro@gmail.com	$2a$10$rPQswrnsH70vcDSdh4S9jufCHTgjTA7bdpQSi/pBSc5qiggT1yMTG	PORTARIA	t	2026-04-28 20:04:22.831	ESCURO
5	1	Sindico	sindico@gmail.com	$2a$10$wLiJ/xq7oi8w4QDP97j7q.24.o8.8LDVxPAttqnVhyYFGsQHgIhF6	ADMIN_CONDOMINIO	t	2026-04-28 20:21:40.803	ESCURO
3	\N	Bruna de Oliveira Alcantara	bruna@gmail.com	$2a$10$24y6/W2KtWX2fwjO9G89Uun5gVUqBurkz/N/CCfhwpIA6EMjAcnBy	SUPER_ADMIN	t	2026-04-26 23:57:45.33	CLARO
\.


--
-- Data for Name: Visita; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Visita" (id, "condominioId", "visitanteId", "unidadeId", "nomeVisitante", motivo, "criadoEm", "autorizadoEm", "atualizadoEm", "autorizadoPorId", "canceladoEm", "dataPrevista", "dispositivoId", documento, "entradaEm", "negadoEm", observacao, "saidaEm", telefone, tipo, status, "autorizadoPorPessoaId", "pessoaResponsavelId") FROM stdin;
1	1	\N	\N	Teste Visitante	Teste sistema	2026-04-28 13:11:33.17	2026-04-28 13:12:43.811	2026-04-28 13:15:06.773	3	\N	\N	\N	\N	2026-04-28 13:14:57.072	\N	\N	2026-04-28 13:15:06.772	\N	AVULSA	FINALIZADO	\N	\N
3	1	\N	1	João	Churrasco	2026-04-28 13:51:21.334	2026-04-28 14:03:53.328	2026-04-28 14:03:56.328	3	\N	2026-04-28 10:51:00	\N	000000000000	2026-04-28 14:03:54.58	\N	\N	2026-04-28 14:03:56.327	999999999	AVULSA	FINALIZADO	\N	1
2	1	\N	1	Teste Pessoa	Teste novo fluxo	2026-04-28 13:46:30.667	2026-04-28 14:22:32.252	2026-04-28 14:27:24.142	3	\N	\N	\N	\N	2026-04-28 14:22:36.59	\N	\N	2026-04-28 14:27:24.141	\N	AVULSA	FINALIZADO	\N	1
4	1	\N	1	Bruna	Familia	2026-04-28 14:28:22.08	2026-04-28 14:28:23.997	2026-04-28 14:28:36.35	3	\N	2026-04-28 11:28:00	\N	00000000000	2026-04-28 14:28:25.569	\N	\N	2026-04-28 14:28:36.35	000000000	AVULSA	FINALIZADO	\N	1
5	1	\N	1	Bruna	Visita	2026-04-28 14:37:50.573	2026-04-28 14:37:51.723	2026-04-28 14:38:25.508	3	\N	2026-04-28 11:37:00	\N	00000000000	2026-04-28 14:37:56.228	\N	\N	2026-04-28 14:38:25.507	999999999	AVULSA	FINALIZADO	\N	1
6	1	\N	1	Jonas	\N	2026-04-28 19:04:01.611	2026-04-28 19:10:22.683	2026-04-28 19:10:25.994	3	\N	2026-04-28 16:03:00	\N	00000000000	2026-04-28 19:10:24.175	\N	\N	2026-04-28 19:10:25.993	000000000	AVULSA	FINALIZADO	\N	1
7	1	\N	1	Gabriel	\N	2026-04-29 19:48:09.093	2026-04-29 19:48:18.263	2026-04-29 19:48:46.384	4	\N	2026-04-29 16:48:00	\N	00000000000	2026-04-29 19:48:41.095	\N	\N	2026-04-29 19:48:46.383	999999999	AVULSA	FINALIZADO	\N	1
8	1	\N	1	Francis	\N	2026-04-29 19:51:30.487	2026-04-29 19:51:37.076	2026-04-29 19:51:57.888	4	\N	2026-04-29 16:51:00	\N	99999999999	2026-04-29 19:51:53.24	\N	\N	2026-04-29 19:51:57.887	11111111111	AVULSA	FINALIZADO	\N	1
9	1	\N	1	João	\N	2026-04-30 11:10:17.765	2026-04-30 11:10:20.364	2026-04-30 11:10:26.188	4	\N	2026-04-30 08:10:00	\N	00000000000	2026-04-30 11:10:24.125	\N	\N	2026-04-30 11:10:26.187	999999999	AVULSA	FINALIZADO	\N	1
10	1	\N	1	Jonatan	\N	2026-04-30 11:54:22.892	2026-04-30 11:57:27.224	2026-04-30 11:58:06.889	5	\N	2026-04-30 08:54:00	\N	0000000000	2026-04-30 11:57:33.289	\N	\N	2026-04-30 11:58:06.888	000000000	AVULSA	FINALIZADO	\N	1
\.


--
-- Data for Name: Visitante; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public."Visitante" (id, "condominioId", nome, documento, telefone, "criadoEm") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: portaria
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
42ca8d47-9c86-4371-b993-1dd5bed07d3a	608b9267f55312731608e9b6cf185ea32a2f4ba9ce60500dccb59d75ac790f99	2026-04-25 21:47:08.613645+00	20260425214708_init	\N	\N	2026-04-25 21:47:08.529732+00	1
3be96f92-7911-4f40-8b8a-ffff2c3806b8	85b9a607139be91d287f9fafa696e5eef4412398960a398a3afe4765bc187d52	2026-04-26 18:51:36.02922+00	20260426185136_update_condominio	\N	\N	2026-04-26 18:51:36.020746+00	1
ba01fb15-de6a-4169-a18f-ee326cfe7245	fb37893816cde6d3ee2c7009667c2f11b3346130a65a6111208569a5bf92ff12	2026-04-26 21:35:49.120146+00	20260426213549_pessoa_model	\N	\N	2026-04-26 21:35:49.066493+00	1
f30bb9a0-d0a1-433a-8573-09d6677ae85d	1e53a1082b3e4757fcda52efcef10ef1931b0b828d571adfb9cfa01edb745cdd	2026-04-26 22:27:40.165521+00	20260426222740_campos_pessoa	\N	\N	2026-04-26 22:27:40.156835+00	1
b1ce0be2-e3c6-45c0-9636-8db6a0298d2b	640ac7033a140ae25904fdc7699611082ba8aefe9a34fec09b45b68155240fcc	2026-04-27 16:32:06.209296+00	20260427133558_update_dispositivos	\N	\N	2026-04-27 16:32:06.187744+00	1
de5c3026-88a1-44af-9fb5-2cbd94d361ef	96ca409026aa59920316f96b20b6b23cacef54f06221bf6635673439e646a1e3	2026-04-28 13:05:39.683932+00	20260428130539_fluxo_visitantes	\N	\N	2026-04-28 13:05:39.661054+00	1
34c3339c-b83f-459d-9855-39d18342b032	3a304dac3769eb3066359e85b9862751f47383c02afab8f9e4f661cede4d68cf	2026-04-28 13:41:30.610314+00	20260428134130_visita_usar_pessoa	\N	\N	2026-04-28 13:41:30.600223+00	1
a6c37639-20c2-4d97-b732-7443e3be5565	874c55ef714b92744f72abf014654e5ee6a4c9e93cc610a9ccee13f7c06f75bb	2026-04-28 15:04:29.055346+00	20260428150429_configuracoes_iniciais	\N	\N	2026-04-28 15:04:29.031057+00	1
2a5ae6c9-6c91-462a-8b33-2cf5b32e978e	62ca6c284e48f9c9c14b3efb9cf3df834e1b2f9657c5d9c52ed5528f85d06977	2026-04-28 15:36:47.40833+00	20260428153647_usuario_preferencia_tema	\N	\N	2026-04-28 15:36:47.398782+00	1
1606fb9c-cf97-45ec-89e4-fc0895c27066	cf3ca220628f006db24294249bbb5d3744299310369fb87ca73afeace2687442	2026-04-30 11:06:29.948294+00	20260430110629_permissoes	\N	\N	2026-04-30 11:06:29.908869+00	1
11e3ecf0-2e43-4254-ba7c-310da26ecf67	b0a696bc462ce5939bdbaddc7c4a90a2ec332918b52385db6263443d31d96a03	2026-04-30 12:56:57.150992+00	20260430125657_modulos	\N	\N	2026-04-30 12:56:57.12047+00	1
\.


--
-- Name: CondominioModulo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."CondominioModulo_id_seq"', 10, true);


--
-- Name: Condominio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Condominio_id_seq"', 1, true);


--
-- Name: Configuracao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Configuracao_id_seq"', 1, true);


--
-- Name: CredencialAcesso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."CredencialAcesso_id_seq"', 2, true);


--
-- Name: Dispositivo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Dispositivo_id_seq"', 1, true);


--
-- Name: EmpresaTerceira_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."EmpresaTerceira_id_seq"', 1, false);


--
-- Name: EventoAcesso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."EventoAcesso_id_seq"', 12, true);


--
-- Name: Modulo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Modulo_id_seq"', 10, true);


--
-- Name: Morador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Morador_id_seq"', 1, true);


--
-- Name: PerfilPermissao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."PerfilPermissao_id_seq"', 113, true);


--
-- Name: Permissao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Permissao_id_seq"', 56, true);


--
-- Name: PessoaUnidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."PessoaUnidade_id_seq"', 1, true);


--
-- Name: Pessoa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Pessoa_id_seq"', 1, true);


--
-- Name: Unidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Unidade_id_seq"', 2, true);


--
-- Name: Usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Usuario_id_seq"', 5, true);


--
-- Name: Visita_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Visita_id_seq"', 10, true);


--
-- Name: Visitante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: portaria
--

SELECT pg_catalog.setval('public."Visitante_id_seq"', 1, false);


--
-- Name: CondominioModulo CondominioModulo_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CondominioModulo"
    ADD CONSTRAINT "CondominioModulo_pkey" PRIMARY KEY (id);


--
-- Name: Condominio Condominio_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Condominio"
    ADD CONSTRAINT "Condominio_pkey" PRIMARY KEY (id);


--
-- Name: Configuracao Configuracao_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Configuracao"
    ADD CONSTRAINT "Configuracao_pkey" PRIMARY KEY (id);


--
-- Name: CredencialAcesso CredencialAcesso_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CredencialAcesso"
    ADD CONSTRAINT "CredencialAcesso_pkey" PRIMARY KEY (id);


--
-- Name: Dispositivo Dispositivo_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Dispositivo"
    ADD CONSTRAINT "Dispositivo_pkey" PRIMARY KEY (id);


--
-- Name: EmpresaTerceira EmpresaTerceira_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EmpresaTerceira"
    ADD CONSTRAINT "EmpresaTerceira_pkey" PRIMARY KEY (id);


--
-- Name: EventoAcesso EventoAcesso_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso"
    ADD CONSTRAINT "EventoAcesso_pkey" PRIMARY KEY (id);


--
-- Name: Modulo Modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Modulo"
    ADD CONSTRAINT "Modulo_pkey" PRIMARY KEY (id);


--
-- Name: Morador Morador_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Morador"
    ADD CONSTRAINT "Morador_pkey" PRIMARY KEY (id);


--
-- Name: PerfilPermissao PerfilPermissao_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PerfilPermissao"
    ADD CONSTRAINT "PerfilPermissao_pkey" PRIMARY KEY (id);


--
-- Name: Permissao Permissao_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Permissao"
    ADD CONSTRAINT "Permissao_pkey" PRIMARY KEY (id);


--
-- Name: PessoaUnidade PessoaUnidade_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PessoaUnidade"
    ADD CONSTRAINT "PessoaUnidade_pkey" PRIMARY KEY (id);


--
-- Name: Pessoa Pessoa_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Pessoa"
    ADD CONSTRAINT "Pessoa_pkey" PRIMARY KEY (id);


--
-- Name: Unidade Unidade_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Unidade"
    ADD CONSTRAINT "Unidade_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: Visita Visita_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_pkey" PRIMARY KEY (id);


--
-- Name: Visitante Visitante_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visitante"
    ADD CONSTRAINT "Visitante_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CondominioModulo_condominioId_moduloId_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "CondominioModulo_condominioId_moduloId_key" ON public."CondominioModulo" USING btree ("condominioId", "moduloId");


--
-- Name: Configuracao_condominioId_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "Configuracao_condominioId_key" ON public."Configuracao" USING btree ("condominioId");


--
-- Name: CredencialAcesso_condominioId_tipo_identificador_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "CredencialAcesso_condominioId_tipo_identificador_key" ON public."CredencialAcesso" USING btree ("condominioId", tipo, identificador);


--
-- Name: Modulo_chave_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "Modulo_chave_key" ON public."Modulo" USING btree (chave);


--
-- Name: PerfilPermissao_perfil_permissaoId_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "PerfilPermissao_perfil_permissaoId_key" ON public."PerfilPermissao" USING btree (perfil, "permissaoId");


--
-- Name: Permissao_chave_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "Permissao_chave_key" ON public."Permissao" USING btree (chave);


--
-- Name: PessoaUnidade_pessoaId_unidadeId_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "PessoaUnidade_pessoaId_unidadeId_key" ON public."PessoaUnidade" USING btree ("pessoaId", "unidadeId");


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: portaria
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: CondominioModulo CondominioModulo_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CondominioModulo"
    ADD CONSTRAINT "CondominioModulo_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CondominioModulo CondominioModulo_moduloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CondominioModulo"
    ADD CONSTRAINT "CondominioModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES public."Modulo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Configuracao Configuracao_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Configuracao"
    ADD CONSTRAINT "Configuracao_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CredencialAcesso CredencialAcesso_moradorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CredencialAcesso"
    ADD CONSTRAINT "CredencialAcesso_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES public."Morador"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CredencialAcesso CredencialAcesso_pessoaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."CredencialAcesso"
    ADD CONSTRAINT "CredencialAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES public."Pessoa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Dispositivo Dispositivo_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Dispositivo"
    ADD CONSTRAINT "Dispositivo_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmpresaTerceira EmpresaTerceira_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EmpresaTerceira"
    ADD CONSTRAINT "EmpresaTerceira_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventoAcesso EventoAcesso_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso"
    ADD CONSTRAINT "EventoAcesso_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventoAcesso EventoAcesso_dispositivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso"
    ADD CONSTRAINT "EventoAcesso_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES public."Dispositivo"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EventoAcesso EventoAcesso_moradorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso"
    ADD CONSTRAINT "EventoAcesso_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES public."Morador"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EventoAcesso EventoAcesso_pessoaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."EventoAcesso"
    ADD CONSTRAINT "EventoAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES public."Pessoa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Morador Morador_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Morador"
    ADD CONSTRAINT "Morador_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Morador Morador_unidadeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Morador"
    ADD CONSTRAINT "Morador_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES public."Unidade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PerfilPermissao PerfilPermissao_permissaoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PerfilPermissao"
    ADD CONSTRAINT "PerfilPermissao_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES public."Permissao"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PessoaUnidade PessoaUnidade_pessoaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PessoaUnidade"
    ADD CONSTRAINT "PessoaUnidade_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES public."Pessoa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PessoaUnidade PessoaUnidade_unidadeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."PessoaUnidade"
    ADD CONSTRAINT "PessoaUnidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES public."Unidade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pessoa Pessoa_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Pessoa"
    ADD CONSTRAINT "Pessoa_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pessoa Pessoa_empresaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Pessoa"
    ADD CONSTRAINT "Pessoa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES public."EmpresaTerceira"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Unidade Unidade_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Unidade"
    ADD CONSTRAINT "Unidade_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Usuario Usuario_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_autorizadoPorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_autorizadoPorPessoaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_autorizadoPorPessoaId_fkey" FOREIGN KEY ("autorizadoPorPessoaId") REFERENCES public."Pessoa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Visita Visita_dispositivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES public."Dispositivo"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_pessoaResponsavelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_pessoaResponsavelId_fkey" FOREIGN KEY ("pessoaResponsavelId") REFERENCES public."Pessoa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_unidadeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES public."Unidade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visita Visita_visitanteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visita"
    ADD CONSTRAINT "Visita_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES public."Visitante"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visitante Visitante_condominioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: portaria
--

ALTER TABLE ONLY public."Visitante"
    ADD CONSTRAINT "Visitante_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES public."Condominio"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: portaria
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict vhD6XmU2dIV9kY3ckAFYRqxlv22kYvPjq7iC2OgnJpCxDNYqznOxFoMxXe2SC3s

