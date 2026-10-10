import { get, put } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';

// Todos los registros del plan viven en un único archivo JSON privado en Vercel Blob.
const RUTA = 'plan12/datos.json';
const VACIO = { inicio: null, pesoIni: null, dias: {} };

function pinValido(req) {
  const esperado = process.env.APP_PIN || '';
  const recibido = req.headers.get('x-pin') || '';
  if (!esperado || recibido.length !== esperado.length) return false;
  return timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function limpiar(d) {
  // Acepta solo la forma esperada para no guardar cualquier cosa.
  const out = { inicio: null, pesoIni: null, dias: {} };
  if (typeof d?.inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.inicio)) out.inicio = d.inicio;
  if (typeof d?.pesoIni === 'number' && isFinite(d.pesoIni)) out.pesoIni = d.pesoIni;
  const campos = ['pasos', 'sueno', 'cig', 'tragos', 'peso', 'cintura'];
  const checks = ['mov', 'com', 'hab'];
  for (const [k, v] of Object.entries(d?.dias || {})) {
    const n = Number(k);
    if (!Number.isInteger(n) || n < 1 || n > 84 || typeof v !== 'object' || !v) continue;
    const r = {};
    for (const c of campos) if (typeof v[c] === 'number' && isFinite(v[c])) r[c] = v[c];
    for (const c of checks) if (v[c] === true) r[c] = true;
    if (Object.keys(r).length) out.dias[n] = r;
  }
  return out;
}

export async function GET(req) {
  if (!pinValido(req)) return json({ error: 'PIN incorrecto' }, 401);
  const r = await get(RUTA, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return json(VACIO);
  const texto = await new Response(r.stream).text();
  try {
    return json(JSON.parse(texto));
  } catch {
    return json(VACIO);
  }
}

export async function PUT(req) {
  if (!pinValido(req)) return json({ error: 'PIN incorrecto' }, 401);
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  const datos = limpiar(body);
  await put(RUTA, JSON.stringify(datos), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return json({ ok: true });
}
