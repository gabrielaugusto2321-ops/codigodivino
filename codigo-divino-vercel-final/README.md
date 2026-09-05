# Código Divino - Vercel

Versão baseada no código-fonte real da página.

Alterações aplicadas:
- Checkout Hotmart: S107470868H
- Meta Pixel: 1092704256587368
- UTMify inserido
- Persistência de UTMs e click IDs durante a sessão
- Parâmetros repassados automaticamente ao checkout
- Evento Meta InitiateCheckout no clique real de compra
- Pixel antigo da página neutralizado

## Deploy
Suba `index.html` e `vercel.json` na raiz do repositório e importe na Vercel.

Observação: os módulos Astro continuam sendo servidos pela origem via rewrite da Vercel para preservar o visual e comportamento da página.
