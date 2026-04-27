#!/bin/bash

echo "=== Portaria SaaS - Instalação ==="

echo "1) Atualizando sistema..."
sudo apt update

echo "2) Instalando Docker e Docker Compose..."
sudo apt install -y docker.io docker-compose git

echo "3) Habilitando Docker..."
sudo systemctl enable docker
sudo systemctl start docker

echo "4) Subindo containers..."
docker-compose up -d --build

echo "5) Status dos containers:"
docker-compose ps

echo ""
echo "Instalação finalizada!"
echo "Frontend: http://IP_DO_SERVIDOR:8080"
echo "Backend:  http://IP_DO_SERVIDOR:4000/health"
