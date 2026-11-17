/**
 * Planes y precios de SPLG.
 * Único lugar para tocar precios y beneficios de cada plan.
 */
export type Plan = {
  id: string;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  destacado?: boolean;
  etiqueta?: string;
  beneficios: string[];
};

export const MESES_ANUAL = 10; // se paga 10 meses, se usan 12 ("2 meses gratis")

export const planes: Plan[] = [
  {
    id: 'inicial',
    nombre: 'Inicial',
    descripcion: 'Para arrancar a ordenar los pedidos de una distribuidora chica.',
    precioMensual: 0,
    beneficios: [
      '1 chofer',
      'Hasta 150 pedidos por mes',
      'App del cliente y del chofer',
      'Seguimiento en vivo',
      'Panel básico',
    ],
  },
  {
    id: 'distribuidora',
    nombre: 'Distribuidora',
    descripcion: 'Para el día a día de una distribuidora en marcha.',
    precioMensual: 39,
    destacado: true,
    etiqueta: 'Recomendado',
    beneficios: [
      'Hasta 5 choferes',
      'Pedidos ilimitados',
      'Despacho automático',
      'Zonas de cobertura',
      'Envases con trazabilidad',
      'Reportes de ventas',
      'Pagos con MercadoPago',
    ],
  },
  {
    id: 'flota',
    nombre: 'Flota',
    descripcion: 'Para operaciones grandes o con varias sucursales.',
    precioMensual: 79,
    beneficios: [
      'Choferes ilimitados',
      'Todo lo del plan Distribuidora',
      'Registro de auditoría',
      'Varias sucursales o distribuidoras',
      'Soporte prioritario',
      'Acceso anticipado a los módulos inteligentes',
    ],
  },
];

export function precioAnual(precioMensual: number): number {
  return precioMensual * MESES_ANUAL;
}
