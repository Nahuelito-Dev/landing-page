/**
 * Datos de contacto de SPLG. Cada canal se muestra sólo si está cargado: sin
 * mail, el botón de mail no aparece.
 */
export const contacto = {
  /**
   * Número en formato internacional sin signos. Los celulares de Argentina
   * llevan el 9 después del 54 (+54 9 3755 69-6734): así lo pide wa.me.
   */
  whatsapp: '5493755696734',
  /** El mismo número, como se lee */
  whatsappVisible: '+54 9 3755 69-6734',
  /** Casilla de mail de contacto comercial */
  email: '',
  /** Mensaje precargado del WhatsApp */
  mensajeWhatsapp: 'Hola, quiero conocer más sobre SPLG para mi distribuidora.',
  /** Mensaje precargado del botón «Pedir una demo» */
  mensajeDemo: 'Hola, quiero pedir una demo de SPLG para mi distribuidora.',
  /** Asunto precargado del mail */
  asuntoEmail: 'Quiero conocer SPLG',
};

if (!contacto.whatsapp || !contacto.email) {
  // eslint-disable-next-line no-console
  console.warn(
    `[SPLG] Falta ${!contacto.whatsapp ? 'el WhatsApp' : 'el mail'} en src/config/contacto.ts: ese canal no se muestra.`,
  );
}

export function linkWhatsapp(mensaje: string = contacto.mensajeWhatsapp): string | null {
  if (!contacto.whatsapp) return null;
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** WhatsApp con el pedido de demo precargado. */
export function linkDemo(): string | null {
  return linkWhatsapp(contacto.mensajeDemo);
}

export function linkEmail(): string | null {
  if (!contacto.email) return null;
  return `mailto:${contacto.email}?subject=${encodeURIComponent(contacto.asuntoEmail)}`;
}
