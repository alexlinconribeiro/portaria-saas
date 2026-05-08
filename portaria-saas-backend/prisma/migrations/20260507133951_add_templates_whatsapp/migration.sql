-- AlterTable
ALTER TABLE "IntegradorWhatsappConfig" ADD COLUMN     "templateAcesso" TEXT DEFAULT 'acesso_liberado',
ADD COLUMN     "templateVisitante" TEXT DEFAULT 'visitante_aguardando';
