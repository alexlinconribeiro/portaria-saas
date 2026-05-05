-- CreateEnum
CREATE TYPE "StatusEncomenda" AS ENUM ('PENDENTE', 'NOTIFICADO', 'RETIRADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Encomenda" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "unidadeId" INTEGER,
    "pessoaId" INTEGER,
    "descricao" TEXT,
    "codigo" TEXT,
    "remetente" TEXT,
    "status" "StatusEncomenda" NOT NULL DEFAULT 'PENDENTE',
    "dataRecebimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificadoEm" TIMESTAMP(3),
    "retiradoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),
    "recebidoPorId" INTEGER,
    "retiradoPorId" INTEGER,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
