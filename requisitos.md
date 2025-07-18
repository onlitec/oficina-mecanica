Sistema de Gestão de Oficina Mecânica
Sistema completo para gestão de oficinas mecânicas, desenvolvido com tecnologias modernas.

Tecnologias utilizadas
Backend: Node.js, Express, TypeScript
Banco de dados: PostgreSQL com Prisma ORM
Autenticação: JWT
Frontend: (em desenvolvimento)
Funcionalidades principais
Gestão de clientes e veículos
Controle de ordens de serviço
Gerenciamento de peças e estoque
Controle de serviços e mão de obra
Relatórios e análises
Requisitos
Node.js 18+
PostgreSQL
NPM ou Yarn
Configuração do ambiente de desenvolvimento
Clone o repositório
git clone <seu-repositorio>
cd oficina-mecanica
Instale as dependências
npm install
Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações
Configure o banco de dados
npx prisma migrate dev
Execute em modo de desenvolvimento
npm run dev
Scripts disponíveis
npm run dev: Inicia o servidor em modo de desenvolvimento
npm run build: Compila o projeto para produção
npm start: Inicia o servidor em modo de produção
npm run lint: Executa a verificação de lint
Estrutura do projeto
/
├── prisma/             # Configurações e migrações do Prisma
├── src/
│   ├── config/         # Configurações da aplicação
│   ├── controllers/    # Controladores da API
│   ├── middlewares/    # Middlewares do Express
│   ├── models/         # Modelos de dados
│   ├── routes/         # Definição de rotas
│   ├── services/       # Lógica de negócios
│   └── utils/          # Utilitários
└── tests/              # Testes automatizados
API
A documentação completa da API será disponibilizada em breve.

Licença
Este projeto está licenciado sob a licença ISC.