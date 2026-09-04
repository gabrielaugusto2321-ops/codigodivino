# Código Divino — Vercel com rastreamento reforçado

Projeto proxy para publicar a página autorizada na Vercel sem perder o visual original.

## Configurado

- Checkout Hotmart: `https://pay.hotmart.com/S107470868H?bid=1788554369866`
- Meta Pixel: `1092704256587368`
- UTMify: script fornecido pelo proprietário da página
- Preservação automática de: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, `fbclid`, `gclid`, `gbraid`, `wbraid`, `ttclid`, `msclkid`, `src`, `sck`
- Os parâmetros ficam preservados durante a sessão e são anexados aos links da Hotmart.
- Evento Meta `InitiateCheckout` é enviado somente quando o usuário clica em um link real de checkout.
- `PageView` continua sendo disparado pelo Pixel existente na página, usando o novo ID.

## Importante sobre Purchase

Este projeto NÃO dispara `Purchase` na landing page. Isso seria uma conversão falsa. O evento de compra deve ser configurado na Hotmart/UTMify/Meta após a confirmação real do pagamento.

## Deploy

1. Suba todos os arquivos deste projeto para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Framework Preset: `Other`.
4. Deploy.

## Teste recomendado após publicar

Abra a URL da Vercel com uma campanha fictícia, por exemplo:

`?utm_source=teste&utm_medium=cpc&utm_campaign=validacao&fbclid=TESTE123`

Passe o mouse/copiei o link de um botão de compra e confira se esses parâmetros aparecem na URL da Hotmart.

No Meta Pixel Helper / Test Events, confira `PageView` e depois `InitiateCheckout` ao clicar no botão.
