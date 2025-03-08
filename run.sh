#!/bin/bash

# Carrega o nvm e a versão correta do Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Usa a versão do .nvmrc ou a versão especificada
if [ -f ".nvmrc" ]; then
  nvm use || nvm install
else
  nvm use 23.6.0 || nvm install 23.6.0
fi

# Executa o comando passado como parâmetro
if [ $# -eq 0 ]; then
  echo "Por favor, informe um comando para executar."
  echo "Exemplo: ./run.sh npm run dev"
  exit 1
fi

# Executa o comando passado
exec "$@" 
