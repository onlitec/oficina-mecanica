# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY src/ ./src/
COPY prisma/ ./prisma/

# Gerar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S oficina -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do estágio builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copiar arquivos necessários para produção
COPY prisma/ ./prisma/
COPY css/ ./css/
COPY js/ ./js/
COPY styles/ ./styles/
COPY uploads/ ./uploads/
COPY *.html ./
COPY manifest.json ./
COPY sw.js ./

# Criar diretório para uploads se não existir
RUN mkdir -p uploads && chown -R oficina:nodejs uploads

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configurar variáveis de ambiente
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL="file:./dev.db"

# Mudar para usuário não-root
USER oficina

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
