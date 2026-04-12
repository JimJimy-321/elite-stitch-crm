import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'super_admin' | 'owner' | 'manager';

interface User {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    organization_id?: string;
    assigned_branch_id?: string;
}

interface AuthState {
    user: User | null;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setInitialized: (initialized: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isInitialized: false,
            setUser: (user) => set({ user }),
            setInitialized: (isInitialized) => set({ isInitialized }),
            logout: () => set({ user: null, isInitialized: true }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
