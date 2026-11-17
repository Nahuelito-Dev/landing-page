/** Pasos del recorrido «El sistema en acción»: un pedido de punta a punta. */
export type Paso = {
  id: 'pedido' | 'oferta' | 'entrega' | 'panel';
  titulo: string;
  descripcion: string;
};

export const pasos: Paso[] = [
  {
    id: 'pedido',
    titulo: 'El cliente pide',
    descripcion:
      'Desde la app elige las garrafas, la dirección y la franja horaria (o entrega en el día), y paga con Mercado Pago o en efectivo al recibir.',
  },
  {
    id: 'oferta',
    titulo: 'Se asigna el chofer',
    descripcion:
      'El pedido se ofrece solo al chofer libre más cercano, que tiene unos segundos para aceptarlo. Si no responde, pasa al siguiente.',
  },
  {
    id: 'entrega',
    titulo: 'El chofer entrega',
    descripcion:
      'El cliente sigue al chofer en el mapa en tiempo real y confirma la entrega escaneando el QR del chofer.',
  },
  {
    id: 'panel',
    titulo: 'El panel lo muestra',
    descripcion:
      'En el panel el pedido pasa a «Entregado» en el momento, y queda en el historial con su cobro y sus envases.',
  },
];
