-- CreateEnum
CREATE TYPE "TipoAcionamentoPortao" AS ENUM ('SIMULADO', 'HTTP', 'RELE', 'API');

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "tempoMaximoPermanenciaHoras" INTEGER NOT NULL DEFAULT 12,
    "permitirEntradaSemAutorizacao" BOOLEAN NOT NULL DEFAULT false,
    "exigirUnidade" BOOLEAN NOT NULL DEFAULT true,
    "exigirMoradorResponsavel" BOOLEAN NOT NULL DEFAULT true,
    "abrirPortaoAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "registrarEntradaAutomaticamente" BOOLEAN NOT NULL DEFAULT true,
    "exigirConfirmacaoPorteiro" BOOLEAN NOT NULL DEFAULT true,
    "permitirEntradaDireta" BOOLEAN NOT NULL DEFAULT false,
    "tipoAcionamentoPortao" "TipoAcionamentoPortao" NOT NULL DEFAULT 'SIMULADO',
    "ipDispositivoPortao" TEXT,
    "portaDispositivoPortao" INTEGER,
    "tempoAberturaSegundos" INTEGER NOT NULL DEFAULT 2,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_condominioId_key" ON "Configuracao"("condominioId");

-- AddForeignKey
ALTER TABLE "Configuracao" ADD CONSTRAINT "Configuracao_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
