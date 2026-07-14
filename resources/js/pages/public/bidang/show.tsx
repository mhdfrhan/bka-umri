import { Seo } from '@/components/seo';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Mail,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    useScrollReveal,
    useScrollRevealChildren,
} from '@/hooks/use-scroll-reveal';

interface SocialMedia {
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'whatsapp' | 'email';
    url: string;
}

interface KepalaBagian {
    foto: string;
    nama: string;
    jabatan: string;
    deskripsiTugas?: string;
    socialMedia?: SocialMedia[];
}

interface Anggota {
    foto?: string;
    nama: string;
    jabatan: string;
    socialMedia?: SocialMedia[];
}

interface CtaData {
    heading?: string;
    sub?: string;
    buttonText?: string;
    buttonHref?: string;
}

interface BidangShowProps {
    bidang: {
        nama: string;
        slug: string;
        deskripsiLengkap: string;
        banner?: string;
        kepalaBagian?: KepalaBagian;
        anggota: Anggota[];
        cta?: CtaData;
    };
}

const WhatsAppIcon = ({ size = 24, ...props }: React.ComponentPropsWithoutRef<'svg'> & { size?: number }) => (
    <svg
        className="fill-current"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.875 1.218 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    whatsapp: WhatsAppIcon,
    email: Mail,
};

