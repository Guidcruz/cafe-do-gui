// API do menu da família: quais bebidas estão indisponíveis.
// GET  /api/disponibilidade  -> { indisponiveis: [...], atualizado, configurado }
// PUT  /api/disponibilidade  (header X-Pin) body { indisponiveis: [...] }
// Precisa no Cloudflare Pages: KV ligado como DISPONIBILIDADE e segredo ADMIN_PIN.
const KEY = 'indisponiveis';
const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: H });

export async function onRequestGet({ env }) {
  if (!env.DISPONIBILIDADE) return json({ indisponiveis: [], atualizado: null, configurado: false });
  const v = await env.DISPONIBILIDADE.get(KEY, 'json');
  return json({
    indisponiveis: v && Array.isArray(v.indisponiveis) ? v.indisponiveis : [],
    atualizado: (v && v.atualizado) || null,
    configurado: !!env.ADMIN_PIN
  });
}

export async function onRequestPut({ request, env }) {
  if (!env.DISPONIBILIDADE || !env.ADMIN_PIN) return json({ erro: 'nao-configurado' }, 503);
  const pin = request.headers.get('x-pin') || '';
  if (!(await igual(pin, String(env.ADMIN_PIN)))) return json({ erro: 'pin' }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ erro: 'json' }, 400); }
  const lista = body && body.indisponiveis;
  if (!Array.isArray(lista) || lista.length > 200 ||
      !lista.every(x => typeof x === 'string' && x.length > 0 && x.length <= 80)) {
    return json({ erro: 'formato' }, 400);
  }
  const dado = { indisponiveis: [...new Set(lista)], atualizado: new Date().toISOString() };
  await env.DISPONIBILIDADE.put(KEY, JSON.stringify(dado));
  return json({ ok: true, ...dado });
}

// Compara o PIN em tempo constante
async function igual(a, b) {
  const e = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest('SHA-256', e.encode(a)),
    crypto.subtle.digest('SHA-256', e.encode(b))
  ]);
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}
