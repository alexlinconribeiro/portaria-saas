#!/bin/bash

echo "Iniciando backend..."
cd portaria-saas-backend
npm run dev &

sleep 2

echo "Iniciando frontend..."
cd ../portaria-saas-admin
npm run dev
