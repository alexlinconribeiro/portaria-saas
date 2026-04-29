-- CreateEnum
CREATE TYPE "TemaUsuario" AS ENUM ('ESCURO', 'CLARO');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "tema" "TemaUsuario" NOT NULL DEFAULT 'ESCURO';
