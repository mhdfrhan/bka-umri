import { Link } from '@inertiajs/react';

const tabs = [
    { label: 'Tentang Kami', href: '/profil/tentang-kami' },
    { label: 'Visi & Misi', href: '/profil/visi-misi' },
    { label: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
];

export default function ProfilTabs() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="w-full bg-white border-b border-[#DDE5DD] sticky top-[68px] z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex justify-center sm:justify-start">
                    <div className="inline-flex p-1 bg-[#F4F6F4] rounded-2xl border border-[#E4EAE4] overflow-x-auto scrollbar-none max-w-full gap-1">
                        {tabs.map((tab) => {
                            const isActive = currentPath === tab.href;

                            return (
                                <Link
                                    key={tab.label}
                                    href={tab.href}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative ${
                                        isActive
                                            ? 'bg-[#1B5E20] text-white shadow-sm shadow-[#1B5E20]/20'
                                            : 'text-gray-600 hover:text-[#1B5E20] hover:bg-[#E8F5E9]/50'
                                    }`}
                                >
                                    <span className="relative z-10 flex items-center gap-1.5 justify-center">
                                        {tab.label}
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A000] animate-pulse shrink-0" />
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
