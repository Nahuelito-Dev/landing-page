/**
 * Módulos inteligentes de SPLG (splg-docs/sistema/DISENO-MODULOS-INTELIGENTES.md, M1–M6, y
 * DISENO-CH-BOT.md, M8). Cada distribuidora los activa y ajusta desde el panel. El M7 (venta por
 * WhatsApp) no se construyó: no va.
 */
export type ModuloInteligente = {
  icono: string; // nombre de ícono de lucide-react
  titulo: string;
  descripcion: string;
  destacado?: boolean;
};

export const modulosInteligentes: ModuloInteligente[] = [
  {
    icono: 'Navigation',
    titulo: 'Despacho automático',
    descripcion:
      'Ofrece cada pedido al chofer libre más cercano, de a uno y con tiempo para aceptar; si no responde, pasa al siguiente y amplía el radio.',
    destacado: true,
  },
  {
    icono: 'Wrench',
    titulo: 'Planificador de taller',
    descripcion:
      'Proyecta service, RTO, seguro y licencias de cada vehículo y propone ventanas de taller que no dejen la zona sin choferes.',
  },
  {
    icono: 'RefreshCw',
    titulo: 'Recompra anticipada',
    descripcion: 'Estima cuándo se le termina la garrafa a cada cliente según su consumo y le avisa a tiempo para que vuelva a pedir.',
  },
  {
    icono: 'Route',
    titulo: 'Agrupación por recorrido',
    descripcion: 'Junta en un mismo viaje los pedidos cercanos entre sí para que el chofer haga menos kilómetros.',
  },
  {
    icono: 'PackageX',
    titulo: 'Recupero de envases',
    descripcion: 'Detecta los envases que quedaron en manos de clientes y ordena la gestión para que vuelvan.',
  },
  {
    icono: 'ScanText',
    titulo: 'Lector de documentos',
    descripcion:
      'Escanea facturas, pólizas, licencias y comprobantes al subirlos, propone los datos y el administrador confirma lo que mueve plata.',
  },
  {
    icono: 'MessagesSquare',
    titulo: 'Asistente del chat',
    descripcion:
      'Contesta las consultas frecuentes de tus clientes con lo que carga la distribuidora, avisa que es una respuesta automática y pasa a una persona cuando hace falta.',
  },
];

/** Piezas propias del sistema que no son módulos inteligentes pero lo distinguen. */
export const piezasPropias: Array<{ icono: string; titulo: string; descripcion: string }> = [
  {
    icono: 'ScrollText',
    titulo: 'Hoja de ruta',
    descripcion: 'El recorrido del día de cada chofer, con sus paradas en orden y en PDF.',
  },
  {
    icono: 'Cylinder',
    titulo: 'Trazabilidad de envases',
    descripcion: 'Serial, estado e historial de movimientos de cada envase físico.',
  },
  {
    icono: 'Calculator',
    titulo: 'Caja y conciliación con Mercado Pago',
    descripcion: 'Cada cobro asentado en la caja y los de Mercado Pago cruzados con su reporte de liberaciones.',
  },
  {
    icono: 'MessageCircle',
    titulo: 'Chat con el cliente y el chofer',
    descripcion: 'Conversaciones del equipo con cada cliente y cada chofer, con adjuntos, desde el panel.',
  },
];
