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
