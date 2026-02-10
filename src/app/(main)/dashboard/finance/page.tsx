import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCashCutState, getCashCutsHistory } from '@/features/dashboard/actions/cash-cut-actions';
import { CashCutForm } from '@/features/dashboard/components/caja/CashCutForm';
import { CashCutsHistory } from '@/features/dashboard/components/caja/CashCutHistory';
import { ExpenseModal } from '@/features/dashboard/components/caja/ExpenseModal';
import { ExportReportButton } from '@/features/dashboard/components/caja/ExportReportButton';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Wallet, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';

export const metadata: Metadata = {
    title: 'Finanzas | SastrePro',
    description: 'Gestión de caja y movimientos',
};

// Componente para tarjetas de resumen
function StatCard({ title, value, icon, color, subvalue }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
                {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
            </div>
            <div className={`p-4 rounded-2xl ${color}`}>
                {icon}
            </div>
        </div>
    );
}

export default async function FinancePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile for branch_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile?.assigned_branch_id) {
        return <div>No tienes una sucursal asignada.</div>;
    }

    const branchId = profile.assigned_branch_id;

    // Fetch new Cash Cut state and History
    const [cashStateRes, historyRes] = await Promise.all([
        getCashCutState(branchId),
        getCashCutsHistory(branchId)
    ]);

    const cashState = cashStateRes.success ? cashStateRes.data : null;
    const history = historyRes.success ? historyRes.data : [];

    const totals = cashState?.totals || { calculatedCash: 0, totalSales: 0, totalExpenses: 0 };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center pl-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Finanzas</h1>
                    <p className="text-slate-500 font-medium">Corte continuo y control de caja</p>
                </div>
                <div className="flex gap-3">
                    <ExpenseModal
                        branchId={branchId}
                        userId={user.id}
                        disabled={false} // Always enabled in continuous mode
                    />
                    <ExportReportButton cashState={cashState} />
                </div>
            </div>

            {/* KPIs en tiempo real (Calculated from validation range) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Efectivo en Caja (Sistema)"
                    value={formatCurrency(totals.calculatedCash)}
                    icon={<Wallet size={24} className="text-emerald-600" />}
                    color="bg-emerald-100"
                    subvalue="Acumulado actual"
                />
                <StatCard
                    title="Ventas Totales (Periodo)"
                    value={formatCurrency(totals.totalSales)}
                    icon={<TrendingUp size={24} className="text-indigo-600" />}
                    color="bg-indigo-100"
                    subvalue="Desde último corte"
                />
                <StatCard
                    title="Gastos (Periodo)"
                    value={formatCurrency(totals.totalExpenses)}
                    icon={<TrendingDown size={24} className="text-rose-600" />}
                    color="bg-rose-100"
                    subvalue="Operativos + Retiros"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Columna Principal: Formulario de Corte */}
                <div className="xl:col-span-2 space-y-8">
                    <CashCutForm branchId={branchId} userId={user.id} />

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 pl-2">Historial de Cortes</h3>
                        <CashCutsHistory cuts={history} />
                    </div>
                </div>

                {/* Columna Lateral: Movimientos Recientes (In current period) */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm rounded-[2rem]">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-slate-400" />
                                Movimientos del Periodo
                            </h3>

                            <div className="space-y-4">
                                {cashState?.transactions?.expenses?.length === 0 && (
                                    <p className="text-slate-400 text-center py-4">No hay gastos registrados</p>
                                )}
                                {cashState?.transactions?.expenses?.map((mov: any) => (
                                    <div key={mov.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-700">{mov.concept}</p>
                                            <p className="text-xs text-slate-400">{mov.category}</p>
                                        </div>
                                        <p className={`font-bold ${mov.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {mov.type === 'income' ? '+' : '-'}{formatCurrency(mov.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