// ─── Dummy data ───
const dummyKeuangan: BidangShowProps['bidang'] = {
    nama: 'Bagian Administrasi Keuangan dan Profit',
    slug: 'administrasi-keuangan-dan-profit',
    deskripsiLengkap:
        'Tugas pokok Bagian Administrasi Keuangan dan Profit Universitas Muhammadiyah Riau meliputi pengelolaan aktivitas akuntansi dan penyusunan laporan keuangan di universitas, serta kegiatan yang terkait dengan penerimaan pendapatan universitas dan analisis profitabilitas.',
    banner: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=85',
    kepalaBagian: {
        foto: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
        nama: 'Mailukni, SE',
        jabatan: 'Kepala Bagian Keuangan',
        deskripsiTugas:
            'Kepala Bagian Keuangan memiliki tugas untuk mengelola dan mengawasi seluruh aktivitas keuangan universitas, termasuk perencanaan, penganggaran, pelaporan, dan pemantauan transaksi keuangan. Kepala Bagian bertanggungjawab memastikan bahwa semua kegiatan keuangan dilakukan secara akurat dan sesuai dengan kebijakan serta peraturan yang berlaku.',
        socialMedia: [
            { platform: 'facebook', url: '#' },
            { platform: 'twitter', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' },
        ],
    },
    anggota: [],
    cta: {
        heading: 'Penyempurnaan pengelolaan keuangan adalah tujuan kami',
        sub: 'Ajukan Kerjasama Bidang Keuangan',
        buttonText: 'Ajukan',
        buttonHref: '/kontak',
    },
};

const dummyAset: BidangShowProps['bidang'] = {
    nama: 'Bagian Administrasi dan Pengadaan Aset',
    slug: 'administrasi-dan-pengadaan-aset',
    deskripsiLengkap:
        'Tugas pokok Bagian Administrasi dan Pengadaan Aset Universitas Muhammadiyah Riau meliputi proses pengadaan dan penerimaan aset universitas, dan administrasi terkait pengelolaan aset universitas, termasuk pencatatan, pengelolaan data aset, serta penyusunan laporan.',
    banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85',
    kepalaBagian: {
        foto: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
        nama: 'Delvien Oktalisa, A.Md',
        jabatan: 'Plt. Kepala Bagian Administrasi Aset',
        deskripsiTugas:
            'Kepala Bagian Administrasi dan Pengadaan Aset bertugas dalam kegiatan administrasi terkait pengelolaan aset universitas, termasuk pencatatan, pengelolaan data aset, dan penyusunan laporan. Kepala Bidang bertanggungjawab mendukung Kepala Bagian Aset dalam memastikan semua aset tercatat dengan akurat dan dikelola sesuai kebijakan yang berlaku.',
        socialMedia: [
            { platform: 'facebook', url: '#' },
            { platform: 'twitter', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' },
        ],
    },
    anggota: [],
    cta: undefined,
};

// Temporary: resolve dummy data from slug
function getDummyBidang(slug: string): BidangShowProps['bidang'] {
    if (slug === 'administrasi-dan-pengadaan-aset') {
        return dummyAset;
    }

    return dummyKeuangan;
}

export default function BidangShow({ bidang: bidangProp }: BidangShowProps) {
    // Use prop data if available, else fallback to dummy
    const bidang =
        bidangProp ?? getDummyBidang('administrasi-keuangan-dan-profit');

    const heroRef = useScrollReveal<HTMLDivElement>();
    const descRef = useScrollReveal<HTMLDivElement>();
    const strukturRef = useScrollReveal<HTMLDivElement>();
    const anggotaRef =
        useScrollRevealChildren<HTMLDivElement>('.bka-reveal-scale');
    const ctaRef = useScrollReveal<HTMLDivElement>();

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: bidang.nama, href: `/bidang/${bidang.slug}` },
    ];

    return (
        <>
            <Head title={`${bidang.nama} — BKA UMRI`}>
                {bidang.deskripsiLengkap && (
                    <meta
                        name="description"
                        content={bidang.deskripsiLengkap.slice(0, 160)}
                    />
                )}
            </Head>

            {/* Banner Hero */}
            <section className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#0D3B11] md:min-h-[340px]">
                {bidang.banner && (
                    <img
                        src={bidang.banner}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(10,40,14,0.92) 0%, rgba(10,40,14,0.7) 50%, rgba(10,40,14,0.85) 100%)',
                    }}
                />

                <div
                    ref={heroRef}
                    className="bka-reveal bka-container relative z-[2] py-16 text-center"
                >
                    {/* Breadcrumb */}
                    <div className="mb-6 flex justify-center">
                        <Breadcrumbs
                            breadcrumbs={breadcrumbItems}
                            variant="public"
                        />
                    </div>

                    <h1
                        className="mx-auto max-w-[720px] leading-[1.2] font-bold text-white"
                        style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}
                    >
                        {bidang.nama}
                    </h1>
                    <span className="bka-gold-line bka-gold-line-center mt-5" />
                </div>
            </section>

            {/* Deskripsi */}
            <section className="bka-section bg-white">
                <div className="bka-container">
                    <div
                        ref={descRef}
                        className="bka-reveal mx-auto max-w-[780px]"
                    >
                        <div
                            className="text-center text-[17px] leading-[1.9] text-[#5C6B73] whitespace-pre-line font-light"
                            dangerouslySetInnerHTML={{ __html: bidang.deskripsiLengkap }}
                        />
                    </div>
                </div>
            </section>

            {/* Struktur — Kepala Bagian */}
            {bidang.kepalaBagian && (
                <section className="bka-section bg-[#F7F9F7]">
                    <div className="bka-container">
                        <div ref={strukturRef} className="bka-reveal">
                            <div className="mb-10 text-center">
                                <span className="mb-3 inline-block rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-[#0a6c32] uppercase">
                                    Struktur
                                </span>
                                <h2
                                    className="leading-[1.2] font-bold text-[#1A1A1A]"
                                    style={{
                                        fontSize: 'clamp(22px, 3.5vw, 28px)',
                                    }}
                                >
                                    Kepala Bagian
                                </h2>
                                <span className="bka-gold-line bka-gold-line-center mt-4" />
                            </div>

                            <div className="mx-auto max-w-[800px]">
                                <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[240px_1fr]">
                                    {/* Photo */}
                                    <div className="relative mx-auto w-full max-w-[240px]">
                                        <div
                                            aria-hidden="true"
                                            className="absolute -top-3 right-3 bottom-3 -left-3 z-0 rounded-2xl"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, #0a6c32, #048d46)',
                                            }}
                                        />
                                        <div className="relative z-[1] aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
                                            <img
                                                src={bidang.kepalaBagian.foto}
                                                alt={`Foto ${bidang.kepalaBagian.nama}`}
                                                className="h-full w-full object-cover object-[center_top]"
                                                onError={(e) => {
                                                    (
                                                        e.currentTarget as HTMLImageElement
                                                    ).src =
                                                        'https://placehold.co/240x320/E8F5E9/1B5E20?text=Foto';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-[#1A1A1A]">
                                            {bidang.kepalaBagian.nama}
                                        </h3>
                                        <p className="mb-4 text-sm font-semibold text-[#0a6c32]">
                                            {bidang.kepalaBagian.jabatan}
                                        </p>

                                        {bidang.kepalaBagian.deskripsiTugas && (
                                            <p className="mb-5 text-[15px] leading-[1.8] text-[#5C6B73]">
                                                {
                                                    bidang.kepalaBagian
                                                        .deskripsiTugas
                                                }
                                            </p>
                                        )}

                                        {/* Social media */}
                                        {bidang.kepalaBagian.socialMedia &&
                                            bidang.kepalaBagian.socialMedia
                                                .length > 0 && (
                                                <div className="flex items-center gap-3">
                                                    {bidang.kepalaBagian.socialMedia.map(
                                                        (sm) => {
                                                            const Icon =
                                                                socialIcons[
                                                                    sm.platform
                                                                ];

                                                            return (
                                                                <a
                                                                    key={
                                                                        sm.platform
                                                                    }
                                                                    href={
                                                                        sm.url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    aria-label={
                                                                        sm.platform
                                                                    }
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e6f4ea] text-[#0a6c32] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a6c32] hover:text-white hover:shadow-md"
                                                                >
                                                                    <Icon
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </a>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Anggota lainnya */}
                        {bidang.anggota.length > 0 && (
                            <div className="mt-16">
                                <h3 className="mb-8 text-center text-lg font-bold text-[#1A1A1A]">
                                    Anggota Lainnya
                                </h3>
                                <div
                                    ref={anggotaRef}
                                    className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4"
                                >
                                    {bidang.anggota.map((a, idx) => (
                                        <div
                                            key={a.nama}
                                            className={`bka-reveal-scale bka-stagger-${idx + 1}`}
                                        >
                                            <div className="flex flex-col items-center rounded-2xl border border-[#DDE5DD] bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                                <div className="mb-3 h-20 w-20 overflow-hidden rounded-full bg-[#e6f4ea]">
                                                    <img
                                                        src={
                                                            a.foto ||
                                                            'https://placehold.co/80x80/E8F5E9/1B5E20?text=' +
                                                                a.nama.charAt(0)
                                                        }
                                                        alt={a.nama}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <p className="text-sm font-bold text-[#1A1A1A]">
                                                    {a.nama}
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#5C6B73]">
                                                    {a.jabatan}
                                                </p>
                                                {a.socialMedia && a.socialMedia.length > 0 && (
                                                    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                                        {a.socialMedia.map((sm) => {
                                                            const Icon = socialIcons[sm.platform];
                                                            if (!Icon) return null;
                                                            return (
                                                                <a
                                                                    key={sm.platform}
                                                                    href={sm.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    aria-label={sm.platform}
                                                                    className="flex items-center justify-center rounded-lg bg-[#e6f4ea] text-[#0a6c32] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a6c32] hover:text-white hover:shadow-xs"
                                                                    style={{ width: '30px', height: '30px' }}
                                                                >
                                                                    <Icon size={13} />
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* CTA */}
            {bidang.cta && bidang.cta.heading && (
                <section
                    className="relative overflow-hidden"
                    style={{
                        background:
                            'linear-gradient(135deg, #144317 0%, #0a6c32 50%, #206825 100%)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-60"
                        style={{
                            backgroundImage:
                                'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div
                        ref={ctaRef}
                        className="bka-reveal bka-container relative z-[1] py-16 text-center md:py-20"
                    >
                        <h2
                            className="mx-auto mb-3 max-w-[540px] leading-[1.3] font-bold text-white"
                            style={{ fontSize: 'clamp(20px, 3.5vw, 28px)' }}
                        >
                            {bidang.cta.heading}
                        </h2>
                        {bidang.cta.sub && (
                            <p className="mb-7 text-[15px] text-white/75">
                                {bidang.cta.sub}
                            </p>
                        )}
                        {bidang.cta.buttonText && (
                            <a
                                href={bidang.cta.buttonHref ?? '#'}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[#C8A000] px-7 py-3 text-[15px] font-bold text-[#1A1A1A] no-underline shadow-[0_4px_20px_rgba(200,160,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b89200] hover:shadow-[0_6px_28px_rgba(200,160,0,0.45)]"
                            >
                                {bidang.cta.buttonText}
                            </a>
                        )}
                    </div>
                </section>
            )}

            {/* Back link */}
            <section className="bg-white py-10">
                <div className="bka-container text-center">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0a6c32] no-underline transition-all duration-200 hover:gap-3"
                    >
                        <ArrowLeft
                            size={16}
                            className="transition-transform duration-200 group-hover:-translate-x-0.5"
                        />
                        Kembali ke Beranda
                    </Link>
                </div>
            </section>
        </>
    );
}
