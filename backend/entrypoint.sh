#!/bin/sh
# Script de inicialização para garantir que as permissões estejam corretas

# Garante que os diretórios de dados têm permissões adequadas
mkdir -p /pocketbase/pb_data
chmod -R 777 /pocketbase/pb_data

# Executa o PocketBase
exec pocketbase serve --http=0.0.0.0:8090
