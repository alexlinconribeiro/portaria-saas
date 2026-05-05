-- CreateEnum
CREATE TYPE "ModoEnvioWhatsapp" AS ENUM ('MANUAL', 'AUTOMATICO');

-- CreateTable
CREATE TABLE "IntegradorWhatsappConfig" (
    "id" SERIAL NOT NULL,
    "integradorId" INTEGER NOT NULL,
    "modo" "ModoEnvioWhatsapp" NOT NULL DEFAULT 'MANUAL',
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumberId" TEXT,
    "accessToken" TEXT,
    "templateEncomenda" TEXT DEFAULT 'encomenda_recebida',
    "templateIdioma" TEXT DEFAULT 'pt_BR',
    "fallbackManual" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegradorWhatsappConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegradorWhatsappConfig_integradorId_key" ON "IntegradorWhatsappConfig"("integradorId");

-- AddForeignKey
ALTER TABLE "IntegradorWhatsappConfig" ADD CONSTRAINT "IntegradorWhatsappConfig_integradorId_fkey" FOREIGN KEY ("integradorId") REFERENCES "Integrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
