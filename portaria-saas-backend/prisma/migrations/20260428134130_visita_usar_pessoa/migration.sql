/*
  Warnings:

  - You are about to drop the column `moradorId` on the `Visita` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Visita" DROP CONSTRAINT "Visita_moradorId_fkey";

-- AlterTable
ALTER TABLE "Visita" DROP COLUMN "moradorId",
ADD COLUMN     "autorizadoPorPessoaId" INTEGER,
ADD COLUMN     "pessoaResponsavelId" INTEGER;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_pessoaResponsavelId_fkey" FOREIGN KEY ("pessoaResponsavelId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_autorizadoPorPessoaId_fkey" FOREIGN KEY ("autorizadoPorPessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
