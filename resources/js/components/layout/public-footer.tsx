import { Link, usePage } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Youtube,
    Twitter,
    ArrowUp,
} from 'lucide-react';

const quickLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang Kami', href: '/profil/tentang-kami' },
    { label: 'Visi & Misi', href: '/profil/visi-misi' },
    { label: 'Berita', href: '/berita' },
    { label: 'Pengumuman', href: '/pengumuman' },
    { label: 'Dokumentasi', href: '/dokumentasi' },
    { label: 'Lampiran', href: '/lampiran' },
    { label: 'Kontak', href: '/kontak' },
];

const contactInfo = [
    { icon: MapPin, text: 'Jl. Tuanku Tambusai No.23, Pekanbaru, Riau 28294' },
    { icon: Phone, text: '(0761) 35008' },
    { icon: Mail, text: 'bka@umri.ac.id' },
];

const socialLinks = [
    {
        icon: Instagram,
        href: 'https://instagram.com/bka_umri',
        label: 'Instagram BKA UMRI',
    },
    {
        icon: Facebook,
        href: 'https://facebook.com/bkaumri',
        label: 'Facebook BKA UMRI',
    },
    {
        icon: Youtube,
        href: 'https://youtube.com/@bkaumri',
        label: 'YouTube BKA UMRI',
    },
];

