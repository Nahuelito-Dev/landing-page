/**
 * Dominio publicado de la landing. Lo usan `astro.config.mjs` (`site`) y la Edge Function del formulario
 * (orígenes permitidos). Sin imports: la función corre en Deno.
 */
export const DOMINIO = 'splg-gas.netlify.app';
export const URL_SITIO = `https://${DOMINIO}`;
