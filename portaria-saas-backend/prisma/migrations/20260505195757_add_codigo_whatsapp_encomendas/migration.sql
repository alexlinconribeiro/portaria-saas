-- AlterTable
ALTER TABLE "Encomenda" ADD COLUMN     "codigoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "codigoRetirada" TEXT,
ADD COLUMN     "mensagemWhatsapp" TEXT,
ADD COLUMN     "whatsappEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappErro" TEXT;
