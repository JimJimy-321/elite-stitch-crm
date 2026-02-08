import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDailyCashSummary } from '@/features/dashboard/actions/cash-actions';
import { ExpenseModal } from '@/features/dashboard/components/caja/ExpenseModal';
import { CloseDayModal } from '@/features/dashboard/components/caja/CloseDayModal';
import { MovementsList } from '@/features/dashboard/components/caja/MovementsList';
import { ExportReportButton } from '@/features/dashboard/components/caja/ExportReportButton'; // Importado
import { Wallet, Calendar, Activity, Receipt, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/lib/utils';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    // Obtener perfil para saber sucursal
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_branch_id, role, organization_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.assigned_branch_id) {
        return (
            <div className="p-20 text-center font-bold text-slate-400">
                NO HAY SUCURSAL ASIGNADA
            </div>
        );
    }

    // Fix: Obtener fecha en zona horaria de México (UTC-6) para evitar salto de día prematuro a las 6PM
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const { data: cashData, success } = await getDailyCashSummary(profile.assigned_branch_id, today);

    if (!success || !cashData) {
        return <div className="p-20 text-center text-red-500">Error al cargar datos financieros.</div>;
    }

    const { summary, movements, isClosed } = cashData;

    // Calcular totales para los stats superiores
    const totalIncomeDay = summary.cashIncome + summary.cardIncome + summary.transferIncome;

    // Meta Mensual (Hardcoded por ahora, luego vendrá de settings)
    const MONTHLY_GOAL = 50000;
    const monthlyProgress = Math.min((summary.monthlyTotal / MONTHLY_GOAL) * 100, 100);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Wallet className="text-orange-600" size={28} />
                        </div>
                        Control Financiero
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Monitoreo en tiempo real de ingresos, egresos y salud fiscal de tu negocio.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Integration of Action Buttons */}
                    {!isClosed && (
                        <>
                            <ExpenseModal branchId={profile.assigned_branch_id} userId={user.id} />
                            <CloseDayModal branchId={profile.assigned_branch_id} calculatedCash={summary.cashBalance} />
                        </>
                    )}
                    {isClosed && (
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-bold border border-green-200 flex items-center gap-2">
                            <span>🔒 Caja Cerrada</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-xl shadow-slate-200/50 ml-4">
                        <Calendar size={20} className="text-orange-500" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest px-2 border-l border-slate-100 italic capitalize">
                            {new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats del Día */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FinanceStat label="Ingresos Hoy" value={formatCurrency(totalIncomeDay)} trend="Día" positive border="border-l-indigo-500" />
                <FinanceStat label="Gastos Hoy" value={formatCurrency(summary.totalExpenses)} trend="Día" negative border="border-l-rose-500" />
                <FinanceStat label="Efectivo Teórico" value={formatCurrency(summary.cashBalance)} trend="Caja" positive primary border="border-l-orange-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Daily Cash Flow -> Usando componente reutilizado o adaptado */}
                <div className="xl:col-span-2 glass-card border-none shadow-2xl overflow-hidden bg-white rounded-[2rem]">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg tracking-tight">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Activity size={20} className="text-orange-600" />
                            </div>
                            Monitor de Caja Diario
                        </h3>
                        <ExportReportButton
                            date={today}
                            summary={summary}
                            movements={movements}
                        />
                    </div>

                    <div className="p-10 space-y-10">
                        {/* KPI Grid detallado */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                            <MiniStat label="Saldo Inicial" value={formatCurrency(summary.openingBalance || 0)} icon={<Wallet size={14} />} subtle />
                            <MiniStat label="Efectivo" value={formatCurrency(summary.cashIncome)} icon={<DollarSign size={14} />} />
                            <MiniStat label="Tarjeta" value={formatCurrency(summary.cardIncome)} icon={<CreditCard size={14} />} />
                            <MiniStat label="Gastos" value={formatCurrency(summary.totalExpenses)} icon={<Receipt size={14} />} />
                        </div>

                        {/* Visualización de Progreso (Meta Mensual) */}
                        <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Meta Mensual</span>
                                    <p className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
                                        {formatCurrency(summary.monthlyTotal)}
                                        <span className="text-slate-300 text-lg font-medium">/ {formatCurrency(MONTHLY_GOAL)}</span>
                                    </p>
                                </div>
                                <span className="text-xl font-black text-orange-600">{Math.round(monthlyProgress)}%</span>
                            </div>
                            <div className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner p-1">
                                {/* Barra de progreso */}
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-full shadow-lg shadow-orange-500/20 transition-all duration-1000 ease-out"
                                    style={{ width: `${monthlyProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Movements -> Usando MovementsList adaptado o incrustado */}
                <div className="glass-card flex flex-col border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg tracking-tight">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Receipt size={20} className="text-orange-600" />
                            </div>
                            Últimos Movimientos
                        </h3>
                    </div>
                    <div className="p-0 flex-1 overflow-auto max-h-[500px]">
                        <MovementsList incomes={movements.incomes} expenses={movements.expenses} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FinanceStat({ label, value, trend, positive, negative, primary, border }: any) {
    return (
        <div className={cn(
            "glass-card p-8 bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all hover:scale-[1.02] group",
            primary && "border-orange-100"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-4 rounded-2xl transition-colors",
                    primary ? "bg-orange-50 text-orange-600" :
                        positive ? "bg-emerald-50 text-emerald-600" :
                            negative ? "bg-rose-50 text-rose-600" :
                                "bg-slate-50 text-slate-600"
                )}>
                    {primary ? <Wallet size={24} /> :
                        positive ? <TrendingUp size={24} /> :
                            negative ? <TrendingDown size={24} /> :
                                <Activity size={24} />
                    }
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    positive && "text-emerald-600 bg-emerald-50",
                    negative && "text-rose-600 bg-rose-50",
                    primary && "text-orange-600 bg-orange-50"
                )}>
                    {trend}
                </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
    );
}

function MiniStat({ label, value, icon, subtle }: any) {
    return (
        <div className={cn(
            "bg-white border-2 border-slate-50 p-6 rounded-3xl hover:border-orange-100 transition-all group shadow-sm hover:shadow-md",
            subtle && "bg-slate-50/50 border-transparent shadow-none"
        )}>
            <div className="flex items-center gap-3 mb-2">
                <div className={cn("text-slate-300 group-hover:text-orange-500 transition-colors", subtle && "text-slate-400")}>
                    {icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
            </div>
            <p className={cn("text-xl font-black text-slate-800 tracking-tight", subtle && "text-slate-600")}>{value}</p>
        </div>
    );
}


