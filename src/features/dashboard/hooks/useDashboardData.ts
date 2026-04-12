"use client";

import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { adminAuthClient } from '@/lib/supabase/admin-client';



export function useDashboardStats(branchId?: string, filters?: { startDate?: string, endDate?: string }) {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getStats(branchId, filters, user?.organization_id);
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
        if (user !== undefined) fetchStats();
    }, [branchId, JSON.stringify(filters), user?.organization_id]);

    return { stats, loading, error, refetch: fetchStats };
}

export function useNotas(search?: string, filters?: { garment?: string, seamstress_id?: string, status?: string, startDate?: string, endDate?: string }, branchId?: string) {
    const { user } = useAuthStore();
    const [notas, setNotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchNotas = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getNotas(search, filters, branchId, user?.organization_id);
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
        if (user !== undefined) fetchNotas();
    }, [search, JSON.stringify(filters), branchId, user?.organization_id]);

    return { notas, loading, error, refetch: fetchNotas };
}

export function useClients(search?: string, branchId?: string) {
    const { user } = useAuthStore();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getClients(search, branchId, user?.organization_id);
            setClients(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== undefined) fetchClients();
    }, [search, branchId, user?.organization_id]);

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
    const { user } = useAuthStore();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            // Fetch only branches for the user's organization
            const orgId = user?.organization_id;
            const data = await dashboardService.getBranches(orgId);
            setBranches(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBranches();
        }
    }, [user]);

    const createBranch = async (data: any) => {
        if (!user?.organization_id) throw new Error("No organization ID found");
        const branchData = { ...data, organization_id: user.organization_id };
        const result = await dashboardService.createBranch(branchData);
        await fetchBranches();
        return result;
    };

    const updateBranch = async (id: string, data: any) => {
        const result = await dashboardService.updateBranch(id, data);
        await fetchBranches();
        return result;
    };

    const deleteBranch = async (id: string) => {
        await dashboardService.deleteBranch(id);
        await fetchBranches();
    };

    return { branches, loading, error, createBranch, updateBranch, deleteBranch, refetch: fetchBranches };
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

    const updateStatus = async (itemId: string, status: string, seamstressId?: string) => {
        setLoading(true);
        try {
            return await dashboardService.updateItemStatus(itemId, status, seamstressId);
        } finally {
            setLoading(false);
        }
    };

    const collectPayment = async (notaId: string, amount: number, method: string, type: 'parcial' | 'liquidacion', branchId: string) => {
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

    const checkNotaExists = async (notaNumber: string, branchId?: string) => {
        return await dashboardService.checkNotaExists(notaNumber, branchId);
    };

    return { createNota, updateStatus, collectPayment, deliver, checkNotaExists, loading };
}

export function useDailyReport(branchId?: string) {
    const { user } = useAuthStore();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user !== undefined) {
            dashboardService.getDailyReport(branchId, user?.organization_id).then(setReport).finally(() => setLoading(false));
        }
    }, [branchId, user?.organization_id]);

    return { report, loading };
}

export function useFinanceStats(filters?: { startDate?: string, endDate?: string }) {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getFinanceStats(user?.organization_id, filters);
            setStats(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== undefined) fetchStats();
    }, [user?.organization_id, JSON.stringify(filters)]);

    return { stats, loading, refetch: fetchStats };
}

export function useDailyFinancials(branchId?: string) {
    const { user } = useAuthStore();
    const [financials, setFinancials] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getDailyFinancials(branchId, user?.organization_id);
            setFinancials(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== undefined) fetchFinancials();
    }, [branchId, user?.organization_id]);

    return { financials, loading, refetch: fetchFinancials };
}

export function useActiveWorkQueue(branchId?: string) {
    const { user } = useAuthStore();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getActiveWorkQueue(branchId, user?.organization_id);
            setQueue(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== undefined) fetchQueue();
    }, [branchId, user?.organization_id]);

    return { queue, loading, refetch: fetchQueue };
}



export function useStaffProfiles(organizationId?: string, branchId?: string) {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getProfiles(organizationId, branchId);
            setProfiles(data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [organizationId, branchId]);

    const updateProfile = async (userId: string, data: any) => {
        const response = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, ...data })
        });
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        
        await fetchProfiles();
        return result;
    };

    const createManager = async (managerData: any) => {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...managerData, organization_id: organizationId })
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error);
        }

        await fetchProfiles();
        return result.user;
    };

    return { profiles, loading, updateProfile, createManager, refetch: fetchProfiles };
}
