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

export function useTickets() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchTickets() {
            try {
                const data = await dashboardService.getTickets();
                setTickets(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, []);

    return { tickets, loading, error };
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
