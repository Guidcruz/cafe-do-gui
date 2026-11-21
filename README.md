# Café do Gui

Cardápio e receitas de café em casa: espresso (9 g simples / 18 g duplo), bebidas com leite, gelados, V60 e Origami. Tem ilustrações das bebidas e uma calculadora de proporção, a partir do café ou da bebida pronta.

O site é um único arquivo estático, o `index.html`, sem etapa de build.

## Cloudflare Pages

- Framework preset: **None**
- Build command: *(em branco)*
- Build output directory: `/`

## Menu da família (`/menu`)

O endereço `/menu` mostra só o cardápio, com a tag "Indisponível" nas bebidas em falta.
A disponibilidade é marcada em Ferramentas → Menu da família e fica guardada no Cloudflare.

Configuração única no Cloudflare:

1. **Workers & Pages → KV → Create namespace**, nome `cafe-do-gui-menu`.
2. No projeto Pages `cafe-do-gui`: **Settings → Bindings → Add → KV namespace**,
   variável `DISPONIBILIDADE`, escolhendo o namespace criado (em Production).
3. **Settings → Variables and Secrets → Add**, tipo **Secret**, nome `ADMIN_PIN`, valor = o PIN.
4. **Deployments → último deploy → Retry deployment** para aplicar.

A API fica em `functions/api/disponibilidade.js`. O QR code usa `vendor/qrcode.js`
(qrcode-generator 1.4.4, Kazuhiko Arase, licença MIT).
