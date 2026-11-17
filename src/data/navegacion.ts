export type EnlaceNav = {
  href: string;
  label: string;
};

/** Con la barra adelante: funcionan también desde las páginas legales. */
export const enlacesNav: EnlaceNav[] = [
  { href: '/#producto', label: 'Producto' },
  { href: '/#como-funciona', label: 'En acción' },
  { href: '/#modulos', label: 'Módulos' },
  { href: '/#seguridad', label: 'Seguridad' },
  { href: '/#planes', label: 'Planes' },
];

export const enlacesLegales: EnlaceNav[] = [
  { href: '/privacidad/', label: 'Política de privacidad' },
  { href: '/terminos/', label: 'Términos y condiciones' },
  { href: '/legales/', label: 'Legales' },
];
