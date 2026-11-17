import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(function (this: { emails: unknown }, clave: string) {
    this.emails = { send: (...args: unknown[]) => send(clave, ...args) };
  }),
}));

const { default: demo, config } = await import('../netlify/edge-functions/demo.ts');
const { ENDPOINT_DEMO } = await import('../src/data/formularioDemo.ts');

let entorno: Record<string, string | undefined>;
const valido = {
  nombre: 'Ana Prueba',
  distribuidora: 'Gas del Centro',
  ciudad: 'Posadas',
  choferes: '3',
  pedidos_por_dia: '40',
  email: 'ana@prueba.com',
  telefono: '376 4123456',
  sitio_web: '',
  tiempo_ms: '5200',
};

const post = (cuerpo: unknown, tipo = 'application/json', cabeceras: Record<string, string> = {}) =>
  new Request('https://splg.test/api/demo', {
    method: 'POST',
    headers: { 'Content-Type': tipo, Origin: 'https://splg.test', 'Sec-Fetch-Site': 'same-origin', ...cabeceras },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });

beforeEach(() => {
  entorno = { RESEND_API_KEY: 're_prueba', RESEND_TO: 'ventas@ejemplo.test' };
  (globalThis as unknown as { Netlify: unknown }).Netlify = { env: { get: (n: string) => entorno[n] } };
  send.mockReset();
  send.mockResolvedValue({ data: { id: 'x' }, error: null });
});

afterEach(() => vi.restoreAllMocks());

