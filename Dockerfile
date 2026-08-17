FROM node:22-slim

WORKDIR /app

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

RUN npm install -g corepack@latest \
  && corepack enable \
  && corepack prepare pnpm@10.4.1 --activate \
  && pnpm install --frozen-lockfile \
  && pnpm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
