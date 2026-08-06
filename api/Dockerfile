# Imagem de produção da API.
#
# Dois pontos que não são óbvios e por isso estão explícitos aqui:
#
# 1. `src/generated/` não é versionado (está no .gitignore), então o client do
#    Prisma não existe no código-fonte. O `npm run build` roda `prisma generate`
#    antes do `nest build`, e o client sai compilado em dist/src/generated/prisma.
#
# 2. A imagem final carrega as dependências de desenvolvimento junto. Não é por
#    descuido: o `prisma migrate deploy` do CMD precisa do CLI do Prisma (que é
#    devDependency) e do TypeScript para ler o prisma.config.ts. Se preferir uma
#    imagem enxuta, tire o migrate do CMD e rode-o como passo separado de release.

FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=dependencias /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# necessários em tempo de execução pelo `prisma migrate deploy`
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 3000

# aplica as migrations pendentes antes de aceitar tráfego
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
