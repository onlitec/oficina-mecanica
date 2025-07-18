#!/bin/bash

# Script para configurar repositório remoto Git
echo "🔧 Configuração de Repositório Remoto Git"
echo ""

# Verificar se já existe um remote
if git remote | grep -q "origin"; then
    echo "✅ Repositório remoto 'origin' já configurado:"
    git remote -v
    echo ""
    read -p "Deseja reconfigurar? (s/N): " reconfig
    if [[ $reconfig != "s" && $reconfig != "S" ]]; then
        echo "❌ Operação cancelada"
        exit 0
    fi
    git remote remove origin
fi

echo "📋 Opções de repositório remoto:"
echo "1. GitHub"
echo "2. GitLab"
echo "3. Bitbucket"
echo "4. URL personalizada"
echo ""

read -p "Escolha uma opção (1-4): " option

case $option in
    1)
        echo "📱 GitHub selecionado"
        read -p "Digite o nome do usuário/organização: " username
        read -p "Digite o nome do repositório: " repo
        remote_url="https://github.com/$username/$repo.git"
        ;;
    2)
        echo "🦊 GitLab selecionado"
        read -p "Digite o nome do usuário/organização: " username
        read -p "Digite o nome do repositório: " repo
        remote_url="https://gitlab.com/$username/$repo.git"
        ;;
    3)
        echo "🪣 Bitbucket selecionado"
        read -p "Digite o nome do usuário/organização: " username
        read -p "Digite o nome do repositório: " repo
        remote_url="https://bitbucket.org/$username/$repo.git"
        ;;
    4)
        echo "🔗 URL personalizada"
        read -p "Digite a URL completa do repositório: " remote_url
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🔗 Configurando repositório remoto..."
echo "   URL: $remote_url"

# Adicionar remote
git remote add origin "$remote_url"

if [ $? -eq 0 ]; then
    echo "✅ Repositório remoto configurado com sucesso!"
    echo ""
    echo "📤 Para fazer push:"
    echo "   git push -u origin master"
    echo ""
    echo "📥 Para fazer pull:"
    echo "   git pull origin master"
    echo ""
    echo "🔍 Verificar configuração:"
    git remote -v
else
    echo "❌ Erro ao configurar repositório remoto"
    exit 1
fi
