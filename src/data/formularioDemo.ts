/**
 * Reglas del formulario «Pedí una demo». Una sola fuente para el HTML (atributos nativos), el script de
 * validación accesible del navegador y la Edge Function que manda el mail (netlify/edge-functions/demo.ts).
 * Sin imports: la función corre en Deno y lo importa tal cual.
 */

/** A dónde se manda el formulario (netlify/edge-functions/demo.ts, `config.path`). */
export const ENDPOINT_DEMO = '/api/demo';

/** Campo trampa: oculto para las personas; si llega con algo, es un bot. */
export const CAMPO_TRAMPA = 'sitio_web';

/** Milisegundos que el formulario estuvo a la vista antes de enviarse (lo llena el script). */
export const CAMPO_TIEMPO = 'tiempo_ms';

/** Menos que esto desde que se mostró el formulario es demasiado rápido para una persona. */
export const TIEMPO_MINIMO_MS = 3000;

/** Tope del cuerpo del pedido (bytes). */
export const TOPE_CUERPO_BYTES = 8 * 1024;

export type CampoDemo = {
  nombre: string; // `name` del input (lo que recibe la función)
  etiqueta: string;
  tipo: 'text' | 'email' | 'tel' | 'entero';
  requerido: boolean;
  autocompletar?: string;
  ayuda?: string;
  min?: number;
  max?: number;
  minLargo?: number;
  maxLargo: number;
  /** Para el atributo `pattern` (modo `v`): el navegador valida lo mismo que la función. */
  patron?: string;
  mensajes: { falta?: string; formato?: string; rango?: string };
};

/**
 * Email: nombre@dominio.tld, sólo con letras, números y `._+-` (TLD de 2 o más letras). La misma regla en el `pattern`
 * y en la función. Sin `?`, `&`, `=`, `,` ni `%`: el correo termina en un enlace `mailto:` y en el `replyTo`.
 */
const EMAIL = '[A-Za-z0-9._+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}';
/** Teléfono: sólo números, espacios, +, guiones y paréntesis, con 8 a 15 dígitos. */
const TELEFONO = '(?:[+\\(\\)\\-\\s]*[0-9]){8,15}[+\\(\\)\\-\\s]*';

export const camposDemo: CampoDemo[] = [
  {
    nombre: 'nombre',
    etiqueta: 'Nombre y apellido',
    tipo: 'text',
    requerido: true,
    autocompletar: 'name',
    minLargo: 2,
    maxLargo: 80,
    mensajes: { falta: 'Escribí tu nombre.', formato: 'El nombre tiene que tener entre 2 y 80 caracteres.' },
  },
  {
    nombre: 'distribuidora',
    etiqueta: 'Distribuidora',
    tipo: 'text',
    requerido: true,
    autocompletar: 'organization',
    minLargo: 2,
    maxLargo: 120,
    mensajes: { falta: 'Escribí el nombre de la distribuidora.', formato: 'Entre 2 y 120 caracteres.' },
  },
  {
    nombre: 'ciudad',
    etiqueta: 'Ciudad',
    tipo: 'text',
    requerido: true,
    autocompletar: 'address-level2',
    minLargo: 2,
    maxLargo: 80,
    mensajes: { falta: 'Escribí la ciudad.', formato: 'Entre 2 y 80 caracteres.' },
  },
  {
    nombre: 'choferes',
    etiqueta: 'Choferes',
    tipo: 'entero',
    requerido: false,
    ayuda: 'Aproximado.',
    min: 1,
    max: 500,
    maxLargo: 3,
    patron: '[0-9]{1,3}',
    mensajes: { rango: 'Poné un número entero entre 1 y 500.' },
  },
  {
    nombre: 'pedidos_por_dia',
    etiqueta: 'Pedidos por día',
    tipo: 'entero',
    requerido: false,
    ayuda: 'Aproximado.',
    min: 1,
    max: 10000,
    maxLargo: 5,
    patron: '[0-9]{1,5}',
    mensajes: { rango: 'Poné un número entero entre 1 y 10.000.' },
  },
  {
    nombre: 'email',
    etiqueta: 'Email',
    tipo: 'email',
    requerido: false,
    autocompletar: 'email',
    maxLargo: 120,
    patron: EMAIL,
    mensajes: { formato: 'Revisá el email: tiene que ser como nombre@dominio.com.' },
  },
  {
    nombre: 'telefono',
    etiqueta: 'Teléfono o WhatsApp',
    tipo: 'tel',
    requerido: true,
    autocompletar: 'tel',
    ayuda: 'Con código de área, por ejemplo 376 4123456.',
    maxLargo: 20,
    patron: TELEFONO,
    mensajes: {
      falta: 'Dejanos un teléfono para coordinar la demo.',
      formato: 'Revisá el teléfono: de 8 a 15 números; se aceptan espacios, +, guiones y paréntesis.',
    },
  },
];

/** Datos del formulario tal como llegan (texto o número). */
export type DatosDemo = Partial<Record<string, unknown>>;

/** Caracteres de control C0 y C1 y los separadores de línea y párrafo de Unicode. */
const CONTROL = new RegExp('[\\u0000-\\u001F\\u007F-\\u009F\\u2028\\u2029]+', 'g');

/**
 * Un campo de una línea, limpio: sin caracteres de control (saltos de línea, tabulaciones, NUL…), sin
 * separadores de línea Unicode, con los espacios repetidos juntados y recortado. Se aplica antes de validar
 * y antes de armar el asunto del mail.
 */
export function normalizarLinea(valor: unknown): string {
  if (valor === undefined || valor === null) return '';
  return String(valor).replace(CONTROL, ' ').replace(/ {2,}/g, ' ').trim();
}

const coincideEntero = (patron: string, v: string) => new RegExp(`^(?:${patron})$`).test(v);

/** Primer error de un campo, o `null` si está bien. */
export function validarCampo(campo: CampoDemo, valor: unknown): string | null {
  const v = normalizarLinea(valor);
  if (!v) return campo.requerido ? (campo.mensajes.falta ?? 'Completá este campo.') : null;
  if (campo.tipo === 'entero') {
    const n = Number(v);
    if (!/^\d+$/.test(v) || (campo.min !== undefined && n < campo.min) || (campo.max !== undefined && n > campo.max)) {
      return campo.mensajes.rango ?? 'Revisá el número.';
    }
    return null;
  }
  if (campo.minLargo !== undefined && v.length < campo.minLargo) return campo.mensajes.formato ?? 'Es muy corto.';
  if (v.length > campo.maxLargo) return campo.mensajes.formato ?? 'Es muy largo.';
  if (campo.patron && !coincideEntero(campo.patron, v)) return campo.mensajes.formato ?? 'Revisá el formato.';
  return null;
}

/** Errores de todo el formulario, por campo (vacío si está todo bien). */
export function validarDemo(datos: DatosDemo): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const campo of camposDemo) {
    const error = validarCampo(campo, datos[campo.nombre]);
    if (error) errores[campo.nombre] = error;
  }
  return errores;
}

/** Los datos limpios (de una línea, sin caracteres de control; los vacíos quedan como cadena vacía). */
export function limpiarDemo(datos: DatosDemo): Record<string, string> {
  const limpio: Record<string, string> = {};
  for (const campo of camposDemo) limpio[campo.nombre] = normalizarLinea(datos[campo.nombre]);
  return limpio;
}
