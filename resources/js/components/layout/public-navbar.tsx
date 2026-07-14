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
    const { pengaturan } = usePage().props as any;
    const logoUrl = pengaturan?.logo_base64 || '/assets/logo-bka.png';
    const jamOperasional =
        pengaturan?.jam_operasional ||
        'Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB';

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
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
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
            <div className="hidden border-b border-emerald-800/20 bg-[#0a6c32] py-2 font-sans text-[11.5px] text-white/90 md:block">
                <div className="bka-container flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#C8A000]" />
                        <span>
                            {pengaturan?.alamat
                                ? pengaturan.alamat.split('\n')[0]
                                : 'Lt.1 Gedung Rektorat, Jl. T. Tambusai, Pekanbaru'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#C8A000]" />
                        <span>{jamOperasional.replace(/\n/g, ' | ')}</span>
                    </div>
                </div>
            </div>

            <header
                id="public-navbar"
                className="sticky top-0 z-50 border-b border-[#0a6c32]/10 bg-white/95 shadow-[0_8px_30px_-8px_rgba(10,40,14,0.06)] backdrop-blur-md transition-all duration-300 ease-in-out"
            >
                <div className="bka-container">
                    <nav className="flex h-[80px] items-center justify-between">
                        <Link
                            href="/"
                            aria-label="BKA UMRI — Beranda"
                            className="flex shrink-0 items-center transition-transform duration-200 hover:scale-101"
                        >
                            <img
                                src={logoUrl}
                                alt="Logo BKA UMRI"
                                width="124"
                                height="48"
                                className="h-12 w-auto object-contain"
                            />
                        </Link>

                        <div className="hidden items-center gap-2 lg:flex">
                            <ul className="m-0 flex list-none items-center gap-2 p-0">
                                {navItems.map((item) => (
                                    <li
                                        key={item.label}
                                        className="relative"
                                        ref={
                                            item.dropdown
                                                ? dropdownRef
                                                : undefined
                                        }
                                        onMouseEnter={
                                            item.dropdown
                                                ? () => setProfileOpen(true)
                                                : undefined
                                        }
                                        onMouseLeave={
                                            item.dropdown
                                                ? () => setProfileOpen(false)
                                                : undefined
                                        }
                                    >
                                        {item.dropdown ? (
                                            <>
                                                <button
                                                    id="nav-profil-btn"
                                                    aria-haspopup="true"
                                                    aria-expanded={profileOpen}
                                                    onClick={() =>
                                                        setProfileOpen(
                                                            !profileOpen,
                                                        )
                                                    }
                                                    className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium tracking-wide transition-all duration-200 ease-out ${
                                                        isActive('/profil')
                                                            ? 'bg-[#e6f4ea]/30 font-semibold text-[#0a6c32] hover:bg-[#e6f4ea]/50'
                                                            : 'text-slate-600 hover:bg-[#e6f4ea]/50 hover:text-[#0a6c32]'
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    <ChevronDown
                                                        size={14}
                                                        className="transition-transform duration-300 ease-out"
                                                        style={{
                                                            transform:
                                                                profileOpen
                                                                    ? 'rotate(180deg)'
                                                                    : 'rotate(0deg)',
                                                            color: isActive(
                                                                '/profil',
                                                            )
                                                                ? '#0a6c32'
                                                                : '#64748B',
                                                        }}
                                                    />
                                                    {isActive('/profil') && (
                                                        <span className="absolute bottom-[2px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-[#0a6c32] shadow-[0_1px_4px_rgba(10,108,50,0.15)]" />
                                                    )}
                                                </button>

                                                <div
                                                    role="menu"
                                                    className="absolute top-full left-0 min-w-[285px] pt-2.5 transition-all duration-300 ease-out"
                                                    style={{
                                                        opacity: profileOpen
                                                            ? 1
                                                            : 0,
                                                        transform: profileOpen
                                                            ? 'translateY(0) scale(1)'
                                                            : 'translateY(6px) scale(0.97)',
                                                        pointerEvents:
                                                            profileOpen
                                                                ? 'auto'
                                                                : 'none',
                                                        zIndex: 60,
                                                    }}
                                                >
                                                    <div className="rounded-2xl border border-slate-100 bg-white/95 p-2.5 shadow-[0_20px_50px_rgba(10,40,14,0.08)] backdrop-blur-md">
                                                        {item.dropdown.map(
                                                            (sub) => {
                                                                const SubIcon =
                                                                    sub.icon;

                                                                return (
                                                                    <Link
                                                                        key={
                                                                            sub.label
                                                                        }
                                                                        href={
                                                                            sub.href
                                                                        }
                                                                        role="menuitem"
                                                                        onClick={() =>
                                                                            setProfileOpen(
                                                                                false,
                                                                            )
                                                                        }
                                                                        className={`group flex gap-3 rounded-xl px-3 py-2.5 transition-all duration-250 ease-out hover:bg-[#e6f4ea]/50 ${
                                                                            isActive(
                                                                                sub.href,
                                                                            )
                                                                                ? 'bg-[#e6f4ea]/30 font-semibold text-[#0a6c32]'
                                                                                : 'text-[#475569]'
                                                                        }`}
                                                                    >
                                                                        <div
                                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-205 group-hover:scale-103 ${
                                                                                isActive(
                                                                                    sub.href,
                                                                                )
                                                                                    ? 'bg-[#0a6c32] text-white shadow-sm'
                                                                                    : 'bg-[#e6f4ea]/60 text-[#0a6c32]'
                                                                            }`}
                                                                        >
                                                                            <SubIcon
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col text-left">
                                                                            <span
                                                                                className={`text-[13.5px] leading-tight font-semibold ${
                                                                                    isActive(
                                                                                        sub.href,
                                                                                    )
                                                                                        ? 'text-[#0a6c32]'
                                                                                        : 'text-slate-800 group-hover:text-[#0a6c32]'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    sub.label
                                                                                }
                                                                            </span>
                                                                            <span className="mt-0.5 text-[11px] leading-normal font-normal text-slate-400">
                                                                                {
                                                                                    sub.desc
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`relative flex items-center rounded-full px-4 py-2 text-[14px] font-medium tracking-wide transition-all duration-300 ease-out ${
                                                    isActive(item.href)
                                                        ? 'bg-[#e6f4ea]/30 font-semibold text-[#0a6c32] hover:bg-[#e6f4ea]/50'
                                                        : 'text-slate-600 hover:bg-[#e6f4ea]/50 hover:text-[#0a6c32]'
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                {isActive(item.href) && (
                                                    <span className="absolute bottom-[2px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-[#0a6c32] shadow-[0_1px_4px_rgba(10,108,50,0.15)]" />
                                                )}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="ml-3 flex items-center border-l border-slate-200/60 pl-4">
                                {user && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0a6c32] to-[#048d46] px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_16px_-2px_rgba(10,108,50,0.3)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:from-[#085627] hover:to-[#226136] hover:shadow-[0_8px_24px_rgba(10,108,50,0.4)] active:translate-y-0"
                                    >
                                        <LayoutDashboard size={14} />
                                        <span>Dashboard</span>
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
                className={`fixed top-[17px] right-4 z-60 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/50 bg-white/95 text-slate-800 shadow-sm transition-all duration-300 ease-out hover:bg-[#e6f4ea] hover:text-[#0a6c32] lg:hidden ${
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
                className="fixed top-0 right-0 bottom-0 z-50 flex w-[300px] flex-col justify-between border-l border-slate-100 bg-white/95 p-6 shadow-[-12px_0_40px_rgba(10,40,14,0.08)] backdrop-blur-md transition-transform duration-500 ease-out"
                style={{
                    transform: mobileOpen
                        ? 'translateX(0)'
                        : 'translateX(100%)',
                }}
            >
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <img
                            src={logoUrl}
                            alt="Logo BKA UMRI"
                            width="109"
                            height="42"
                            style={{ height: '42px', width: 'auto' }}
                        />
                    </div>

                    <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto pr-1">
                        {navItems.map((item) => (
                            <div key={item.label}>
                                {item.dropdown ? (
                                    <>
                                        <button
                                            onClick={() =>
                                                setMobileProfileOpen(
                                                    !mobileProfileOpen,
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[14.5px] font-semibold transition-all duration-250 ${
                                                isActive('/profil')
                                                    ? 'bg-[#e6f4ea]/50 text-[#0a6c32]'
                                                    : 'bg-transparent text-slate-800 hover:bg-[#F7F9F7]'
                                            }`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown
                                                size={16}
                                                className="transition-transform duration-300 ease-out"
                                                style={{
                                                    transform: mobileProfileOpen
                                                        ? 'rotate(180deg)'
                                                        : 'rotate(0deg)',
                                                    color: isActive('/profil')
                                                        ? '#0a6c32'
                                                        : '#64748B',
                                                }}
                                            />
                                        </button>

                                        <div
                                            className="overflow-hidden pl-3 transition-all duration-300 ease-out"
                                            style={{
                                                maxHeight: mobileProfileOpen
                                                    ? '220px'
                                                    : '0',
                                            }}
                                        >
                                            {item.dropdown.map((sub) => {
                                                const SubIcon = sub.icon;

                                                return (
                                                    <Link
                                                        key={sub.label}
                                                        href={sub.href}
                                                        onClick={() =>
                                                            setMobileOpen(false)
                                                        }
                                                        className={`mt-1 flex items-start gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                                                            isActive(sub.href)
                                                                ? 'bg-[#e6f4ea]/50 font-semibold text-[#0a6c32]'
                                                                : 'bg-transparent text-slate-500 hover:bg-[#F7F9F7]'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                                                isActive(
                                                                    sub.href,
                                                                )
                                                                    ? 'bg-[#0a6c32] text-white'
                                                                    : 'bg-[#e6f4ea]/50 text-[#0a6c32]'
                                                            }`}
                                                        >
                                                            <SubIcon
                                                                size={13}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <span
                                                                className={`text-[13px] font-semibold ${
                                                                    isActive(
                                                                        sub.href,
                                                                    )
                                                                        ? 'text-[#0a6c32]'
                                                                        : 'text-slate-700'
                                                                }`}
                                                            >
                                                                {sub.label}
                                                            </span>
                                                            <span className="mt-0.5 text-[10px] leading-normal font-normal text-slate-400">
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
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-[14.5px] font-semibold transition-all duration-200 ${
                                            isActive(item.href)
                                                ? 'bg-[#e6f4ea]/50 font-bold text-[#0a6c32]'
                                                : 'bg-transparent text-slate-800 hover:bg-[#F7F9F7]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {isActive(item.href) && (
                                            <ArrowRight
                                                size={14}
                                                className="text-[#0a6c32]"
                                            />
                                        )}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4">
                    <div>
                        {user && (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileOpen(false)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a6c32] to-[#048d46] px-4 py-3 text-[14px] font-bold text-white shadow-[0_3px_10px_rgba(10,108,50,0.15)]"
                            >
                                <LayoutDashboard size={15} />
                                <span>Dashboard Admin</span>
                            </Link>
                        )}
                    </div>

                    <div className="mt-1 flex flex-col gap-2.5 px-2 text-[12px] text-slate-400">
                        <div className="flex items-center gap-2">
                            <Mail size={13} className="text-[#0a6c32]" />
                            <span>bka@umri.ac.id</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#0a6c32]" />
                            <span>(0761) 35008</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-[#0a6c32]" />
                            <span>Pekanbaru, Riau</span>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
