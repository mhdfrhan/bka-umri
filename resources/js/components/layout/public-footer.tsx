import { Link } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Youtube,
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

    return (
        <footer
            id="public-footer"
            style={{
                backgroundColor: '#1B5E20',
                color: '#ffffff',
            }}
        >
            <div
                style={{
                    height: '4px',
                    background:
                        'linear-gradient(90deg, #C8A000 0%, #E8C840 50%, #C8A000 100%)',
                }}
            />

            <div
                className="bka-container"
                style={{ paddingTop: '56px', paddingBottom: '40px' }}
            >
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div style={{ gridColumn: 'span 1' }}>
                        <Link href="/" aria-label="BKA UMRI">
                            <img
                                src="/assets/logo-bka.png"
                                alt="Logo BKA UMRI"
                                style={{
                                    height: '48px',
                                    width: 'auto',
                                    marginBottom: '16px',
                                    filter: 'brightness(0) invert(1)',
                                    opacity: 0.9,
                                }}
                            />
                        </Link>
                        <p
                            style={{
                                fontSize: '14px',
                                lineHeight: '1.7',
                                color: 'rgba(255,255,255,0.75)',
                                marginBottom: '20px',
                            }}
                        >
                            Biro Keuangan & Aset Universitas Muhammadiyah Riau.
                            Melayani pengelolaan keuangan dan aset dengan
                            profesional, transparan, dan akuntabel.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {socialLinks.map(({ icon: Icon, href, label }) => (
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
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor:
                                            'rgba(255,255,255,0.12)',
                                        color: '#ffffff',
                                        transition:
                                            'background-color 150ms ease-out, transform 150ms ease-out',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        (
                                            e.currentTarget as HTMLElement
                                        ).style.backgroundColor = '#C8A000';
                                        (
                                            e.currentTarget as HTMLElement
                                        ).style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (
                                            e.currentTarget as HTMLElement
                                        ).style.backgroundColor =
                                            'rgba(255,255,255,0.12)';
                                        (
                                            e.currentTarget as HTMLElement
                                        ).style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
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
                            {contactInfo.map(({ icon: Icon, text }) => (
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
                            {[
                                {
                                    day: 'Senin – Kamis',
                                    time: '08:00 – 16:00 WIB',
                                },
                                { day: 'Jumat', time: '08:00 – 11:30 WIB' },
                                { day: 'Sabtu – Minggu', time: 'Tutup' },
                            ].map(({ day, time }) => (
                                <div
                                    key={day}
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
                                        {day}
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
                            ))}
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
