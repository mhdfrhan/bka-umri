import { Link } from '@inertiajs/react';

const tabs = [
    { label: 'Tentang Kami', href: '/profil/tentang-kami' },
    { label: 'Visi & Misi', href: '/profil/visi-misi' },
    { label: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
];

export default function ProfilTabs() {
    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="sticky top-[68px] z-30 w-full border-b border-[#DDE5DD] bg-white shadow-xs">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex justify-center sm:justify-start">
                    <div className="inline-flex max-w-full scrollbar-none gap-1 overflow-x-auto rounded-2xl border border-[#E4EAE4] bg-[#F4F6F4] p-1">
                        {tabs.map((tab) => {
                            const isActive = currentPath === tab.href;

                            return (
                                <Link
                                    key={tab.label}
                                    href={tab.href}
                                    className={`relative rounded-xl px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-300 sm:text-sm ${
                                        isActive
                                            ? 'bg-[#0a6c32] text-white shadow-sm shadow-[#0a6c32]/20'
                                            : 'text-gray-600 hover:bg-[#e6f4ea]/50 hover:text-[#0a6c32]'
                                    }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                                        {tab.label}
                                        {isActive && (
                                            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#C8A000]" />
                                        )}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
