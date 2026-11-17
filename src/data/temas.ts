/**
 * Temas del selector «Probá el color de tu distribuidora». Son tres de los colores listos del
 * panel (splg-app-admin/src/theme/themePresets.ts); los valores de cada rol están en
 * src/styles/tokens.css, calculados con el generador de tema del back.
 */
export type Tema = {
  id: 'amarillo' | 'violeta' | 'verde';
  nombre: string;
};

export const temas: Tema[] = [
  { id: 'amarillo', nombre: 'Amarillo anaranjado' },
  { id: 'violeta', nombre: 'Violeta' },
  { id: 'verde', nombre: 'Verde' },
];

export const TEMA_POR_OMISION: Tema['id'] = 'amarillo';

/** Clave de localStorage donde queda la elección. */
export const CLAVE_TEMA = 'splg-landing-tema';

/** Clave de localStorage del modo elegido con el interruptor ('claro' | 'oscuro'); sin clave, sigue al sistema. */
export const CLAVE_MODO = 'splg-landing-modo';
