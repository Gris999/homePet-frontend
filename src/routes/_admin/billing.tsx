import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '#/components/ui/button';
import { TrialBanner } from '#/components/TrialBanner';
import { useUpgradeDemo } from '#/hooks/useUpgradeDemo';
import { useAppSelector } from '#/store/hooks';
import { Check, X, Shield, Users, PawPrint, Smartphone, Award, Clock, FileText } from 'lucide-react';

export const Route = createFileRoute('/_admin/billing')({
  component: BillingPage,
});

const PRICING_TIERS = [
  {
    id: 1,
    name: 'Básico',
    price: 'Bs. 99',
    description: 'Esencial para veterinarias pequeñas.',
    features: { mobile: false, reports: true, backup: false },
    limits: { users: 3, pets: 100 },
  },
  {
    id: 2,
    name: 'Pro',
    price: 'Bs. 199',
    description: 'Perfecto para clínicas en crecimiento.',
    features: { mobile: true, reports: true, backup: true },
    limits: { users: 10, pets: 1000 },
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 'Bs. 399',
    description: 'Todo lo necesario para grandes operaciones.',
    features: { mobile: true, reports: true, backup: true },
    limits: { users: 999, pets: 99999 },
  },
];

function BillingPage() {
  const plan = useAppSelector((state) => state.tenant.plan as any);
  const { start, confirm, isLoading, error } = useUpgradeDemo();
  const [selectedPlanId, setSelectedPlanId] = useState(2); // Default to Pro
  const [checkoutToken, setCheckoutToken] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const planStatus = useMemo(() => {
    return plan?.estado_suscripcion || plan?.subscription_status || plan?.estado || 'TRIAL';
  }, [plan]);

  const activePlanName = useMemo(() => {
    return plan?.nombre || 'Básico';
  }, [plan]);

  const onStart = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      const data = await start(selectedPlanId);
      setCheckoutToken(data.checkout_token);
    } catch {
      // Error handled by hook
    }
  };

  const onConfirm = async () => {
    if (!checkoutToken) return;
    try {
      await confirm(checkoutToken);
      setCheckoutToken('');
      setSuccessMsg('Plan actualizado con éxito de forma temporal.');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-slate-900">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-wide">Mi Plan SaaS</h1>
        <p className="mt-1 text-sm text-slate-600">
          Administra tu suscripción de PetHome, consulta tus límites y realiza upgrades.
        </p>
      </div>

      <TrialBanner />

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Current Plan Card */}
        <div className="md:col-span-2 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#6A24D4]/10 p-2.5 text-[#6A24D4]">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Plan Actual</h2>
                  <p className="text-xs text-slate-500 font-medium">Suscripción activa en la plataforma</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                planStatus.toUpperCase() === 'ACTIVA' || planStatus.toUpperCase() === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <Clock className="h-3 w-3" />
                {planStatus}
              </span>
            </div>

            <div className="mt-2">
              <h3 className="text-3xl font-black text-[#6A24D4] uppercase tracking-wide">
                {activePlanName}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Límites y características de tu veterinaria:</p>
            </div>

            {/* Plan Limits Grid */}
            <div className="grid grid-cols-2 gap-4 mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 border border-slate-100 text-slate-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Límite Usuarios</span>
                  <span className="text-sm font-bold text-slate-800">
                    {plan?.limite_usuarios ?? 3} usuarios
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 border border-slate-100 text-slate-700">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Límite Mascotas</span>
                  <span className="text-sm font-bold text-slate-800">
                    {plan?.limite_mascotas ?? 100} registrados
                  </span>
                </div>
              </div>
            </div>

            {/* Features Enabled Checkbox List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-2 text-sm">
                {plan?.permite_app_movil ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <Smartphone className="h-4 w-4 text-slate-400" />
                  App Móvil Cliente
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {plan?.permite_reportes ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Reportes Avanzados
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {plan?.permite_backup ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Copias de Seguridad
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4 text-xs text-slate-400 font-medium">
            Renueva o actualiza tu suscripción en cualquier momento seleccionando un plan a la derecha.
          </div>
        </div>

        {/* Upgrade Controls Card */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={onStart} className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg border-b pb-3 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#F97316]" />
                Actualizar Plan
              </h3>
              
              <p className="text-xs text-slate-500 font-medium mb-4">
                Elige el plan que mejor se adapte a tu crecimiento e inicia la renovación:
              </p>

              <div className="space-y-3.5">
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => {
                      if (!checkoutToken) setSelectedPlanId(tier.id);
                    }}
                    className={`relative rounded-xl border p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-[#6A24D4] bg-[#6A24D4]/5 ring-1 ring-[#6A24D4]'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${checkoutToken ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {tier.name}
                      </span>
                      <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                        {tier.limits.users === 999 ? 'Usuarios ilimitados' : `${tier.limits.users} usuarios`} · {tier.limits.pets === 99999 ? 'Mascotas ilimitadas' : `${tier.limits.pets} mascotas`}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#6A24D4]">
                      {tier.price} <span className="text-[10px] text-slate-400 font-normal">/mes</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-6">
              {!checkoutToken ? (
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl h-10 transition-colors shadow-sm"
                >
                  {isLoading ? 'Iniciando checkout...' : 'Iniciar Upgrade / Renovación'}
                </Button>
              ) : (
                <div className="space-y-2.5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-amber-800 font-semibold">Sesión de checkout creada en Demo</p>
                  </div>
                  <Button
                    disabled={isLoading}
                    type="button"
                    onClick={onConfirm}
                    className="w-full bg-[#6A24D4] hover:bg-[#5b1fbc] text-white font-bold rounded-xl h-10 transition-colors shadow-sm"
                  >
                    {isLoading ? 'Confirmando...' : 'Confirmar Upgrade Demo'}
                  </Button>
                </div>
              )}

              {error ? (
                <p className="text-xs font-semibold text-red-600 text-center bg-red-50 border border-red-100 rounded-xl p-2.5">
                  {error}
                </p>
              ) : null}

              {successMsg ? (
                <p className="text-xs font-semibold text-emerald-600 text-center bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  {successMsg}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
