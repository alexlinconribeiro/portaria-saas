-- AlterTable
ALTER TABLE "Condominio" ADD COLUMN     "integradorId" INTEGER;

-- CreateTable
CREATE TABLE "Integrador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dominio" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegradorTema" (
    "id" SERIAL NOT NULL,
    "integradorId" INTEGER NOT NULL,
    "nomeSistema" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "primarySoftColor" TEXT NOT NULL DEFAULT '#eff6ff',
    "sidebarColor" TEXT NOT NULL DEFAULT '#111827',
    "bgColor" TEXT NOT NULL DEFAULT '#f5f7fb',
    "cardColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#172033',
    "mutedColor" TEXT NOT NULL DEFAULT '#64748b',
    "borderColor" TEXT NOT NULL DEFAULT '#e5e7eb',

    CONSTRAINT "IntegradorTema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integrador_slug_key" ON "Integrador"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "IntegradorTema_integradorId_key" ON "IntegradorTema"("integradorId");

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "Condominio_integradorId_fkey" FOREIGN KEY ("integradorId") REFERENCES "Integrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegradorTema" ADD CONSTRAINT "IntegradorTema_integradorId_fkey" FOREIGN KEY ("integradorId") REFERENCES "Integrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
