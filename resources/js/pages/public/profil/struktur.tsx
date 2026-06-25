import { Head } from '@inertiajs/react';
import { Users, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import PublicLayout from '@/layouts/public-layout';

import 'yet-another-react-lightbox/styles.css';

interface AnggotaProps {
    id: number;
    nama: string;
    jabatan: string;
    foto?: string;
    urutan: number;
}

interface KepalaBiroProps {
    nama: string;
    jabatan: string;
    foto?: string;
    periode?: string;
}

interface StrukturProps {
    gambarBagan?: string | null;
    kepalaBiro?: KepalaBiroProps | null;
    anggotaList?: AnggotaProps[];
}

export default function Struktur({
    gambarBagan,
    kepalaBiro,
    anggotaList,
}: StrukturProps) {
    const [isOpen, setIsOpen] = useState(false);

    const liveGambarBagan = gambarBagan || '';
    const liveKepalaBiro = kepalaBiro || null;
    const liveAnggotaList = anggotaList || [];

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
    ];

    return (
        <>
            <Head>
                <title>Struktur Organisasi - Profil BKA UMRI</title>
                <meta
                    name="description"
                    content="Bagan struktur organisasi dan daftar personalia/anggota resmi Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI)."
                />
            </Head>

            <div className="flex min-h-screen w-full flex-col bg-[#F7F9F7] pb-20">
                {/* Reusable PageHero */}
                <PageHero
                    title="Profil BKA"
                    description="Struktur Organisasi dan Personalia pengelola BKA UMRI."
                    className="bg-gradient-to-r from-[#0a6c32] to-[#0D3C10]"
                >
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </PageHero>

                {/* Sub Navigation Tabs */}
                <ProfilTabs />

                {/* Main Content Area */}
                <div className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Section 1: Bagan Struktur Organisasi */}
                    <div className="mb-16">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ea] text-[#0a6c32] shadow-sm">
                                <Users size={20} />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold tracking-widest text-[#0a6c32] uppercase">
                                    Bagan Instansi
                                </h2>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Bagan Alur Organisasi
                                </h3>
                            </div>
                        </div>

                        {/* Bagan Image with zoom modal */}
                        <div
                            className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white p-4 shadow-md sm:p-6"
                            onClick={() => setIsOpen(true)}
                        >
                            <img
                                src={liveGambarBagan}
                                alt="Diagram Bagan Struktur Organisasi BKA UMRI"
                                className="max-h-[500px] w-full rounded-xl object-contain transition-all duration-300 group-hover:scale-[1.01]"
                            />

                            {/* Zoom overlay indicator */}
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a6c32]/10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <div className="flex scale-95 transform items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-lg transition-all duration-300 group-hover:scale-100">
                                    <ZoomIn
                                        size={16}
                                        className="text-[#0a6c32]"
                                    />
                                    Klik untuk memperbesar bagan
                                </div>
                            </div>
                        </div>

                        {/* Lightbox Trigger */}
                        <Lightbox
                            open={isOpen}
                            close={() => setIsOpen(false)}
                            slides={[{ src: liveGambarBagan }]}
                        />
                    </div>

                    {/* Section 2: Personalia Kepengurusan */}
                    <div>
                        <div className="mb-10 flex flex-col items-center text-center">
                            <span className="text-xs font-bold tracking-widest text-[#0a6c32] uppercase">
                                Struktur Personalia
                            </span>
                            <h2 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                                Pengelola & Anggota BKA UMRI
                            </h2>
                            <div className="mt-3 h-1 w-12 rounded-full bg-[#C8A000]" />
                        </div>

                        {/* Top Spotlight: Kepala Biro BKA */}
                        {liveKepalaBiro && (
                            <div className="group relative mx-auto mb-16 max-w-md">
                                <div className="absolute inset-0 -z-0 rounded-3xl border-2 border-[#C8A000] bg-gradient-to-br from-[#0a6c32]/5 to-[#C8A000]/5 opacity-100 shadow-md" />

                                <div className="relative z-10 flex transform flex-col items-center rounded-3xl border border-[#DDE5DD] bg-white p-8 text-center shadow-sm transition-all duration-200 hover:translate-y-[-4px]">
                                    {/* Gold crown or top accent */}
                                    <div className="absolute top-0 -translate-y-1/2 transform rounded-full bg-[#C8A000] px-4 py-1 text-xs font-bold tracking-widest text-white uppercase shadow">
                                        Pimpinan
                                    </div>

                                    <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-[#e6f4ea] shadow-inner">
                                        <img
                                            src={liveKepalaBiro.foto}
                                            alt={liveKepalaBiro.nama}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight text-gray-900">
                                        {liveKepalaBiro.nama}
                                    </h3>
                                    <p className="mt-1 text-sm font-semibold text-[#0a6c32]">
                                        {liveKepalaBiro.jabatan}
                                    </p>
                                    {liveKepalaBiro.periode && (
                                        <span className="mt-3 inline-block rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-medium text-[#0a6c32]">
                                            {liveKepalaBiro.periode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Grid: Staff & Anggota */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {liveAnggotaList
                                .sort((a, b) => a.urutan - b.urutan)
                                .map((anggota) => (
                                    <div
                                        key={anggota.id}
                                        className="flex transform flex-col items-center rounded-2xl border border-[#DDE5DD] bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:border-[#0a6c32]/30 hover:shadow-md"
                                    >
                                        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[#e6f4ea] shadow-sm">
                                            <img
                                                src={anggota.foto}
                                                alt={anggota.nama}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <h4 className="text-base font-bold tracking-tight text-gray-900">
                                            {anggota.nama}
                                        </h4>
                                        <p className="mt-0.5 text-xs font-semibold text-[#0a6c32]">
                                            {anggota.jabatan}
                                        </p>

                                        {/* Decorative separator */}
                                        <div className="my-4 h-[1px] w-8 bg-gray-100" />

                                        <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                            Staf BKA UMRI
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Struktur.layout = (page: React.ReactNode) => (
    <PublicLayout>{page}</PublicLayout>
);
