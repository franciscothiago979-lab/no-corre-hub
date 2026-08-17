# Implantação Oracle Cloud Always Free — ERP

O ERP roda no mesmo servidor externo da loja, porém isolado na porta local `3001` e publicado por Nginx apenas no domínio administrativo do ERP.

## Variáveis do ERP

Crie `/etc/no-corre/erp.env`, com permissões `600` e proprietário `nocorre`:

```dotenv
DATABASE_URL=postgresql://...
SUPABASE_URL=https://pjnxwqyyfmsgcjqakhrb.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=media
VITE_SUPABASE_URL=https://pjnxwqyyfmsgcjqakhrb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
SHOP_SYNC_BASE_URL=https://__STORE_DOMAIN__
SHOP_ERP_SYNC_SECRET=__SHARED_SYNC_SECRET__
SHOP_SYNC_ENABLED=true
JWT_SECRET=__RANDOM_SECRET__
OWNER_EMAIL=__OWNER_EMAIL__
ALLOWED_HOSTS=__ERP_DOMAIN__
```

Os valores de `SHOP_ERP_SYNC_SECRET` e `ERP_SYNC_SECRET` precisam ser idênticos. O ERP não deve receber uma chave de serviço do Supabase no navegador; todas as variáveis sem prefixo `VITE_` permanecem exclusivamente no servidor.
