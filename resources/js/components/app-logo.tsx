import { useSidebar } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { state } = useSidebar();
    const { pengaturan } = usePage().props as any;
    const logoUrl = pengaturan?.logo_base64 || '/assets/logo-bka.png';

    if (state === 'collapsed') {
        return (
            <div className="flex size-8 items-center justify-center transition-all duration-300">
                <img
                    src={logoUrl}
                    alt="BKA Logo"
                    className="size-6 object-contain transition-transform duration-200 hover:scale-110"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 py-1 pl-1 transition-all duration-300">
            <img
                src={logoUrl}
                alt="Logo BKA UMRI"
                className="h-9 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
            />
        </div>
    );
}
