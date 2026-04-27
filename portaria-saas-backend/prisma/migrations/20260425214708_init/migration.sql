-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('SUPER_ADMIN', 'ADMIN_CONDOMINIO', 'PORTARIA', 'TECNICO', 'MORADOR');

-- CreateEnum
CREATE TYPE "TipoCredencial" AS ENUM ('FACIAL', 'TAG', 'SENHA');

-- CreateEnum
CREATE TYPE "TipoAcesso" AS ENUM ('FACIAL', 'TAG', 'SENHA', 'VISITANTE_IA', 'VISITANTE_MANUAL');

-- CreateEnum
CREATE TYPE "StatusAcesso" AS ENUM ('AUTORIZADO', 'NEGADO', 'PENDENTE');

-- CreateTable
CREATE TABLE "Condominio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Condominio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "identificacao" TEXT NOT NULL,
    "bloco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Morador" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "unidadeId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Morador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredencialAcesso" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "moradorId" INTEGER NOT NULL,
    "tipo" "TipoCredencial" NOT NULL,
    "identificador" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredencialAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ip" TEXT,
    "localizacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitante" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "visitanteId" INTEGER,
    "unidadeId" INTEGER,
    "moradorId" INTEGER,
    "nomeVisitante" TEXT NOT NULL,
    "motivo" TEXT,
    "status" "StatusAcesso" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorizadoEm" TIMESTAMP(3),

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAcesso" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "moradorId" INTEGER,
    "dispositivoId" INTEGER,
    "tipo" "TipoAcesso" NOT NULL,
    "origem" TEXT,
    "nome" TEXT,
    "unidade" TEXT,
    "status" "StatusAcesso" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CredencialAcesso_condominioId_tipo_identificador_key" ON "CredencialAcesso"("condominioId", "tipo", "identificador");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unidade" ADD CONSTRAINT "Unidade_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Morador" ADD CONSTRAINT "Morador_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Morador" ADD CONSTRAINT "Morador_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredencialAcesso" ADD CONSTRAINT "CredencialAcesso_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "Morador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitante" ADD CONSTRAINT "Visitante_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAcesso" ADD CONSTRAINT "EventoAcesso_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAcesso" ADD CONSTRAINT "EventoAcesso_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "Morador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAcesso" ADD CONSTRAINT "EventoAcesso_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
