import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { useDemoCheckout } from '#/hooks/useDemoCheckout';
import { useStripeCheckoutWeb } from '#/hooks/useStripeCheckoutWeb';
import type { CheckoutDemoStartRequest } from '#/store/billing/billing.types';

const PLANS = [
  { id: 1, name: 'Basico' },
  { id: 2, name: 'Pro' },
  { id: 3, name: 'Enterprise' },
];

export const Route = createFileRoute('/_public/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const { start, isLoading, error } = useDemoCheckout();
  const { startCheckout, isLoading: stripeLoading, error: stripeError } = useStripeCheckoutWeb();
  const [stripeFormError, setStripeFormError] = useState<string | null>(null);
  const [payload, setPayload] = useState<CheckoutDemoStartRequest>({
    plan_id: 1,
    veterinaria_nombre: '',
    veterinaria_slug: '',
    veterinaria_correo: '',
    veterinaria_telefono: '',
    veterinaria_direccion: '',
    admin_nombre: '',
    admin_correo: '',
    admin_password: '',
    admin_telefono: '',
    admin_direccion: '',
  });

  const update = (key: keyof CheckoutDemoStartRequest, value: string | number) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const validateForStripe = () => {
    if (!payload.veterinaria_nombre.trim()) return 'Nombre veterinaria es obligatorio.';
    if (!payload.veterinaria_slug.trim()) return 'Slug veterinaria es obligatorio.';
    if (!/^[a-z0-9-]+$/.test(payload.veterinaria_slug.trim().toLowerCase())) {
      return 'Slug invalido. Usa solo minusculas, numeros y guion.';
    }
    if (!payload.admin_nombre.trim()) return 'Nombre admin es obligatorio.';
    if (!payload.admin_correo.trim()) return 'Correo admin es obligatorio.';
    if (payload.admin_password.length < 8) return 'Password admin debe tener al menos 8 caracteres.';
    return null;
  };

  const onStripePay = async () => {
    setStripeFormError(null);
    const validationError = validateForStripe();
    if (validationError) {
      setStripeFormError(validationError);
      return;
    }

    await start({
      ...payload,
      veterinaria_slug: payload.veterinaria_slug.trim().toLowerCase(),
    });
    await startCheckout();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Pricing</h1>
      <div className="mt-6 rounded-xl bg-white p-6 text-slate-900">
        <h2 className="text-xl font-bold">Comprar plan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Completa tus datos y paga de forma segura con tarjeta.
        </p>
        <div className="mt-4 flex gap-2">
          {PLANS.map((plan) => (
            <Button
              key={plan.id}
              type="button"
              variant={payload.plan_id === plan.id ? 'default' : 'outline'}
              className={payload.plan_id === plan.id ? 'bg-[#7C3AED] hover:bg-[#6A24D4]' : ''}
              onClick={() => update('plan_id', plan.id)}
            >
              {plan.name}
            </Button>
          ))}
        </div>
        {stripeFormError ? <p className="mt-3 text-sm text-red-600">{stripeFormError}</p> : null}
        {stripeError ? <p className="mt-3 text-sm text-red-600">{stripeError}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <Button
          type="button"
          disabled={stripeLoading || isLoading}
          onClick={onStripePay}
          className="mt-5 w-full bg-[#635BFF] hover:bg-[#564FE0]"
        >
          {stripeLoading || isLoading
            ? 'Iniciando pago...'
            : 'Pagar con tarjeta debito/credito'}
        </Button>
      </div>
      <div className="mt-6 grid gap-4 rounded-xl bg-white p-6 text-slate-900 sm:grid-cols-2">
        <Input placeholder="Nombre veterinaria*" value={payload.veterinaria_nombre} onChange={(e) => update('veterinaria_nombre', e.target.value)} required />
        <Input placeholder="Slug veterinaria*" value={payload.veterinaria_slug} onChange={(e) => update('veterinaria_slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} pattern="^[a-z0-9-]+$" required />
        <Input placeholder="Correo veterinaria" type="email" value={payload.veterinaria_correo || ''} onChange={(e) => update('veterinaria_correo', e.target.value)} />
        <Input placeholder="Telefono veterinaria" value={payload.veterinaria_telefono || ''} onChange={(e) => update('veterinaria_telefono', e.target.value)} />
        <Input placeholder="Direccion veterinaria" value={payload.veterinaria_direccion || ''} onChange={(e) => update('veterinaria_direccion', e.target.value)} />
        <div />
        <Input placeholder="Nombre admin*" value={payload.admin_nombre} onChange={(e) => update('admin_nombre', e.target.value)} required />
        <Input placeholder="Correo admin*" type="email" value={payload.admin_correo} onChange={(e) => update('admin_correo', e.target.value)} required />
        <Input placeholder="Password admin* (min 8)" type="password" minLength={8} value={payload.admin_password} onChange={(e) => update('admin_password', e.target.value)} required />
        <Input placeholder="Telefono admin" value={payload.admin_telefono || ''} onChange={(e) => update('admin_telefono', e.target.value)} />
        <Input placeholder="Direccion admin" value={payload.admin_direccion || ''} onChange={(e) => update('admin_direccion', e.target.value)} />
      </div>
    </main>
  );
}
