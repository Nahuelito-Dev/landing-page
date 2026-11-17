/**
 * Netlify Edge Function: recibe el pedido de demo de la landing y lo manda por mail con Resend.
 * La ruta (/api/demo) y el límite de envíos están en `config`, al final del archivo.
 *
 * Variables de entorno (Netlify → Site configuration → Environment variables):
 *   RESEND_API_KEY — obligatoria, la clave secreta de Resend.
 *   RESEND_TO      — obligatoria, la casilla que recibe los pedidos (no va en el repo).
 *   RESEND_FROM    — opcional; por omisión, el remitente de prueba de Resend (onboarding@resend.dev).
 *
 * Filtros, en orden: método (405), origen (403), tipo de contenido (415), tamaño (413), JSON (400),
 * campo trampa y tiempo mínimo de llenado (200 sin mandar nada), datos (400). Después, el envío (500/502).
 *
 * Con JS llega JSON. Sin JS llega `application/x-www-form-urlencoded`, sólo desde el propio sitio, y la
 * respuesta es una redirección a /gracias/ o a /pedido-no-enviado/.
 *
 * Los logs sólo dicen el tipo de error: nunca datos del formulario.
 */

import { Resend } from 'resend';
import {
  CAMPO_TIEMPO,
  CAMPO_TRAMPA,
  TIEMPO_MINIMO_MS,
  TOPE_CUERPO_BYTES,
  camposDemo,
  limpiarDemo,
  validarDemo,
  type DatosDemo,
} from '../../src/data/formularioDemo.ts';
import { DOMINIO } from '../../src/config/sitio.ts';
import { PALETA_PLATAFORMA, armarCorreo, type BloqueDeCorreo, type MarcaDeCorreo } from '../../src/correo/plantilla.ts';

/** El correo del pedido de demo sale con la misma plantilla que los de la API. */
const MARCA: MarcaDeCorreo = {
  tipo: 'plataforma',
  nombre: 'SPLG',
  plataforma: 'OrixTech (Nahuel Wagner)',
  razonSocial: 'OrixTech (Nahuel Wagner)',
  contacto: null,
  paleta: PALETA_PLATAFORMA,
};

// Declaración local: evita sumar @netlify/edge-functions sólo por el tipo del global.
declare const Netlify: { env: { get: (name: string) => string | undefined } };

const REMITENTE_POR_OMISION = 'SPLG <onboarding@resend.dev>';

/** Vistas previas de Netlify: `deploy-preview-12--splg-gas.netlify.app`, `rama--splg-gas.netlify.app`. */
const VISTA_PREVIA = new RegExp(`^[a-z0-9-]+--${DOMINIO.replace(/\./g, '\\.')}$`);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const redirigir = (destino: string) => new Response(null, { status: 303, headers: { Location: destino } });

/** Host permitido como origen: el del pedido, el dominio publicado, sus vistas previas y localhost. */
function hostPermitido(host: string, hostDelPedido: string): boolean {
  const sinPuerto = host.replace(/:\d+$/, '');
  return (
    host === hostDelPedido ||
    sinPuerto === DOMINIO ||
    VISTA_PREVIA.test(sinPuerto) ||
    sinPuerto === 'localhost' ||
    sinPuerto === '127.0.0.1'
  );
}

