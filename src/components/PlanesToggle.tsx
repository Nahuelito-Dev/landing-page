import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { MESES_ANUAL, precioAnual, type Plan } from '../data/planes';

type Props = {
  planes: Plan[];
};

export default function PlanesToggle({ planes }: Props) {
  const [anual, setAnual] = useState(false);
  const idToggle = useId();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!anual ? 'text-ink' : 'text-muted'}`}>Mensual</span>
        <button
          type="button"
          role="switch"
          aria-checked={anual}
          aria-labelledby={idToggle}
          onClick={() => setAnual((v) => !v)}
          className="relative h-7 w-12 shrink-0 rounded-full bg-outline-strong transition-colors data-[on=true]:bg-primary"
          data-on={anual}
        >
          <span
            className="absolute left-1 top-1 h-5 w-5 rounded-full bg-surface shadow transition-transform"
            style={{ transform: anual ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
        <span id={idToggle} className={`text-sm font-medium ${anual ? 'text-ink' : 'text-muted'}`}>
          Anual
          <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-strong">
            2 meses gratis
          </span>
        </span>
      </div>

      <div className="mx-auto mt-10 grid max-w-md gap-5 lg:max-w-5xl lg:grid-cols-3 lg:items-stretch">
        {planes.map((plan) => {
          const precio = anual ? precioAnual(plan.precioMensual) : plan.precioMensual;
          const periodo = plan.precioMensual === 0 ? '' : anual ? '/año' : '/mes';

          return (
            <div
              key={plan.id}
              className={`tarjeta relative flex flex-col rounded-2xl border p-7 ${
                plan.destacado
                  ? 'border-primary bg-surface shadow-[0_24px_48px_-24px_rgb(16_24_40/0.35)] ring-1 ring-primary'
                  : 'border-outline bg-surface-sunken/80 backdrop-blur'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold tracking-tight text-ink">{plan.nombre}</h3>
                {plan.etiqueta && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-on-primary">
                    {plan.etiqueta}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted">{plan.descripcion}</p>

              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold tracking-tight text-ink">
                  {plan.precioMensual === 0 ? 'Gratis' : `US$ ${precio}`}
                </span>
                {periodo && <span className="text-sm text-muted">{periodo}</span>}
              </p>
              <p className="mt-1 min-h-4 text-xs text-muted">
                {anual && plan.precioMensual > 0
                  ? `Equivale a ${MESES_ANUAL} pagos mensuales, se usan los 12 meses.`
                  : ''}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-outline pt-6">
                {plan.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <Check size={16} strokeWidth={2.4} className="mt-0.5 shrink-0 text-primary-strong" aria-hidden="true" />
                    {beneficio}
                  </li>
                ))}
              </ul>

              <a
                href="#demo"
                className={`enlace-flecha mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold ${
                  plan.destacado ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {plan.precioMensual === 0 ? 'Empezar gratis' : 'Hablemos'}
                <span className="flecha" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
