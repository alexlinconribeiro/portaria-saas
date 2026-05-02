-- CreateTable
CREATE TABLE "Permissao" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilPermissao" (
    "id" SERIAL NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "permissaoId" INTEGER NOT NULL,

    CONSTRAINT "PerfilPermissao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_chave_key" ON "Permissao"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilPermissao_perfil_permissaoId_key" ON "PerfilPermissao"("perfil", "permissaoId");

-- AddForeignKey
ALTER TABLE "PerfilPermissao" ADD CONSTRAINT "PerfilPermissao_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "Permissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
