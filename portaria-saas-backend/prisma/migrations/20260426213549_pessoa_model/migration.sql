-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('MORADOR', 'FUNCIONARIO', 'TERCEIRO', 'PRESTADOR', 'VISITANTE', 'SINDICO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoEmpresa" AS ENUM ('TERCEIRIZADA', 'PRESTADORA', 'FORNECEDOR');

-- AlterTable
ALTER TABLE "CredencialAcesso" ADD COLUMN     "pessoaId" INTEGER;

-- AlterTable
ALTER TABLE "EventoAcesso" ADD COLUMN     "pessoaId" INTEGER;

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "empresaId" INTEGER,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "tipo" "TipoPessoa" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PessoaUnidade" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "unidadeId" INTEGER NOT NULL,
    "relacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PessoaUnidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaTerceira" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "tipo" "TipoEmpresa" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaTerceira_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PessoaUnidade_pessoaId_unidadeId_key" ON "PessoaUnidade"("pessoaId", "unidadeId");

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "EmpresaTerceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaUnidade" ADD CONSTRAINT "PessoaUnidade_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaUnidade" ADD CONSTRAINT "PessoaUnidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaTerceira" ADD CONSTRAINT "EmpresaTerceira_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredencialAcesso" ADD CONSTRAINT "CredencialAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAcesso" ADD CONSTRAINT "EventoAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
