export type Compromiso = {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
};

export const compromisos: Compromiso[] = [
  {
    id: 'soporte-whatsapp',
    icono: 'MessageCircle',
    titulo: 'Soporte por WhatsApp',
    descripcion: 'Atención directa y ágil ante cualquier duda operativa de tu equipo o de tus choferes.',
  },
  {
    id: 'capacitacion',
    icono: 'GraduationCap',
    titulo: 'Capacitación para el equipo',
    descripcion: 'Acompañamos a tus operadores y repartidores para que dominen las herramientas de inmediato.',
  },
  {
    id: 'carga-inicial',
    icono: 'UploadCloud',
    titulo: 'Ayuda para cargar tus datos iniciales',
    descripcion: 'Te asistimos en la configuración de garrafas, listas de precios, vehículos y zonas de entrega.',
  },
  {
    id: 'respaldos',
    icono: 'ShieldCheck',
    titulo: 'Respaldos diarios automáticos',
    descripcion: 'Copias de seguridad periódicas para resguardar toda la actividad de tu distribuidora.',
  },
  {
    id: 'actualizaciones',
    icono: 'Sparkles',
    titulo: 'Actualizaciones sin costo extra',
    descripcion: 'Mejoras continuas en las apps y en el panel incluidas para tu empresa.',
  },
  {
    id: 'datos-separados',
    icono: 'Lock',
    titulo: 'Tus datos separados de otras distribuidoras',
    descripcion: 'Tu información comercial, clientes y pedidos permanecen aislados de forma confidencial.',
  },
];
