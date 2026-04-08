import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

interface AuthContextType {
    user: any; // User profile from backend + firebase uid
    firebaseUser: User | null;
    loading: boolean;
    login: (uid: string, profile: any) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            setFirebaseUser(fUser);
            if (fUser) {
                try {
                    // Try to load cached user from localStorage
                    const cached = localStorage.getItem('user');
                    if (cached) {
                        setUser(JSON.parse(cached));
                    }

                    // Always fetch fresh profile
                    const profile = await api.getUserProfile(fUser.uid);
                    const userData = { uid: fUser.uid, email: fUser.email, ...profile };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    // If profile fetch fails, we might still have the firebase user
                    // but we can't do much without the role.
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (uid: string, profile: any) => {
        const userData = { uid, ...profile };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
