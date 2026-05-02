-- CreateTable
CREATE TABLE "Modulo" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondominioModulo" (
    "id" SERIAL NOT NULL,
    "condominioId" INTEGER NOT NULL,
    "moduloId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CondominioModulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_chave_key" ON "Modulo"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "CondominioModulo_condominioId_moduloId_key" ON "CondominioModulo"("condominioId", "moduloId");

-- AddForeignKey
ALTER TABLE "CondominioModulo" ADD CONSTRAINT "CondominioModulo_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondominioModulo" ADD CONSTRAINT "CondominioModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
