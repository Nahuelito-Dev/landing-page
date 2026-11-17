export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
};

export const preguntasFrecuentes: PreguntaFrecuente[] = [
  {
    pregunta: '¿Necesito que mis clientes descarguen una app?',
    respuesta:
      'Sí, el cliente pide desde la app de SPLG (Android e iOS). Es gratuita y el pedido se hace en pocos toques.',
  },
  {
    pregunta: '¿Cómo cobro?',
    respuesta:
      'El cliente paga con MercadoPago desde la app o en efectivo al recibir. Vos ves cada cobro en el panel, con reportes por medio de pago.',
  },
  {
    pregunta: '¿Qué pasa si el chofer no acepta?',
    respuesta:
      'El despacho es automático: si el chofer más cercano no acepta a tiempo, el pedido pasa al siguiente y el radio de búsqueda se amplía hasta encontrar uno disponible.',
  },
  {
    pregunta: '¿Mis datos están separados de otras distribuidoras?',
    respuesta:
      'Sí, cada distribuidora es una unidad aislada: sólo ve sus propios pedidos, choferes, clientes y reportes.',
  },
  {
    pregunta: '¿Puedo probarlo?',
    respuesta:
      'Sí, el plan Inicial es gratis y alcanza para arrancar con un chofer y hasta 150 pedidos por mes.',
  },
  {
    pregunta: '¿Funciona en mi ciudad?',
    respuesta:
      'Sí. La zona de cobertura se configura dibujándola en el mapa del panel, con el recargo que definas para cada zona.',
  },
  {
    pregunta: '¿Mis datos están seguros?',
    respuesta:
      'Los archivos se guardan cifrados y se abren con links que vencen a los pocos minutos, cada cambio queda auditado, la base se respalda todos los días y el soporte sólo entra a tus datos si vos lo aprobás.',
  },
  {
    pregunta: '¿Qué son los módulos inteligentes?',
    respuesta:
      'Procesos que deciden solos con los datos de tu operación: despacho automático, planificador de taller, recompra anticipada, agrupación por recorrido, recupero de envases, lector de documentos y asistente del chat. Cada uno se activa desde el panel.',
  },
  {
    pregunta: '¿Puedo usar los colores de mi distribuidora?',
    respuesta:
      'Sí. Desde el panel elegís el color de tu marca y el sistema arma el resto de los tonos cuidando que todo se lea bien.',
  },
  {
    pregunta: '¿Quién hace SPLG?',
    respuesta: 'SPLG es un producto de OrixTech (Nahuel Wagner), hecho en Misiones, Argentina.',
  },
];
