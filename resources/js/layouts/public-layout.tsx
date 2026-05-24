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
    }, []);

    return (
        <div className="bka-page flex min-h-screen flex-col">
            <PublicNavbar />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
