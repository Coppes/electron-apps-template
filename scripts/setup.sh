#!/bin/bash

# Script para criar arquivos de exemplo adicionais (opcional)

# Criar arquivos adicionais úteis
echo "🚀 Criando estrutura de exemplo..."

# Criar pasta de assets
mkdir -p assets

# Criar arquivo README dos assets
cat > assets/README.md << 'EOF'
# Assets

Coloque aqui:
- Ícones da aplicação (icon.png, icon.ico, etc)
- Imagens de fundo (dmg-background.png para macOS)
- Outros recursos estáticos
EOF

echo "✅ Estrutura criada com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. npm install"
echo "2. npm start"
echo ""
echo "Para mais informações, veja:"
echo "- README.md - Visão geral do projeto"
echo "- DEVELOPMENT.md - Guia de desenvolvimento"
echo "- SECURITY.md - Guia de segurança"