describe('Edge Function /api/demo', () => {
  it('405 si no es POST', async () => {
    const res = await demo(new Request('https://splg.test/api/demo'));
    expect(res.status).toBe(405);
    expect(send).not.toHaveBeenCalled();
  });

  it('400 con JSON inválido', async () => {
    const res = await demo(post('{no es json'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'JSON inválido' });
  });

  it('400 si el cuerpo no es un objeto', async () => {
    expect((await demo(post([1, 2]))).status).toBe(400);
  });

  it('campo trampa con algo: 200 y no manda nada', async () => {
    const res = await demo(post({ ...valido, sitio_web: 'https://spam.example' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ['falta el nombre', { nombre: '' }, 'nombre'],
    ['falta la distribuidora', { distribuidora: '  ' }, 'distribuidora'],
    ['falta la ciudad', { ciudad: undefined }, 'ciudad'],
    ['falta el teléfono', { telefono: '' }, 'telefono'],
    ['email inválido', { email: 'ana@' }, 'email'],
    ['email con parámetros de mailto', { email: 'ana?cc=otro@prueba.com' }, 'email'],
    ['email con separadores', { email: 'ana@prueba.com,otro@x.com' }, 'email'],
    ['teléfono con letras', { telefono: '376-abc-4567' }, 'telefono'],
    ['teléfono corto', { telefono: '1234' }, 'telefono'],
    ['nombre demasiado largo', { nombre: 'a'.repeat(81) }, 'nombre'],
    ['distribuidora demasiado larga', { distribuidora: 'a'.repeat(121) }, 'distribuidora'],
    ['choferes fuera de rango', { choferes: '0' }, 'choferes'],
    ['choferes no entero', { choferes: '2.5' }, 'choferes'],
    ['pedidos fuera de rango', { pedidos_por_dia: '10001' }, 'pedidos_por_dia'],
  ])('400 cuando %s', async (_caso, cambio, campo) => {
    const res = await demo(post({ ...valido, ...cambio }));
    expect(res.status).toBe(400);
    const cuerpo = await res.json();
    expect(cuerpo.error).toBe('Datos inválidos');
    expect(Object.keys(cuerpo.campos)).toContain(campo);
    expect(send).not.toHaveBeenCalled();
  });

  it('email, choferes y pedidos son opcionales', async () => {
    const res = await demo(post({ ...valido, email: '', choferes: '', pedidos_por_dia: '' }));
    expect(res.status).toBe(200);
    const [, mail] = send.mock.calls[0];
    expect(mail.replyTo).toBeUndefined();
  });

  it('500 sin RESEND_API_KEY, sin mandar nada', async () => {
    delete entorno.RESEND_API_KEY;
    const res = await demo(post(valido));
    expect(res.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  it('500 sin RESEND_TO (no hay destinatario por omisión)', async () => {
    delete entorno.RESEND_TO;
    const res = await demo(post(valido));
    expect(res.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  it('502 si Resend rechaza el envío, sin datos del formulario en el log', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'ana@prueba.com no es válido' } });
    const res = await demo(post(valido));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'No se pudo enviar' });
    const escrito = JSON.stringify(log.mock.calls);
    expect(escrito).toContain('validation_error');
    for (const valor of [valido.nombre, valido.email, valido.telefono, valido.distribuidora]) {
      expect(escrito).not.toContain(valor);
    }
  });

  it('500 si Resend tira una excepción', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockRejectedValue(new TypeError('fetch failed para ana@prueba.com'));
    const res = await demo(post(valido));
    expect(res.status).toBe(500);
  });

  it('200 y manda el mail con asunto, destinatario, remitente y todos los campos', async () => {
    const res = await demo(post(valido));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
    const [clave, mail] = send.mock.calls[0];
    expect(clave).toBe('re_prueba');
    expect(mail.to).toBe('ventas@ejemplo.test');
    expect(mail.from).toBe('SPLG <onboarding@resend.dev>');
    expect(mail.subject).toBe('Pedido de demo SPLG — Gas del Centro — Posadas');
    expect(mail.replyTo).toBe('ana@prueba.com');
    for (const linea of [
      'Nombre y apellido: Ana Prueba',
      'Distribuidora: Gas del Centro',
      'Ciudad: Posadas',
      'Choferes: 3',
      'Pedidos por día: 40',
      'Email: ana@prueba.com',
      'Teléfono o WhatsApp: 376 4123456',
    ]) {
      expect(mail.text).toContain(linea);
    }
    expect(mail.text).not.toContain('sitio_web');
    expect(mail.text).not.toContain('tiempo_ms');
  });

  it('usa RESEND_FROM si está cargado', async () => {
    entorno.RESEND_FROM = 'SPLG <demo@orixtech.test>';
    await demo(post(valido));
    expect(send.mock.calls[0][1].from).toBe('SPLG <demo@orixtech.test>');
  });

  it('sin JS (form-urlencoded): redirige a /gracias/ o a /pedido-no-enviado/', async () => {
    const ok = await demo(post(new URLSearchParams(valido).toString(), 'application/x-www-form-urlencoded'));
    expect(ok.status).toBe(303);
    expect(ok.headers.get('Location')).toBe('/gracias/');
    const mal = await demo(
      post(new URLSearchParams({ ...valido, telefono: '' }).toString(), 'application/x-www-form-urlencoded'),
    );
    expect(mal.status).toBe(303);
    expect(mal.headers.get('Location')).toBe('/pedido-no-enviado/');
  });

  describe('origen', () => {
    const sinSecFetch = (origen?: string) => {
      const cab: Record<string, string> = { 'Content-Type': 'application/json' };
      if (origen) cab.Origin = origen;
      return new Request('https://splg-gas.netlify.app/api/demo', { method: 'POST', headers: cab, body: JSON.stringify(valido) });
    };

    it.each([
      ['el dominio publicado', 'https://splg-gas.netlify.app'],
      ['una vista previa de Netlify', 'https://deploy-preview-12--splg-gas.netlify.app'],
      ['localhost en desarrollo', 'http://localhost:8899'],
    ])('acepta %s', async (_caso, origen) => {
      expect((await demo(sinSecFetch(origen))).status).toBe(200);
    });

    it.each([
      ['otro sitio', 'https://evil.example'],
      ['un dominio que sólo termina igual', 'https://xsplg-gas.netlify.app'],
      ['otra app de Netlify', 'https://otra--app.netlify.app'],
    ])('403 desde %s', async (_caso, origen) => {
      const res = await demo(sinSecFetch(origen));
      expect(res.status).toBe(403);
      expect(send).not.toHaveBeenCalled();
    });

    it('403 sin Origin ni Sec-Fetch-Site (curl, scripts)', async () => {
      expect((await demo(sinSecFetch())).status).toBe(403);
      expect(send).not.toHaveBeenCalled();
    });

    it('403 si el navegador dice cross-site aunque el Origin parezca bueno', async () => {
      const res = await demo(post(valido, 'application/json', { 'Sec-Fetch-Site': 'cross-site', Origin: 'https://splg-gas.netlify.app' }));
      expect(res.status).toBe(403);
    });

    it('sin JS: sólo same-origin (una vista previa u otro host, 403)', async () => {
      const cuerpo = new URLSearchParams(valido).toString();
      const ajeno = await demo(
        post(cuerpo, 'application/x-www-form-urlencoded', { 'Sec-Fetch-Site': 'same-site', Origin: 'https://rama--splg-gas.netlify.app' }),
      );
      expect(ajeno.status).toBe(403);
      const propio = await demo(post(cuerpo, 'application/x-www-form-urlencoded'));
      expect(propio.status).toBe(303);
    });
  });

  describe('tipo de contenido', () => {
    it.each(['text/plain', 'multipart/form-data; boundary=x', ''])('415 con «%s»', async (tipo) => {
      const res = await demo(post(JSON.stringify(valido), tipo));
      expect(res.status).toBe(415);
      expect(send).not.toHaveBeenCalled();
    });

    it('acepta application/json con charset', async () => {
      expect((await demo(post(valido, 'application/json; charset=utf-8'))).status).toBe(200);
    });
  });

  describe('tamaño', () => {
    it('413 si Content-Length pasa los 8 KB, sin leer el cuerpo', async () => {
      const req = post(valido, 'application/json', { 'Content-Length': String(8 * 1024 + 1) });
      const leer = vi.spyOn(req, 'text');
      const res = await demo(req);
      expect(res.status).toBe(413);
      expect(leer).not.toHaveBeenCalled();
      expect(req.bodyUsed).toBe(false);
    });

    it('413 si el cuerpo (sin Content-Length) pasa los 8 KB', async () => {
      const grande = { ...valido, nombre: 'a'.repeat(9000) };
      const res = await demo(post(grande));
      expect(res.status).toBe(413);
      expect(send).not.toHaveBeenCalled();
    });

    it('un cuerpo justo por debajo del tope se procesa', async () => {
      const res = await demo(post({ ...valido, relleno: 'a'.repeat(7000) }));
      expect(res.status).toBe(200);
    });
  });

  describe('caracteres de control', () => {
    it('saca saltos de línea y demás del asunto y del cuerpo', async () => {
      const res = await demo(
        post({ ...valido, distribuidora: 'Gas\r\nBcc: otro@ejemplo.test', ciudad: 'Posa\tdas\u0000', nombre: 'Ana\u2028Prueba' }),
      );
      expect(res.status).toBe(200);
      const [, mail] = send.mock.calls[0];
      expect(mail.subject).toBe('Pedido de demo SPLG — Gas Bcc: otro@ejemplo.test — Posa das');
      expect(mail.subject).not.toMatch(/[\u0000-\u001F\u007F\u2028\u2029]/);
      expect(mail.text).toContain('Nombre y apellido: Ana Prueba');
      expect(mail.text.split('\n').filter((l: string) => l.startsWith('Distribuidora:'))).toEqual([
        'Distribuidora: Gas Bcc: otro@ejemplo.test',
      ]);
    });

    it('un campo obligatorio hecho sólo de caracteres de control cuenta como vacío', async () => {
      const res = await demo(post({ ...valido, ciudad: '\r\n\t' }));
      expect(res.status).toBe(400);
      expect((await res.json()).campos.ciudad).toBe('Escribí la ciudad.');
    });
  });

  describe('tiempo mínimo de llenado', () => {
    it('menos de 3 s: 200 y no manda nada', async () => {
      const res = await demo(post({ ...valido, tiempo_ms: '2999' }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      expect(send).not.toHaveBeenCalled();
    });

    it('3 s justos: manda', async () => {
      expect((await demo(post({ ...valido, tiempo_ms: '3000' }))).status).toBe(200);
      expect(send).toHaveBeenCalledTimes(1);
    });

    it.each([['sin el campo', undefined], ['vacío', ''], ['no numérico', 'rápido'], ['negativo', '-5']])(
      '400 con el tiempo %s',
      async (_caso, tiempo) => {
        const res = await demo(post({ ...valido, tiempo_ms: tiempo }));
        expect(res.status).toBe(400);
        expect(send).not.toHaveBeenCalled();
      },
    );
  });

  it('config: ruta /api/demo y límite de envíos por IP y dominio', () => {
    expect(config.path).toBe(ENDPOINT_DEMO);
    expect(config.rateLimit).toEqual({ windowLimit: 5, windowSize: 180, aggregateBy: ['ip', 'domain'] });
  });
});
