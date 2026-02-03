import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'superadmin' | 'owner' | 'manager';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
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
