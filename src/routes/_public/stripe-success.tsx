import { useEffect, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '#/components/ui/button';
import { useDemoCheckout } from '#/hooks/useDemoCheckout';

export const Route = createFileRoute('/_public/stripe-success')({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout_token:
      typeof search.checkout_token === 'string' ? search.checkout_token : undefined,
  }),
  component: StripeSuccessPage,
});

function StripeSuccessPage() {
  const navigate = useNavigate();
  const { confirm, isLoading, error } = useDemoCheckout();
  const { checkout_token: checkoutToken } = Route.useSearch();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await confirm(checkoutToken);
        setConfirmed(true);
        setTimeout(() => {
          navigate({ to: '/login', search: { register: false } });
        }, 1200);
      } catch {
        // Se muestra error en pantalla si falla confirmacion
      }
    };
    run();
  }, [checkoutToken, confirm, navigate]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-10">
      <div className="rounded-2xl bg-white p-8 text-slate-900">
        <h1 className="text-2xl font-bold">Pago completado</h1>
        <p className="mt-2 text-slate-600">
          {confirmed
            ? 'Pago confirmado. Tu cuenta fue creada, redirigiendo a login...'
            : 'Confirmando pago y creando tu cuenta...'}
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <Button asChild className="mt-6 w-full bg-[#F97316] hover:bg-[#EA580C]">
          <Link to="/login" search={{ register: false }}>Ir a login</Link>
        </Button>
        {isLoading ? <p className="mt-3 text-xs text-slate-500">Procesando...</p> : null}
      </div>
    </main>
  );
}
