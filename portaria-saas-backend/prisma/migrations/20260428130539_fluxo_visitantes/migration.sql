/*
  Warnings:

  - The `status` column on the `Visita` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `atualizadoEm` to the `Visita` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusVisita" AS ENUM ('PENDENTE', 'AUTORIZADO', 'NEGADO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoVisita" AS ENUM ('AVULSA', 'AGENDADA', 'PRESTADOR', 'ENTREGA');

-- AlterTable
ALTER TABLE "Visita" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "autorizadoPorId" INTEGER,
ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "dataPrevista" TIMESTAMP(3),
ADD COLUMN     "dispositivoId" INTEGER,
ADD COLUMN     "documento" TEXT,
ADD COLUMN     "entradaEm" TIMESTAMP(3),
ADD COLUMN     "negadoEm" TIMESTAMP(3),
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "saidaEm" TIMESTAMP(3),
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "tipo" "TipoVisita" NOT NULL DEFAULT 'AVULSA',
DROP COLUMN "status",
ADD COLUMN     "status" "StatusVisita" NOT NULL DEFAULT 'PENDENTE';

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "Morador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
