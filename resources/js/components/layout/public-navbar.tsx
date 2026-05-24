import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Menu,
    X,
    ArrowRight,
    Info,
    Target,
    Users,
    LogIn,
    LayoutDashboard,
    Mail,
    Phone,
    MapPin,
    Clock,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const navItems = [
    { label: 'Beranda', href: '/' },
    {
        label: 'Profil',
        href: '#',
        dropdown: [
            {
                label: 'Tentang Kami',
                href: '/profil/tentang-kami',
                desc: 'Mengenal sejarah, fungsi, dan tugas pokok BKA UMRI.',
                icon: Info,
            },
            {
                label: 'Visi & Misi',
                href: '/profil/visi-misi',
                desc: 'Arah perjuangan, komitmen pelayanan, dan target kami.',
                icon: Target,
            },
            {
                label: 'Struktur Organisasi',
                href: '/profil/struktur-organisasi',
                desc: 'Susunan manajemen, pembagian bidang, dan personil.',
                icon: Users,
            },
        ],
    },
    { label: 'Berita', href: '/berita' },
    { label: 'Pengumuman', href: '/pengumuman' },
    { label: 'Dokumentasi', href: '/dokumentasi' },
    { label: 'Lampiran', href: '/lampiran' },
    { label: 'Kontak', href: '/kontak' },
];

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 15);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);

        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const { url, props } = usePage();
    const currentPath = url.split('?')[0];

    const { auth } = props as unknown as { auth: { user: any } };
    const user = auth?.user;

    const isActive = (href: string) => {
        if (href === '/') {
            return currentPath === '/';
        }

        return currentPath.startsWith(href);
    };

    return (
        <>
            <div className="hidden md:block bg-[#1B5E20] text-white/90 py-2 border-b border-emerald-800/20 text-[11.5px] font-sans">
                <div className="bka-container flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#C8A000]" />
                        <span>Lt.1 Gedung Rektorat, Jl. T. Tambusai, Pekanbaru</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#C8A000]" />
                        <span>Senin - Jum'at : 08:00 - 16:00 | Sabtu : 08.00 - 13.00</span>
                    </div>
                </div>
            </div>

            <header
                id="public-navbar"
                className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
                    scrolled
                        ? 'bg-white/85 backdrop-blur-lg border-b border-[#1B5E20]/8 shadow-[0_10px_30px_-10px_rgba(10,40,14,0.05)]'
                        : 'bg-white border-b border-[#E8F5E9] shadow-none'
                }`}
            >
                <div className="bka-container">
                    <nav className="flex items-center justify-between h-[74px]">
                        <Link
                            href="/"
                            aria-label="BKA UMRI — Beranda"
                            className="flex items-center shrink-0 transition-transform duration-200 hover:scale-101"
                        >
                            <img
                                src="/assets/logo-bka.png"
                                alt="Logo BKA UMRI"
                                className="h-11 w-auto object-contain"
                            />
                        </Link>

                        <div className="hidden lg:flex items-center gap-2">
                            <ul className="flex items-center gap-1 list-none m-0 p-0">
                                {navItems.map((item) => (
                                    <li
                                        key={item.label}
                                        className="relative"
                                        ref={item.dropdown ? dropdownRef : undefined}
                                        onMouseEnter={item.dropdown ? () => setProfileOpen(true) : undefined}
                                        onMouseLeave={item.dropdown ? () => setProfileOpen(false) : undefined}
                                    >
                                        {item.dropdown ? (
                                            <>
                                                <button
                                                    id="nav-profil-btn"
                                                    aria-haspopup="true"
                                                    aria-expanded={profileOpen}
                                                    onClick={() => setProfileOpen(!profileOpen)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-medium tracking-wide relative transition-all duration-300 ease-out hover:bg-[#E8F5E9]/50 hover:text-[#1B5E20] ${
                                                        isActive('/profil')
                                                            ? 'text-[#1B5E20] font-semibold bg-[#E8F5E9]/30'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    <ChevronDown
                                                        size={14}
                                                        className="transition-transform duration-300 ease-out"
                                                        style={{
                                                            transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            color: isActive('/profil') ? '#1B5E20' : '#64748B',
                                                        }}
                                                    />
                                                    {isActive('/profil') && (
                                                        <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-[#1B5E20] shadow-[0_1px_4px_rgba(27,94,32,0.15)]" />
                                                    )}
                                                </button>

                                                <div
                                                    role="menu"
                                                    className="absolute top-full left-0 pt-2.5 min-w-[285px] transition-all duration-300 ease-out"
                                                    style={{
                                                        opacity: profileOpen ? 1 : 0,
                                                        transform: profileOpen
                                                            ? 'translateY(0) scale(1)'
                                                            : 'translateY(6px) scale(0.97)',
                                                        pointerEvents: profileOpen ? 'auto' : 'none',
                                                        zIndex: 60,
                                                    }}
                                                >
                                                    <div className="bg-white/95 border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(10,40,14,0.08)] p-2.5 backdrop-blur-md">
                                                        {item.dropdown.map((sub) => {
                                                            const SubIcon = sub.icon;

                                                            return (
                                                                <Link
                                                                    key={sub.label}
                                                                    href={sub.href}
                                                                    role="menuitem"
                                                                    onClick={() => setProfileOpen(false)}
                                                                    className={`flex gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 ease-out hover:bg-[#E8F5E9]/50 group ${
                                                                        isActive(sub.href)
                                                                            ? 'text-[#1B5E20] bg-[#E8F5E9]/30 font-semibold'
                                                                            : 'text-[#475569]'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-all duration-205 group-hover:scale-103 ${
                                                                            isActive(sub.href)
                                                                                ? 'bg-[#1B5E20] text-white shadow-sm'
                                                                                : 'bg-[#E8F5E9]/60 text-[#1B5E20]'
                                                                        }`}
                                                                    >
                                                                        <SubIcon size={16} />
                                                                    </div>
                                                                    <div className="flex flex-col text-left">
                                                                        <span
                                                                            className={`text-[13.5px] font-semibold leading-tight ${
                                                                                isActive(sub.href)
                                                                                    ? 'text-[#1B5E20]'
                                                                                    : 'text-slate-800 group-hover:text-[#1B5E20]'
                                                                            }`}
                                                                        >
                                                                            {sub.label}
                                                                        </span>
                                                                        <span className="text-[11px] text-slate-400 font-normal mt-0.5 leading-normal">
                                                                            {sub.desc}
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`flex items-center px-4 py-2 rounded-full text-[14px] font-medium tracking-wide relative transition-all duration-300 ease-out hover:bg-[#E8F5E9]/50 hover:text-[#1B5E20] ${
                                                    isActive(item.href)
                                                        ? 'text-[#1B5E20] font-semibold bg-[#E8F5E9]/30'
                                                        : 'text-slate-600'
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                {isActive(item.href) && (
                                                    <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-[#1B5E20] shadow-[0_1px_4px_rgba(27,94,32,0.15)]" />
                                                )}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center pl-4 border-l border-slate-200/60 ml-2">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[13.5px] font-semibold text-white bg-gradient-to-r from-[#1B5E20] to-[#2e7d46] hover:from-[#145218] hover:to-[#226136] shadow-[0_4px_14px_-2px_rgba(27,94,32,0.25)] hover:shadow-[0_6px_20px_rgba(27,94,32,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
                                    >
                                        <LayoutDashboard size={14} />
                                        <span>Dashboard</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[13.5px] font-semibold text-white bg-gradient-to-r from-[#1B5E20] to-[#2e7d46] hover:from-[#145218] hover:to-[#226136] shadow-[0_4px_14px_-2px_rgba(27,94,32,0.25)] hover:shadow-[0_6px_20px_rgba(27,94,32,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 ease-out"
                                    >
                                        <LogIn size={14} />
                                        <span>Portal BKA</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            <button
                id="mobile-menu-toggle"
                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`fixed top-[17px] right-4 z-60 flex lg:hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200/50 bg-white/95 shadow-sm text-slate-800 transition-all duration-300 ease-out hover:bg-[#E8F5E9] hover:text-[#1B5E20] ${
                    mobileOpen ? 'scale-95 shadow-none' : ''
                }`}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 transition-opacity duration-500 ease-in-out"
                style={{
                    backgroundColor: 'rgba(10, 40, 14, 0.25)',
                    opacity: mobileOpen ? 1 : 0,
                    pointerEvents: mobileOpen ? 'auto' : 'none',
                    backdropFilter: mobileOpen ? 'blur(6px)' : 'none',
                    WebkitBackdropFilter: mobileOpen ? 'blur(6px)' : 'none',
                }}
            />

            <nav
                id="mobile-drawer"
                aria-label="Navigasi mobile"
                className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-[300px] border-l border-slate-100 bg-white/95 backdrop-blur-md transition-transform duration-500 ease-out shadow-[-12px_0_40px_rgba(10,40,14,0.08)] p-6 justify-between"
                style={{
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
                }}
            >
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <img
                            src="/assets/logo-bka.png"
                            alt="Logo BKA UMRI"
                            style={{ height: '42px', width: 'auto' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[60vh] pr-1">
                        {navItems.map((item) => (
                            <div key={item.label}>
                                {item.dropdown ? (
                                    <>
                                        <button
                                            onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[14.5px] font-semibold text-left transition-all duration-250 ${
                                                isActive('/profil')
                                                    ? 'bg-[#E8F5E9]/50 text-[#1B5E20]'
                                                    : 'bg-transparent text-slate-800 hover:bg-[#F7F9F7]'
                                            }`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown
                                                size={16}
                                                className="transition-transform duration-300 ease-out"
                                                style={{
                                                    transform: mobileProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    color: isActive('/profil') ? '#1B5E20' : '#64748B',
                                                }}
                                            />
                                        </button>

                                        <div
                                            className="overflow-hidden transition-all duration-300 ease-out pl-3"
                                            style={{
                                                maxHeight: mobileProfileOpen ? '220px' : '0',
                                            }}
                                        >
                                            {item.dropdown.map((sub) => {
                                                const SubIcon = sub.icon;

                                                return (
                                                    <Link
                                                        key={sub.label}
                                                        href={sub.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium mt-1 transition-all duration-200 ${
                                                            isActive(sub.href)
                                                                ? 'text-[#1B5E20] bg-[#E8F5E9]/50 font-semibold'
                                                                : 'text-slate-500 bg-transparent hover:bg-[#F7F9F7]'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex items-center justify-center h-7 w-7 rounded-md shrink-0 ${
                                                                isActive(sub.href)
                                                                    ? 'bg-[#1B5E20] text-white'
                                                                    : 'bg-[#E8F5E9]/50 text-[#1B5E20]'
                                                            }`}
                                                        >
                                                            <SubIcon size={13} />
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <span
                                                                className={`text-[13px] font-semibold ${
                                                                    isActive(sub.href)
                                                                        ? 'text-[#1B5E20]'
                                                                        : 'text-slate-700'
                                                                }`}
                                                            >
                                                                {sub.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 leading-normal">
                                                                {sub.desc}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-[14.5px] font-semibold transition-all duration-200 ${
                                            isActive(item.href)
                                                ? 'bg-[#E8F5E9]/50 text-[#1B5E20] font-bold'
                                                : 'bg-transparent text-slate-800 hover:bg-[#F7F9F7]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {isActive(item.href) && <ArrowRight size={14} className="text-[#1B5E20]" />}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 mt-auto">
                    <div>
                        {user ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-[#1B5E20] to-[#2e7d46] shadow-[0_3px_10px_rgba(27,94,32,0.15)]"
                            >
                                <LayoutDashboard size={15} />
                                <span>Dashboard Admin</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-[#1B5E20] to-[#2e7d46] shadow-[0_3px_10px_rgba(27,94,32,0.15)]"
                            >
                                <LogIn size={15} />
                                <span>Portal BKA</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-col gap-2.5 text-[12px] text-slate-400 px-2 mt-1">
                        <div className="flex items-center gap-2">
                            <Mail size={13} className="text-[#1B5E20]" />
                            <span>bka@umri.ac.id</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#1B5E20]" />
                            <span>(0761) 35008</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-[#1B5E20]" />
                            <span>Pekanbaru, Riau</span>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
