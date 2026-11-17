import { describe, expect, it } from 'vitest';
import { compromisos } from '../src/data/compromisos';
import { testimonios } from '../src/data/testimonios';

describe('Piezas de portfolio portadas a la landing', () => {
  it('compromisos: define exactamente 6 tarjetas con textos sin cifras', () => {
    expect(compromisos).toHaveLength(6);

    for (const c of compromisos) {
      expect(c.id).toBeTruthy();
      expect(c.icono).toBeTruthy();
      expect(c.titulo).toBeTruthy();
      expect(c.descripcion).toBeTruthy();
      // "Cada texto, una frase concreta, sin cifras."
      expect(c.descripcion).not.toMatch(/\d+/);
    }
  });

  it('testimonios: define 3 testimonios ilustrativos de distribuidoras en Misiones o Corrientes', () => {
    expect(testimonios).toHaveLength(3);

    for (const t of testimonios) {
      expect(t.cita.length).toBeGreaterThan(20);
      expect(t.nombre).toBeTruthy();
      expect(t.cargo).toBeTruthy();
      expect(t.distribuidora).toBeTruthy();
      // No debe ser Florchi Gas
      expect(t.distribuidora.toLowerCase()).not.toContain('florchi');
      // Debe ser de Misiones o Corrientes
      expect(t.ciudad).toMatch(/(Misiones|Corrientes)/);
    }

    // Verificar que cubren los beneficios requeridos
    const textoCompleto = testimonios.map((t) => t.cita).join(' ');
    expect(textoCompleto.toLowerCase()).toContain('despacho automático');
    expect(textoCompleto.toLowerCase()).toContain('envases');
    expect(textoCompleto.toLowerCase()).toContain('mercado pago');
  });
});
