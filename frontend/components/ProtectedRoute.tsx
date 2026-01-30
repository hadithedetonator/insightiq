"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

/**
 * ProtectedRoute component that enforces authentication and role-based access control.
 * Platform Admins are globally allowed to pass through any protected route.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (allowedRoles) {
                // Admins bypass role checks globally
                if (user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
                    router.push("/dashboard");
                }
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Server-side check parity for flickering
    if (allowedRoles && user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
        return null; // Side effect above will redirect
    }

    return <>{children}</>;
}
