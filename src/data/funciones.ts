export type Funcion = {
  icono: string; // nombre de ícono de lucide-react
  titulo: string;
  descripcion: string;
};

export type BloqueFunciones = {
  id: string;
  titulo: string;
  bajada: string;
  items: Funcion[];
};

export const bloquesFunciones: BloqueFunciones[] = [
  {
    id: 'cliente',
    titulo: 'App del cliente',
    bajada: 'Pedir una garrafa, sin llamadas ni esperas a ciegas.',
    items: [
      {
        icono: 'ShoppingCart',
        titulo: 'Pedido en pocos toques',
        descripcion: 'Elige cantidad, dirección y franja horaria, o pide entrega en el día.',
      },
      {
        icono: 'CreditCard',
        titulo: 'MercadoPago o efectivo',
        descripcion: 'Paga como le quede más cómodo, sin fricciones al confirmar.',
      },
      {
        icono: 'MapPin',
        titulo: 'Seguimiento en vivo',
        descripcion: 'Ve al chofer acercarse en el mapa en tiempo real, sin llamar para preguntar.',
      },
      {
        icono: 'QrCode',
        titulo: 'Confirmación con QR',
        descripcion: 'La entrega se confirma escaneando el QR del chofer al recibir.',
      },
      {
        icono: 'Star',
        titulo: 'Calificación y reclamos',
        descripcion: 'Puntúa el servicio y hace reclamos directamente desde la app.',
      },
    ],
  },
  {
    id: 'chofer',
    titulo: 'App del chofer',
    bajada: 'Recibir pedidos ordenados, sin planillas ni llamados cruzados.',
    items: [
      {
        icono: 'Bell',
        titulo: 'Ofertas de pedidos por cercanía',
        descripcion: 'Recibe pedidos según su posición y puede aceptarlos o rechazarlos.',
      },
      {
        icono: 'Navigation',
        titulo: 'Navegación integrada',
        descripcion: 'Abre Google Maps o Waze para llegar directo al domicilio.',
      },
      {
        icono: 'BellRing',
        titulo: 'Aviso de llegada',
        descripcion: 'Notifica al cliente en el momento en que llega al domicilio.',
      },
      {
        icono: 'QrCode',
        titulo: 'QR de entrega',
        descripcion: 'Muestra su QR para que el cliente confirme la entrega.',
      },
      {
        icono: 'AlertTriangle',
        titulo: 'Reporte de incidencias',
        descripcion: 'Informa problemas en el camino o en la entrega desde la misma app.',
      },
    ],
  },
  {
    id: 'panel',
    titulo: 'Panel de la distribuidora',
    bajada: 'Ver y controlar toda la operación desde un solo lugar.',
    items: [
      {
        icono: 'LayoutDashboard',
        titulo: 'Tablero del día',
        descripcion: 'Ventas y pedidos del día, y pedidos en vivo a medida que se generan.',
      },
      {
        icono: 'Truck',
        titulo: 'Choferes y vehículos',
        descripcion: 'Alta, validación y activación de choferes y de la flota.',
      },
      {
        icono: 'Map',
        titulo: 'Zonas de cobertura',
        descripcion: 'Se dibujan en el mapa, con recargo configurable por zona.',
      },
      {
        icono: 'Flame',
        titulo: 'Catálogo y stock',
        descripcion: 'Garrafas con stock actualizado y promociones por cantidad.',
      },
      {
        icono: 'PackageSearch',
        titulo: 'Envases con trazabilidad',
        descripcion: 'Cada envase físico con serial, estados e historial de movimientos.',
      },
      {
        icono: 'Wallet',
        titulo: 'Reservas con seña',
        descripcion: 'El cliente puede reservar un pedido dejando una seña.',
      },
      {
        icono: 'MessageSquareWarning',
        titulo: 'Reclamos e incidencias',
        descripcion: 'Se registran y gestionan desde el mismo panel.',
      },
      {
        icono: 'BarChart3',
        titulo: 'Reportes de ventas',
        descripcion: 'Por chofer, por producto, por medio de pago y su evolución en el tiempo.',
      },
      {
        icono: 'ShieldCheck',
        titulo: 'Auditoría y multi-distribuidora',
        descripcion: 'Registro de toda operación y datos aislados entre distribuidoras.',
      },
    ],
  },
];
