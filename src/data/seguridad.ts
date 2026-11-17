/**
 * Seguridad y datos: sólo lo que el sistema hace hoy (verificado en splg-app-backend). Nada de
 * certificaciones. `detalle` se usa en la página /seguridad.
 */
export type PuntoSeguridad = {
  icono: string; // lucide-react
  titulo: string;
  resumen: string;
  detalle: string[];
};

export const puntosSeguridad: PuntoSeguridad[] = [
  {
    icono: 'FileLock',
    titulo: 'Archivos cifrados y links firmados',
    resumen: 'Fotos, comprobantes y documentos se guardan cifrados y sólo se abren con links que vencen a los pocos minutos.',
    detalle: [
      'Cada archivo que sube la distribuidora, un chofer o un cliente (fotos, comprobantes, pólizas, licencias) se guarda cifrado en el almacenamiento (AES-256).',
      'Ningún archivo es público: para verlo, el sistema genera un link firmado que vence a los 5 minutos y sólo se entrega a quien tiene permiso.',
      'Los archivos se validan al subirlos (tipo y tamaño) antes de guardarlos.',
    ],
  },
  {
    icono: 'FileClock',
    titulo: 'Auditoría de cada cambio',
    resumen: 'Cada alta, cambio y baja queda registrada: quién la hizo, cuándo y qué valor tenía antes.',
    detalle: [
      'La base de datos registra cada cambio de cada dato con quién lo hizo y el valor anterior y el nuevo.',
      'También queda registrada cada operación que se hace desde el panel y cada ingreso al panel.',
      'Las bajas son lógicas: lo que se da de baja deja de usarse pero no se borra, y su historia se puede consultar.',
    ],
  },
  {
    icono: 'DatabaseBackup',
    titulo: 'Respaldos diarios',
    resumen: 'La base se respalda todos los días y se guardan los respaldos de las últimas dos semanas.',
    detalle: [
      'Un proceso automático hace una copia completa de la base de datos una vez por día.',
      'Se conservan las copias de los últimos 14 días; si un respaldo falla, el equipo de OrixTech (Nahuel Wagner) recibe un aviso.',
    ],
  },
  {
    icono: 'UserCog',
    titulo: 'Roles y permisos',
    resumen: 'Administradores, personal, choferes y clientes ven sólo lo suyo; el personal administra con roles armados por permisos.',
    detalle: [
      'Cada cuenta tiene un tipo (administrador de la distribuidora, chofer o cliente) y el servidor controla en cada pedido qué puede hacer.',
      'El personal de la distribuidora entra como administrador con un rol armado por permisos: cada rol habilita sólo lo que necesita esa tarea, por ejemplo ver la caja sin poder cambiar precios.',
      'El acceso es con usuario y contraseña, y el servidor limita la cantidad de pedidos por minuto para frenar abusos.',
    ],
  },
  {
    icono: 'LifeBuoy',
    titulo: 'Soporte sólo con tu permiso',
    resumen: 'El soporte de OrixTech (Nahuel Wagner) entra a los datos de tu empresa sólo si lo aprobás, en sólo lectura y con todo registrado.',
    detalle: [
      'Para mirar los datos de una distribuidora, el soporte tiene que pedir acceso con un motivo, y la distribuidora lo aprueba o lo rechaza.',
      'La sesión de soporte es de sólo lectura, vence sola y la distribuidora puede cortarla en cualquier momento.',
      'La distribuidora ve qué consultó el soporte en cada sesión.',
    ],
  },
  {
    icono: 'Building2',
    titulo: 'Datos separados por distribuidora',
    resumen: 'Cada distribuidora ve únicamente sus pedidos, clientes, choferes y reportes.',
    detalle: [
      'Cada distribuidora es una unidad aislada: el servidor filtra cada consulta por la empresa de quien la hace.',
      'Los pagos con tarjeta los procesa Mercado Pago: SPLG no ve ni guarda datos de tarjetas.',
    ],
  },
];
