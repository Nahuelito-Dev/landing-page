/**
 * Testimonios de distribuidoras de SPLG.
 * Para la entrega académica / muestra de cátedra se presentan testimonios ilustrativos
 * de distribuidoras ficticias en Misiones y Corrientes.
 */
export type Testimonio = {
  cita: string;
  nombre: string;
  cargo: string;
  distribuidora: string;
  ciudad?: string;
};

export const testimonios: Testimonio[] = [
  {
    cita: 'El despacho automático asigna cada garrafa al móvil más cercano en segundos; dejamos de coordinar a mano por radio y bajamos los tiempos de viaje.',
    nombre: 'Carlos Sanabria',
    cargo: 'Jefe de distribución',
    distribuidora: 'Gas del Alto Paraná',
    ciudad: 'Eldorado, Misiones',
  },
  {
    cita: 'El control de envases nos resolvió el cuadre de vacíos y llenos al final de cada turno; sabemos al instante qué tiene cada chofer en su camioneta.',
    nombre: 'Marina Velozo',
    cargo: 'Responsable de logística',
    distribuidora: 'Distribuidora Iberá Gas',
    ciudad: 'Goya, Corrientes',
  },
  {
    cita: 'Poder cobrar con Mercado Pago desde la app y conciliar el pago en el panel al instante nos ahorró discusiones de cambio y pérdidas de efectivo en la calle.',
    nombre: 'Jorge Alvarenga',
    cargo: 'Socio gerente',
    distribuidora: 'Luz de Misiones Gas',
    ciudad: 'Posadas, Misiones',
  },
];
