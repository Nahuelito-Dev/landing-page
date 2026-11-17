/*
 * El componente se renderiza con la Container API de Astro (en Node) y se monta en un DOM de happy-dom
 * para probar el comportamiento real del formulario.
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FormularioDemo from '../src/components/FormularioDemo.astro';
import { enviarDemo, iniciarFormularioDemo } from '../src/lib/formularioDemo';

const respuesta = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

let form: HTMLFormElement;
let ventana: Window;
let Evento: typeof Event;
let fetchFalso: ReturnType<typeof vi.fn>;
let irA: ReturnType<typeof vi.fn<(url: string) => void>>;
let reloj: number;
let esperas: number[];

const $ = <T extends Element = HTMLElement>(sel: string) => form.querySelector<T>(sel)!;
const escribir = (nombre: string, valor: string) => {
  const el = $<HTMLInputElement>(`#demo-${nombre}`);
  el.value = valor;
  el.dispatchEvent(new Evento('input', { bubbles: true }));
};
const completar = () => {
  escribir('nombre', 'Ana Prueba');
  escribir('distribuidora', 'Gas del Centro');
  escribir('ciudad', 'Posadas');
  escribir('telefono', '376 4123456');
  escribir('email', 'ana@prueba.com');
};
const enviar = async () => {
  form.dispatchEvent(new Evento('submit', { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
};

beforeEach(async () => {
  const contenedor = await AstroContainer.create();
  ventana = new Window({ url: 'https://splg.test/' });
  (globalThis as unknown as { document: Document }).document = ventana.document as unknown as Document;
  Evento = ventana.Event as unknown as typeof Event;
  document.body.innerHTML = await contenedor.renderToString(FormularioDemo);
  form = document.querySelector('form')!;
  fetchFalso = vi.fn();
  irA = vi.fn<(url: string) => void>();
  reloj = 1000;
  esperas = [];
  iniciarFormularioDemo(form, {
    fetch: fetchFalso as unknown as typeof fetch,
    irA,
    observarVisibilidad: false,
    ahora: () => reloj,
    esperar: async (ms) => {
      esperas.push(ms);
      reloj += ms;
    },
  });
  reloj += 10_000; // por omisión, la persona tardó 10 s en llenarlo
});

afterEach(async () => {
  await ventana.happyDOM.close();
  delete (globalThis as unknown as { document?: Document }).document;
});

describe('HTML del formulario', () => {
  it('va a /api/demo, sin Netlify Forms, con el campo trampa oculto', () => {
    expect(form.getAttribute('action')).toBe('/api/demo');
    expect(form.getAttribute('method')).toBe('post');
    expect(form.hasAttribute('data-netlify')).toBe(false);
    expect(form.querySelector('[name="form-name"]')).toBeNull();
    expect(form.querySelector('[name="sitio_web"]')?.closest('.hidden')).not.toBeNull();
  });

  it('cada campo tiene etiqueta y su mensaje de error asociado', () => {
    for (const input of form.querySelectorAll<HTMLInputElement>('input[id^="demo-"]')) {
      expect(form.querySelector(`label[for="${input.id}"]`)).not.toBeNull();
      expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-error`);
    }
  });
});

describe('validación', () => {
  it('vacío: no envía, marca los 4 obligatorios y lleva el foco al resumen', async () => {
    await enviar();
    expect(fetchFalso).not.toHaveBeenCalled();
    expect(form.querySelectorAll('[aria-invalid="true"]')).toHaveLength(4);
    expect($('[data-resumen]').hidden).toBe(false);
    expect($('[data-resumen]').textContent).toContain('Hay 4 datos para revisar');
    expect(document.activeElement).toBe($('[data-resumen]'));
    expect($('#demo-telefono-error').textContent).toBe('Dejanos un teléfono para coordinar la demo.');
  });

  it('corrigiendo un campo marcado, el error se va mientras escribís', async () => {
    await enviar();
    escribir('nombre', 'Ana');
    expect($('#demo-nombre').hasAttribute('aria-invalid')).toBe(false);
    expect($('#demo-nombre-error').textContent).toBe('');
  });
});

describe('envío', () => {
  it('ok: manda JSON a /api/demo con el campo trampa y va a /gracias/', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { ok: true }));
    completar();
    await enviar();
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFalso.mock.calls[0];
    expect(url).toBe('/api/demo');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({
      nombre: 'Ana Prueba',
      distribuidora: 'Gas del Centro',
      ciudad: 'Posadas',
      telefono: '376 4123456',
      email: 'ana@prueba.com',
      sitio_web: '',
      tiempo_ms: '10000',
    });
    expect(esperas).toEqual([]);
    expect(irA).toHaveBeenCalledWith('/gracias/');
  });

  it('mientras envía: botón deshabilitado, «Enviando…» y no se manda dos veces', async () => {
    let resolver!: (r: Response) => void;
    fetchFalso.mockReturnValue(new Promise<Response>((r) => (resolver = r)));
    completar();
    form.dispatchEvent(new Evento('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Evento('submit', { bubbles: true, cancelable: true }));
    const boton = $<HTMLButtonElement>('button[type="submit"]');
    expect(boton.disabled).toBe(true);
    expect(boton.textContent).toBe('Enviando…');
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    resolver(respuesta(200, { ok: true }));
    await new Promise((r) => setTimeout(r, 0));
  });

  it.each([
    ['error del servidor (502)', () => Promise.resolve(respuesta(502, { error: 'No se pudo enviar' }))],
    ['sin configurar (500)', () => Promise.resolve(respuesta(500, { error: 'El envío no está configurado' }))],
    ['sin conexión', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('%s: muestra el error con WhatsApp y no pierde lo escrito', async (_caso, falla) => {
    fetchFalso.mockImplementation(falla);
    completar();
    await enviar();
    expect(irA).not.toHaveBeenCalled();
    const fallo = $('[data-fallo]');
    expect(fallo.hidden).toBe(false);
    expect(fallo.textContent).toContain('No pudimos enviar tu pedido');
    expect(fallo.querySelector('a[href^="https://wa.me/"]')).not.toBeNull();
    expect(document.activeElement).toBe(fallo);
    expect($<HTMLInputElement>('#demo-nombre').value).toBe('Ana Prueba');
    expect($<HTMLInputElement>('#demo-telefono').value).toBe('376 4123456');
    const boton = $<HTMLButtonElement>('button[type="submit"]');
    expect(boton.disabled).toBe(false);
    expect(boton.textContent).toBe('Enviar pedido de demo');
  });

  it('400 con campos: marca lo que dice el servidor', async () => {
    fetchFalso.mockResolvedValue(respuesta(400, { error: 'Datos inválidos', campos: { ciudad: 'Entre 2 y 80 caracteres.' } }));
    completar();
    await enviar();
    expect($('#demo-ciudad').getAttribute('aria-invalid')).toBe('true');
    expect($('#demo-ciudad-error').textContent).toBe('Entre 2 y 80 caracteres.');
    expect($('[data-resumen]').hidden).toBe(false);
  });
});

describe('enviarDemo', () => {
  it('un 400 sin campos es error del servidor', async () => {
    const f = vi.fn().mockResolvedValue(respuesta(400, { error: 'JSON inválido' }));
    expect(await enviarDemo({}, f)).toEqual({ estado: 'error', motivo: 'servidor' });
  });
  it('sin red es error de red', async () => {
    const f = vi.fn().mockRejectedValue(new TypeError('offline'));
    expect(await enviarDemo({}, f)).toEqual({ estado: 'error', motivo: 'red' });
  });
});

describe('igual que el servidor', () => {
  it('choferes y pedidos son texto con teclado numérico y pattern, no type=number', () => {
    for (const nombre of ['choferes', 'pedidos_por_dia']) {
      const el = $<HTMLInputElement>(`#demo-${nombre}`);
      expect(el.getAttribute('type')).toBe('text');
      expect(el.getAttribute('inputmode')).toBe('numeric');
      expect(el.getAttribute('pattern')).toMatch(/^\[0-9\]\{1,\d\}$/);
    }
  });

  it('el pattern del teléfono y del email es el del servidor (8 dígitos, TLD de 2)', () => {
    const tel = new RegExp(`^(?:${$('#demo-telefono').getAttribute('pattern')})$`, 'v');
    expect(tel.test('376 4123456')).toBe(true);
    expect(tel.test('+54 9 (3755) 69-6734')).toBe(true);
    expect(tel.test('123 4567')).toBe(false); // 7 dígitos
    const email = new RegExp(`^(?:${$('#demo-email').getAttribute('pattern')})$`, 'v');
    expect(email.test('ana@prueba.com')).toBe(true);
    expect(email.test('ana@prueba.c')).toBe(false);
  });

  it('un número no parseable en choferes se marca como error y no se envía', async () => {
    completar();
    escribir('choferes', 'tres');
    await enviar();
    expect(fetchFalso).not.toHaveBeenCalled();
    expect($('#demo-choferes').getAttribute('aria-invalid')).toBe('true');
    expect($('#demo-choferes-error').textContent).toBe('Poné un número entero entre 1 y 500.');
  });

  it('saca los caracteres de control antes de validar y de enviar', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { ok: true }));
    completar();
    // (el navegador ya saca \r y \n de un input de texto; quedan tabulaciones, NUL, U+0085, U+2028…)
    escribir('distribuidora', 'Gas\tdel\u0085Centro\u2028Bcc: x@y.test');
    escribir('ciudad', '\tPosadas\u0000');
    await enviar();
    const enviado = JSON.parse(fetchFalso.mock.calls[0][1].body);
    expect(enviado.distribuidora).toBe('Gas del Centro Bcc: x@y.test');
    expect(enviado.ciudad).toBe('Posadas');
  });

  it('una ciudad hecha sólo de caracteres de control cuenta como vacía', async () => {
    completar();
    escribir('ciudad', '\r\n');
    await enviar();
    expect(fetchFalso).not.toHaveBeenCalled();
    expect($('#demo-ciudad-error').textContent).toBe('Escribí la ciudad.');
  });
});

describe('tiempo mínimo de llenado', () => {
  it('si se envía antes de 3 s desde que se vio, espera lo que falta y manda el tiempo real', async () => {
    fetchFalso.mockResolvedValue(respuesta(200, { ok: true }));
    reloj -= 10_000 - 1200; // pasaron 1,2 s desde que se vio
    completar();
    await enviar();
    expect(esperas).toEqual([1800]);
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body).tiempo_ms).toBe('3000');
  });

  it('el campo de tiempo existe y va vacío en el HTML (sin JS no se mide)', () => {
    const tiempo = form.querySelector<HTMLInputElement>('input[name="tiempo_ms"]')!;
    expect(tiempo.type).toBe('hidden');
    expect(tiempo.getAttribute('value')).toBe('');
  });
});
