/** Antes y después: cómo se resuelve cada tema con planilla/cuaderno/WhatsApp y con SPLG. Sin cifras. */
export type Comparacion = {
  icono: string; // lucide-react
  tema: string;
  antes: string;
  despues: string;
};

export const comparaciones: Comparacion[] = [
  {
    icono: 'ClipboardList',
    tema: 'Pedidos',
    antes: 'Llegan por WhatsApp, por teléfono o en persona; se anotan a mano y alguno se pierde entre los mensajes.',
    despues: 'Cada pedido entra por la app o lo carga el panel, con dirección, garrafas y forma de pago, y nadie lo pierde de vista.',
  },
  {
    icono: 'Truck',
    tema: 'Choferes',
    antes: 'Alguien llama a cada chofer para ver quién está libre; el chofer sale sin ruta y pregunta la dirección.',
    despues: 'El pedido se ofrece solo al chofer libre más cercano, que llega con navegación y su hoja de ruta del día.',
  },
  {
    icono: 'Cylinder',
    tema: 'Envases',
    antes: 'No se sabe qué envase quedó en qué casa ni cuántos faltan devolver.',
    despues: 'Cada envase tiene serial e historial: quién lo tiene, desde cuándo y en qué pedido salió.',
  },
  {
    icono: 'Wallet',
    tema: 'Cobros',
    antes: 'Efectivo, transferencias y Mercado Pago se cruzan a fin de mes, a mano y con diferencias.',
    despues: 'Cada cobro queda asentado en la caja y los de Mercado Pago se concilian contra su reporte.',
  },
  {
    icono: 'MapPinned',
    tema: 'El cliente',
    antes: 'Llama para preguntar cuánto falta y nadie sabe bien dónde está el pedido.',
    despues: 'Sigue al chofer en el mapa en vivo y confirma la entrega con un QR.',
  },
  {
    icono: 'History',
    tema: 'Historial',
    antes: 'Lo que pasó queda en la memoria de cada uno o en un cuaderno.',
    despues: 'Cada cambio queda registrado: quién lo hizo, cuándo y qué valor tenía antes.',
  },
];