export default function PublicFooter() {
    const year = new Date().getFullYear();
    const { pengaturan } = usePage().props as any;

    const logoUrl = pengaturan?.logo_base64 || '/assets/logo-bka.png';
    const email = pengaturan?.email || 'bka@umri.ac.id';
    const telepon = pengaturan?.telepon || '(0761) 35008';
    const alamat =
        pengaturan?.alamat ||
        'Jl. Tuanku Tambusai No.23, Pekanbaru, Riau 28294';
    const jamOperasional =
        pengaturan?.jam_operasional ||
        'Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB';

    // Process media sosial
    let parsedSosmed = [
        { platform: 'Facebook', url: 'https://facebook.com/umri.official' },
        { platform: 'Instagram', url: 'https://instagram.com/umri.official' },
        { platform: 'YouTube', url: 'https://youtube.com' },
    ];
    if (pengaturan?.media_sosial) {
        try {
            const decoded = JSON.parse(pengaturan.media_sosial);
            if (Array.isArray(decoded) && decoded.length > 0) {
                parsedSosmed = decoded;
            }
        } catch (e) {
            console.error('Error decoding media_sosial settings', e);
        }
    }

    const socialLinksList = parsedSosmed.map((item) => {
        let iconComponent = Instagram;
        if (item.platform.toLowerCase() === 'facebook') {
            iconComponent = Facebook;
        } else if (item.platform.toLowerCase() === 'youtube') {
            iconComponent = Youtube;
        } else if (
            item.platform.toLowerCase() === 'twitter' ||
            item.platform.toLowerCase() === 'x'
        ) {
            iconComponent = Twitter;
        }
        return {
            icon: iconComponent,
            href: item.url,
            label: `${item.platform} BKA UMRI`,
        };
    });

    const contactInfoList = [
        { icon: MapPin, text: alamat },
        { icon: Phone, text: telepon },
        { icon: Mail, text: email },
    ];

    return (
        <footer
            id="public-footer"
            className="bka-noise-overlay relative"
            style={{
                backgroundColor: '#081D09',
                color: '#ffffff',
            }}
        >
            {/* Top CTA Row */}
            <div className="border-b border-white/10 py-12 relative">
                <div className="bka-container flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div>
                        <h2 className="mb-2 font-sans text-xl font-extrabold tracking-tight text-white uppercase lg:text-2xl">
                            Butuh bantuan administrasi keuangan atau aset?
                        </h2>
                        <p className="max-w-[620px] text-[14.5px] leading-relaxed font-normal text-white/75">
                            Tim staf Biro Keuangan & Aset UMRI siap sedia
                            mempermudah setiap kebutuhan layanan transaksi dan
                            logistik fisik Anda.
                        </p>
                    </div>
                    <a
                        href="/kontak"
                        className="rounded-full bg-[#C8A000] px-8 py-4 text-sm font-bold tracking-wider whitespace-nowrap text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8C840] hover:shadow-[0_8px_30px_rgba(200,160,0,0.35)]"
                    >
                        Hubungi Kami
                    </a>
                </div>

                {/* back to top */}
                <button
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className="group absolute -top-6 right-10 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#C8A000] to-[#E8C840] text-white shadow-lg shadow-amber-950/20 ring-4 ring-[#081D09] transition-all duration-300 hover:-translate-y-1 hover:from-[#E8C840] hover:to-[#FFD850] hover:shadow-xl hover:shadow-amber-500/30 hover:ring-[#C8A000]/30"
                    aria-label="Kembali ke atas"
                >
                    <span className="relative flex h-5 w-5 overflow-hidden flex-col items-center justify-center">
                        <ArrowUp size={18} className="transition-all duration-300 ease-in-out transform group-hover:-translate-y-8" />
                        <ArrowUp size={18} className="absolute transition-all duration-300 ease-in-out transform translate-y-8 group-hover:translate-y-0" />
                    </span>
                </button>
            </div>

            <div
                className="bka-container"
                style={{ paddingTop: '80px', paddingBottom: '60px' }}
            >
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    <div style={{ gridColumn: 'span 1' }}>
                        <Link href="/" aria-label="BKA UMRI">
                            <img
                                src={logoUrl}
                                alt="Logo BKA UMRI"
                                style={{
                                    height: '56px',
                                    width: 'auto',
                                    marginBottom: '20px',
                                    filter:
                                        logoUrl === '/assets/logo-bka.png'
                                            ? 'brightness(0) invert(1)'
                                            : undefined,
                                    opacity: 0.95,
                                }}
                            />
                        </Link>
                        <p
                            style={{
                                fontSize: '14px',
                                lineHeight: '1.75',
                                color: 'rgba(255,255,255,0.75)',
                                marginBottom: '24px',
                            }}
                        >
                            Biro Keuangan & Aset Universitas Muhammadiyah Riau.
                            Melayani pengelolaan keuangan dan aset dengan
                            profesional, transparan, dan akuntabel.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {socialLinksList.map(
                                ({ icon: Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            backgroundColor:
                                                'rgba(255,255,255,0.1)',
                                            color: '#ffffff',
                                            transition:
                                                'background-color 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
                                            textDecoration: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.backgroundColor = '#C8A000';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.transform =
                                                'translateY(-3px)';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.boxShadow =
                                                '0 6px 15px rgba(200,160,0,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.backgroundColor =
                                                'rgba(255,255,255,0.1)';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.transform = 'translateY(0)';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.boxShadow = 'none';
                                        }}
                                    >
                                        <Icon size={18} />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    <div>
                        <h3
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#C8A000',
                                marginBottom: '20px',
                            }}
                        >
                            Tautan Cepat
                        </h3>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                            }}
                        >
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        style={{
                                            fontSize: '14px',
                                            color: 'rgba(255,255,255,0.75)',
                                            textDecoration: 'none',
                                            transition:
                                                'color 150ms ease-out, padding-left 150ms ease-out',
                                            display: 'inline-block',
                                        }}
                                        onMouseEnter={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.color = '#ffffff';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.paddingLeft = '4px';
                                        }}
                                        onMouseLeave={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.color =
                                                'rgba(255,255,255,0.75)';
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.paddingLeft = '0';
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#C8A000',
                                marginBottom: '20px',
                            }}
                        >
                            Hubungi Kami
                        </h3>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {contactInfoList.map(({ icon: Icon, text }) => (
                                <li
                                    key={text}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            backgroundColor:
                                                'rgba(200,160,0,0.2)',
                                            flexShrink: 0,
                                            marginTop: '1px',
                                        }}
                                    >
                                        <Icon
                                            size={15}
                                            style={{ color: '#C8A000' }}
                                        />
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '14px',
                                            color: 'rgba(255,255,255,0.75)',
                                            lineHeight: '1.6',
                                        }}
                                    >
                                        {text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#C8A000',
                                marginBottom: '20px',
                            }}
                        >
                            Jam Operasional
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                            }}
                        >
                            {jamOperasional
                                .split('\n')
                                .map((line: string, idx: number) => {
                                    if (!line.includes(':')) {
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    fontSize: '14px',
                                                    color: 'rgba(255,255,255,0.75)',
                                                }}
                                            >
                                                {line}
                                            </div>
                                        );
                                    }
                                    const indexColon = line.indexOf(':');
                                    const label = line
                                        .slice(0, indexColon)
                                        .trim();
                                    const time = line
                                        .slice(indexColon + 1)
                                        .trim();
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: 'rgba(255,255,255,0.65)',
                                                }}
                                            >
                                                {label}
                                            </span>
                                            <span
                                                style={{
                                                    color: '#ffffff',
                                                    fontWeight: 500,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {time}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>

                        <div
                            style={{
                                marginTop: '28px',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(200,160,0,0.15)',
                                border: '1px solid rgba(200,160,0,0.3)',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#C8A000',
                                    fontWeight: 700,
                                    marginBottom: '4px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Universitas Muhammadiyah Riau
                            </p>
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: 1.5,
                                }}
                            >
                                Terakreditasi{' '}
                                <strong style={{ color: '#C8A000' }}>B</strong>{' '}
                                — BAN-PT
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    padding: '16px 0',
                }}
            >
                <div
                    className="bka-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >
                    <p
                        style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.55)',
                            margin: 0,
                        }}
                    >
                        © {year} Biro Keuangan & Aset UMRI. Semua hak
                        dilindungi.
                    </p>
                    <p
                        style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.4)',
                            margin: 0,
                        }}
                    >
                        Universitas Muhammadiyah Riau
                    </p>
                </div>
            </div>
        </footer>
    );
}
