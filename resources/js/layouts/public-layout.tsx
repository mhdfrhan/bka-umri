import { useEffect } from 'react';
import PublicFooter from '@/components/layout/public-footer';
import PublicNavbar from '@/components/layout/public-navbar';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    useEffect(() => {
        // Force light mode on all public facing pages
        const html = document.documentElement;

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            html.style.colorScheme = 'light';
        }

        // System Maintenance Mode Interceptor
        if (typeof window !== 'undefined') {
            const isMaintenance = localStorage.getItem('bka_maintenance_mode') === 'true';
            const bypassToken = localStorage.getItem('bka_maintenance_bypass') || 'BKA-SECRET-2026';
            
            const isMaintenancePath = window.location.pathname === '/maintenance' || window.location.pathname.startsWith('/error');
            const isAdminPath = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/login');

            if (isMaintenance && !isMaintenancePath && !isAdminPath) {
                // Check for URL query bypass param: ?bypass=TOKEN
                const params = new URLSearchParams(window.location.search);
                const queryBypass = params.get('bypass');

                if (queryBypass === bypassToken) {
                    sessionStorage.setItem('bka_maintenance_bypass_active', 'true');
                }

                const isBypassActive = sessionStorage.getItem('bka_maintenance_bypass_active') === 'true';

                if (!isBypassActive) {
                    // Redirect to the public maintenance view
                    window.location.href = '/maintenance';
                }
            }
        }
    }, []);

    return (
        <div className="bka-page flex min-h-screen flex-col">
            <PublicNavbar />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