/** `same-origin` estricto: lo dice el navegador (`Sec-Fetch-Site`) o el `Origin` es el mismo host. */
function mismoOrigen(req: Request): boolean {
  if (req.headers.get('sec-fetch-site') === 'same-origin') return true;
  const origen = req.headers.get('origin');
  if (!origen) return false;
  try {
    return new URL(origen).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/** Origen aceptable para el envío con JS: same-origin o un host permitido. Sin `Origin` ni `Sec-Fetch-Site`, no. */
function origenPermitido(req: Request): boolean {
  const sitio = req.headers.get('sec-fetch-site');
  if (sitio === 'same-origin') return true;
  if (sitio && sitio !== 'same-site' && sitio !== 'none') return false; // cross-site
  const origen = req.headers.get('origin');
  if (!origen) return false;
  try {
    return hostPermitido(new URL(origen).host, new URL(req.url).host);
  } catch {
    return false;
  }
}

class CuerpoDemasiadoGrande extends Error {}

/** Lee el cuerpo hasta el tope: si lo pasa, corta sin leer el resto. */
async function leerConTope(req: Request): Promise<string> {
  const largo = Number(req.headers.get('content-length') ?? '0');
  if (largo > TOPE_CUERPO_BYTES) throw new CuerpoDemasiadoGrande();
  if (!req.body) return '';
  const lector = req.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > TOPE_CUERPO_BYTES) {
      await lector.cancel();
      throw new CuerpoDemasiadoGrande();
    }
    partes.push(value);
  }
  const todo = new Uint8Array(total);
  let i = 0;
  for (const parte of partes) {
    todo.set(parte, i);
    i += parte.byteLength;
  }
  return new TextDecoder().decode(todo);
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405);
  }

  const tipo = (req.headers.get('content-type') ?? '').toLowerCase();
  const esJson = tipo.startsWith('application/json');
  const esFormulario = tipo.startsWith('application/x-www-form-urlencoded');

  // Sin JS sólo desde el propio sitio; con JS, desde el sitio, sus vistas previas o localhost.
  if (esFormulario ? !mismoOrigen(req) : !origenPermitido(req)) {
    return json({ error: 'Origen no permitido' }, 403);
  }
  if (!esJson && !esFormulario) {
    return json({ error: 'Tipo de contenido no admitido' }, 415);
  }

  let texto: string;
  try {
    texto = await leerConTope(req);
  } catch (err) {
    if (err instanceof CuerpoDemasiadoGrande) return json({ error: 'Pedido demasiado grande' }, 413);
    return json({ error: 'JSON inválido' }, 400);
  }

  let datos: DatosDemo;
  try {
    datos = esFormulario ? Object.fromEntries(new URLSearchParams(texto)) : (JSON.parse(texto) as DatosDemo);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw new Error('cuerpo');
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  // Campo trampa con algo: es un bot. Se responde «ok» para que no reintente, y no se manda nada.
  const trampa = datos[CAMPO_TRAMPA];
  if (trampa !== undefined && trampa !== null && String(trampa).trim()) {
    return esFormulario ? redirigir('/gracias/') : json({ ok: true });
  }

  // Tiempo mínimo de llenado (sólo con JS: lo mide el script). Muy rápido → bot, «ok» sin mandar nada.
  if (esJson) {
    const tiempo = Number(datos[CAMPO_TIEMPO]);
    if (datos[CAMPO_TIEMPO] === undefined || datos[CAMPO_TIEMPO] === '' || !Number.isFinite(tiempo) || tiempo < 0) {
      return json({ error: 'Datos inválidos', campos: {} }, 400);
    }
    if (tiempo < TIEMPO_MINIMO_MS) return json({ ok: true });
  }

  const errores = validarDemo(datos);
  if (Object.keys(errores).length > 0) {
    return esFormulario ? redirigir('/pedido-no-enviado/') : json({ error: 'Datos inválidos', campos: errores }, 400);
  }

  const apiKey = Netlify.env.get('RESEND_API_KEY');
  const destinatario = Netlify.env.get('RESEND_TO');
  if (!apiKey || !destinatario) {
    console.error('[demo] falta configuración', { apiKey: Boolean(apiKey), destinatario: Boolean(destinatario) });
    return esFormulario ? redirigir('/pedido-no-enviado/') : json({ error: 'El envío no está configurado' }, 500);
  }
  const remitente = Netlify.env.get('RESEND_FROM') || REMITENTE_POR_OMISION;

  // Todo de una línea y sin caracteres de control (también el asunto).
  const d = limpiarDemo(datos);
  const subject = `Pedido de demo SPLG — ${d.distribuidora} — ${d.ciudad}`;
  const bloques: BloqueDeCorreo[] = [
    {
      tipo: 'parrafo',
      texto: [
        { fuerte: d.nombre || 'Una persona' },
        ` de ${d.distribuidora} (${d.ciudad}) pidió una demo desde la landing de SPLG.`,
        d.email ? ' Respondé este correo para escribirle directamente.' : ' Dejó su teléfono para que lo contacten.',
      ],
    },
    {
      tipo: 'datos',
      titulo: 'Datos del pedido',
      filas: camposDemo.map((campo) => ({ etiqueta: campo.etiqueta, valor: d[campo.nombre] || '—' })),
    },
    ...(d.email
      ? [{ tipo: 'boton', texto: 'Responder por correo', url: `mailto:${encodeURIComponent(d.email).replace('%40', '@')}` } as BloqueDeCorreo]
      : []),
    { tipo: 'nota', tono: 'info', texto: 'Coordiná el día y la hora de la demo de 30 minutos: tu catálogo, tus zonas y un pedido de punta a punta.' },
  ];
  const correo = armarCorreo(MARCA, {
    asunto: subject,
    preheader: `${d.nombre || 'Alguien'} de ${d.distribuidora} (${d.ciudad}) pidió una demo`,
    etiqueta: 'Pedido de demo',
    titulo: `Nuevo pedido de demo: ${d.distribuidora}`,
    bloques,
    motivo: 'Recibís este correo porque sos el contacto de los pedidos de demo de la landing de SPLG.',
  });

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: remitente,
      to: destinatario,
      subject: correo.asunto,
      html: correo.html,
      text: correo.text,
      ...(d.email ? { replyTo: d.email } : {}),
    });
    if (error) {
      console.error('[demo] Resend rechazó el envío', error.name ?? 'desconocido');
      return esFormulario ? redirigir('/pedido-no-enviado/') : json({ error: 'No se pudo enviar' }, 502);
    }
    return esFormulario ? redirigir('/gracias/') : json({ ok: true });
  } catch (err) {
    console.error('[demo] error inesperado', err instanceof Error ? err.name : 'desconocido');
    return esFormulario ? redirigir('/pedido-no-enviado/') : json({ error: 'No se pudo enviar' }, 500);
  }
};

/**
 * Ruta y límite de envíos (declaración en línea de Netlify; no hay otra en netlify.toml). La ruta va
 * literal (es `ENDPOINT_DEMO`) porque Netlify la lee al compilar. Límite: 5 pedidos por IP y dominio en una
 * ventana deslizante de 180 s; pasado el límite, Netlify responde 429 sin ejecutar la función.
 */
export const config = {
  path: '/api/demo',
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ['ip', 'domain'],
  },
};
