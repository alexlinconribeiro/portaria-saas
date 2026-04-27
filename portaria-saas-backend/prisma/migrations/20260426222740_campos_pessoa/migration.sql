-- AlterTable
ALTER TABLE "Pessoa" ADD COLUMN     "funcao" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "validadeFim" TIMESTAMP(3),
ADD COLUMN     "validadeInicio" TIMESTAMP(3);
