import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'super_admin' | 'owner' | 'manager';

interface User {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    organization_id?: string;
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
