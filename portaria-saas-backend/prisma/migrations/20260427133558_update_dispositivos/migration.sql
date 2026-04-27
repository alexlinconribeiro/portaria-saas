-- AlterTable
ALTER TABLE "Dispositivo" ADD COLUMN     "config" JSONB,
ADD COLUMN     "fabricante" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "porta" INTEGER,
ADD COLUMN     "senha" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'DESCONHECIDO',
ADD COLUMN     "ultimoCheck" TIMESTAMP(3),
ADD COLUMN     "usuario" TEXT;
