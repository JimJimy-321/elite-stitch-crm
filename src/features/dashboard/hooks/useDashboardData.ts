import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export function useDashboardStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await dashboardService.getStats();
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

export function useTickets(search?: string) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getTickets(search);
            setTickets(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [search]);

    return { tickets, loading, error, refetch: fetchTickets };
}

export function useClients() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchClients() {
            try {
                const data = await dashboardService.getClients();
                setClients(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchClients();
    }, []);

    return { clients, loading, error };
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

export function useAdvancedTickets() {
    const [loading, setLoading] = useState(false);

    const createTicket = async (ticketData: any, items: any[], payment: any) => {
        setLoading(true);
        try {
            return await dashboardService.createAdvancedTicket(ticketData, items, payment);
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

    const collectPayment = async (ticketId: string, amount: number, method: string, type: 'abono' | 'liquidacion', branchId: string) => {
        setLoading(true);
        try {
            return await dashboardService.addPayment(ticketId, { amount, method, type, branch_id: branchId });
        } finally {
            setLoading(false);
        }
    };

    const deliver = async (ticketId: string) => {
        setLoading(true);
        try {
            return await dashboardService.deliverTicket(ticketId);
        } finally {
            setLoading(false);
        }
    };

    return { createTicket, updateStatus, collectPayment, deliver, loading };
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
