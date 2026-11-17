/**
 * Comportamiento del formulario «Pedí una demo» en el navegador: validación accesible, envío por `fetch`
 * a la Edge Function (JSON) y estados (enviando, error, enviado → /gracias/). Si falla, lo escrito queda.
 * `fetch` y la navegación se inyectan para poder probarlo.
 */
import {
  CAMPO_TIEMPO,
  CAMPO_TRAMPA,
  ENDPOINT_DEMO,
  TIEMPO_MINIMO_MS,
  camposDemo,
  normalizarLinea,
  validarCampo,
  type CampoDemo,
} from '../data/formularioDemo';

export type ResultadoEnvio =
  | { estado: 'enviado' }
  | { estado: 'invalido'; campos: Record<string, string> }
  | { estado: 'error'; motivo: 'servidor' | 'red' };

/** Manda los datos a la función y traduce la respuesta. Nunca tira: un problema de red es `error/red`. */
export async function enviarDemo(datos: Record<string, string>, f: typeof fetch = fetch): Promise<ResultadoEnvio> {
  let res: Response;
  try {
    res = await f(ENDPOINT_DEMO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos),
    });
  } catch {
    return { estado: 'error', motivo: 'red' };
  }
  if (res.ok) return { estado: 'enviado' };
  if (res.status === 400) {
    try {
      const cuerpo = (await res.json()) as { campos?: Record<string, string> };
      if (cuerpo.campos && Object.keys(cuerpo.campos).length > 0) return { estado: 'invalido', campos: cuerpo.campos };
    } catch {
      /* respuesta sin JSON: se trata como error del servidor */
    }
  }
  return { estado: 'error', motivo: 'servidor' };
}

type Opciones = {
  fetch?: typeof fetch;
  irA?: (url: string) => void;
  /** Reloj en ms (por omisión `performance.now`). */
  ahora?: () => number;
  /** Espera en ms (por omisión `setTimeout`). */
  esperar?: (ms: number) => Promise<void>;
  /** Si es `false`, el formulario se da por visto al iniciar (sin IntersectionObserver). */
  observarVisibilidad?: boolean;
};

export function iniciarFormularioDemo(form: HTMLFormElement, opciones: Opciones = {}) {
  const f = opciones.fetch ?? fetch.bind(window);
  const irA = opciones.irA ?? ((url: string) => window.location.assign(url));
  const ahora = opciones.ahora ?? (() => performance.now());
  const esperar = opciones.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  form.noValidate = true; // con JS, los mensajes son los nuestros

  // El tiempo de llenado se cuenta desde que el formulario se ve por primera vez.
  let visto: number | null = null;
  const marcarVisto = () => {
    if (visto === null) visto = ahora();
  };
  if (opciones.observarVisibilidad !== false && 'IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        marcarVisto();
        observador.disconnect();
      }
    });
    observador.observe(form);
  } else {
    marcarVisto();
  }
  form.addEventListener('focusin', marcarVisto);

  const resumen = form.querySelector<HTMLElement>('[data-resumen]')!;
  const fallo = form.querySelector<HTMLElement>('[data-fallo]')!;
  const estado = form.querySelector<HTMLElement>('[data-estado]')!;
  const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const textoBoton = boton.textContent?.trim() ?? 'Enviar';
  let intentado = false;
  let enviando = false;

  const input = (nombre: string) => form.elements.namedItem(nombre) as HTMLInputElement;

  const marcar = (campo: CampoDemo, error: string | null) => {
    const salida = form.querySelector<HTMLElement>(`#demo-${campo.nombre}-error`)!;
    salida.textContent = error ?? '';
    if (error) input(campo.nombre).setAttribute('aria-invalid', 'true');
    else input(campo.nombre).removeAttribute('aria-invalid');
  };

  const mostrarResumen = (errores: Array<{ campo: CampoDemo; error: string }>) => {
    resumen.replaceChildren();
    const titulo = document.createElement('p');
    titulo.className = 'font-semibold';
    titulo.textContent = errores.length === 1 ? 'Hay 1 dato para revisar:' : `Hay ${errores.length} datos para revisar:`;
    const lista = document.createElement('ul');
    lista.className = 'mt-2 list-disc space-y-1 pl-5';
    for (const { campo, error } of errores) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#demo-${campo.nombre}`;
      link.className = 'underline underline-offset-2';
      link.textContent = `${campo.etiqueta}: ${error}`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        input(campo.nombre).focus();
      });
      item.append(link);
      lista.append(item);
    }
    resumen.append(titulo, lista);
    resumen.hidden = false;
    resumen.focus();
  };

  const ponerEnviando = (si: boolean) => {
    enviando = si;
    boton.disabled = si;
    boton.setAttribute('aria-disabled', String(si));
    form.setAttribute('aria-busy', String(si));
    boton.textContent = si ? 'Enviando…' : textoBoton;
    estado.textContent = si ? 'Enviando el pedido de demo…' : '';
  };

  for (const campo of camposDemo) {
    const el = input(campo.nombre);
    el.addEventListener('blur', () => {
      if (intentado || el.value.trim()) marcar(campo, validarCampo(campo, el.value));
    });
    el.addEventListener('input', () => {
      if (el.hasAttribute('aria-invalid')) marcar(campo, validarCampo(campo, el.value));
    });
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    intentado = true;
    fallo.hidden = true;

    const errores = camposDemo
      .map((campo) => {
        const error = validarCampo(campo, input(campo.nombre).value);
        marcar(campo, error);
        return { campo, error };
      })
      .filter((r): r is { campo: CampoDemo; error: string } => r.error !== null);
    if (errores.length > 0) {
      mostrarResumen(errores);
      return;
    }
    resumen.hidden = true;

    const datos: Record<string, string> = {};
    for (const campo of camposDemo) datos[campo.nombre] = normalizarLinea(input(campo.nombre).value);
    datos[CAMPO_TRAMPA] = (form.elements.namedItem(CAMPO_TRAMPA) as HTMLInputElement | null)?.value ?? '';

    ponerEnviando(true);
    // Una persona nunca llega al tope, pero si lo hiciera, se espera en vez de que la función lo descarte.
    marcarVisto();
    const transcurrido = ahora() - (visto ?? ahora());
    if (transcurrido < TIEMPO_MINIMO_MS) await esperar(TIEMPO_MINIMO_MS - transcurrido);
    datos[CAMPO_TIEMPO] = String(Math.max(TIEMPO_MINIMO_MS, Math.round(ahora() - (visto ?? 0))));
    const resultado = await enviarDemo(datos, f);

    if (resultado.estado === 'enviado') {
      estado.textContent = '¡Listo! Pedido enviado.';
      irA('/gracias/');
      return;
    }
    ponerEnviando(false);
    if (resultado.estado === 'invalido') {
      const delServidor = camposDemo
        .filter((c) => resultado.campos[c.nombre])
        .map((campo) => ({ campo, error: resultado.campos[campo.nombre] }));
      delServidor.forEach(({ campo, error }) => marcar(campo, error));
      mostrarResumen(delServidor);
      return;
    }
    // Error del servidor o de red: lo escrito queda y se ofrece WhatsApp.
    fallo.hidden = false;
    fallo.focus();
  });
}
