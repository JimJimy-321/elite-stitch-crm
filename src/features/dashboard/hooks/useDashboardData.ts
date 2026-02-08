"use client";

import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuthStore } from '@/features/auth/store/authStore'; // Ensure this is available if needed, but the hooks here are generic enough


export function useDashboardStats(branchId?: string) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getStats();
            setStats(data);
            return data;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refetch: fetchStats };
}

export function useNotas(search?: string) {
    const [notas, setNotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchNotas = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getNotas(search);
            setNotas(data);
            return data;
        } catch (err) {
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotas();
    }, [search]);

    return { notas, loading, error, refetch: fetchNotas };
}

export function useClients(search?: string) {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getClients(search);
            setClients(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [search]);

    const createClient = async (data: any) => {
        const result = await dashboardService.createClient(data);
        await fetchClients();
        return result;
    };

    const updateClient = async (id: string, data: any) => {
        const result = await dashboardService.updateClient(id, data);
        await fetchClients();
        return result;
    };

    const deleteClient = async (id: string) => {
        await dashboardService.deleteClient(id);
        await fetchClients();
    };

    return { clients, loading, error, createClient, updateClient, deleteClient, refetch: fetchClients };
}

export function useBranches() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchBranches() {
            try {
                const data = await dashboardService.getBranches();
                setBranches(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchBranches();
    }, []);

    return { branches, loading, error };
}

export function useOwners() {
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getOwners();
            setOwners(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const createOwner = async (data: any) => {
        const result = await dashboardService.createOwner(data);
        await fetchOwners();
        return result;
    };

    return { owners, loading, error, createOwner, refetch: fetchOwners };
}

export function useAdminStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await dashboardService.getAdminStats();
                setStats(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return { stats, loading, error };
}

export function useGlobalConfig(key: string) {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getGlobalConfig(key);
            setConfig(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [key]);

    const updateConfig = async (value: any) => {
        const result = await dashboardService.updateGlobalConfig(key, value);
        await fetchConfig();
        return result;
    };

    return { config, loading, error, updateConfig, refetch: fetchConfig };
}
export function useGarments() {
    const [garments, setGarments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getGarments().then(setGarments).finally(() => setLoading(false));
    }, []);

    return { garments, loading };
}

export function useServices() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getServices().then(setServices).finally(() => setLoading(false));
    }, []);

    return { services, loading };
}

export function useAdvancedNotas() {
    const [loading, setLoading] = useState(false);

    const createNota = async (notaData: any, items: any[], payment: any) => {
        setLoading(true);
        try {
            return await dashboardService.createAdvancedNota(notaData, items, payment);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (itemId: string, status: string) => {
        setLoading(true);
        try {
            return await dashboardService.updateItemStatus(itemId, status);
        } finally {
            setLoading(false);
        }
    };

    const collectPayment = async (notaId: string, amount: number, method: string, type: 'abono' | 'liquidacion', branchId: string) => {
        setLoading(true);
        try {
            return await dashboardService.addPayment(notaId, { amount, method, type, branch_id: branchId });
        } finally {
            setLoading(false);
        }
    };

    const deliver = async (notaId: string) => {
        setLoading(true);
        try {
            return await dashboardService.deliverNota(notaId);
        } finally {
            setLoading(false);
        }
    };

    const checkNotaExists = async (notaNumber: string) => {
        return await dashboardService.checkNotaExists(notaNumber);
    };

    return { createNota, updateStatus, collectPayment, deliver, checkNotaExists, loading };
}

export function useDailyReport(branchId?: string) {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getDailyReport(branchId).then(setReport).finally(() => setLoading(false));
    }, [branchId]);

    return { report, loading };
}

export function useFinanceStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getFinanceStats().then(setStats).finally(() => setLoading(false));
    }, []);

    return { stats, loading };
}

export function useDailyFinancials(branchId?: string) {
    const [financials, setFinancials] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getDailyFinancials(branchId);
            setFinancials(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, [branchId]);

    return { financials, loading, refetch: fetchFinancials };
}

export function useActiveWorkQueue(branchId?: string) {
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getActiveWorkQueue(branchId);
            setQueue(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, [branchId]);

    return { queue, loading, refetch: fetchQueue };
}
