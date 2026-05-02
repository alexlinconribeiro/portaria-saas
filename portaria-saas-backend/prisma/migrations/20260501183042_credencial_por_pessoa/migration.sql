/*
  Warnings:

  - Made the column `pessoaId` on table `CredencialAcesso` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."CredencialAcesso" DROP CONSTRAINT "CredencialAcesso_moradorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CredencialAcesso" DROP CONSTRAINT "CredencialAcesso_pessoaId_fkey";

-- DropIndex
DROP INDEX "public"."CredencialAcesso_condominioId_tipo_identificador_key";

-- AlterTable
ALTER TABLE "CredencialAcesso" ALTER COLUMN "moradorId" DROP NOT NULL,
ALTER COLUMN "pessoaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CredencialAcesso" ADD CONSTRAINT "CredencialAcesso_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredencialAcesso" ADD CONSTRAINT "CredencialAcesso_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "Morador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredencialAcesso" ADD CONSTRAINT "CredencialAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
