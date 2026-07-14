import { Seo } from '@/components/seo';
import { Head } from '@inertiajs/react';
import { Users, ZoomIn, X } from 'lucide-react';
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
    tugas_pokok?: string;
    jobdesk?: string;
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
    const [selectedAnggota, setSelectedAnggota] = useState<AnggotaProps | null>(null);
    const [activeTab, setActiveTab] = useState<'tugas' | 'jobdesk'>('tugas');

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
            <Seo title="Struktur Organisasi - Profil BKA UMRI" description="Bagan struktur organisasi dan daftar personalia/anggota resmi Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI)." />

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
                                width="1120"
                                height="500"
                                loading="lazy"
                                decoding="async"
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
                                            width="128"
                                            height="128"
                                            loading="lazy"
                                            decoding="async"
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
                                        onClick={() => {
                                            setSelectedAnggota(anggota);
                                            setActiveTab('tugas');
                                        }}
                                        className="flex cursor-pointer transform flex-col items-center rounded-2xl border border-[#DDE5DD] bg-white p-6 text-center shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:border-[#0a6c32]/30 hover:shadow-md"
                                    >
                                        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[#e6f4ea] shadow-sm">
                                            <img
                                                src={anggota.foto}
                                                alt={anggota.nama}
                                                width="96"
                                                height="96"
                                                loading="lazy"
                                                decoding="async"
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
                                            Klik untuk detail
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Personalia */}
            {selectedAnggota && (
                <div 
                    className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200 fade-in"
                    onClick={() => setSelectedAnggota(null)}
                >
                    <div 
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in rounded-2xl border border-[#DDE5DD] bg-white p-6 md:p-10 shadow-xl duration-200 zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedAnggota(null)}
                            className="absolute top-4 right-4 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            <X className="size-5" />
                        </button>

                        {/* Profile Section */}
                        <div className="flex flex-col items-center md:flex-row md:items-start gap-6 border-b border-[#DDE5DD] pb-6 mb-6">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#e6f4ea] bg-gray-50 shadow-sm md:h-28 md:w-28">
                                <img
                                    src={selectedAnggota.foto}
                                    alt={selectedAnggota.nama}
                                    width="112"
                                    height="112"
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left pt-2">
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {selectedAnggota.nama}
                                </h3>
                                <p className="mt-1.5 text-sm font-semibold text-[#0a6c32]">
                                    {selectedAnggota.jabatan}
                                </p>
                                <span className="mt-2 inline-block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                    Staf Pelaksana BKA UMRI
                                </span>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-[#DDE5DD] mb-6">
                            <button
                                onClick={() => setActiveTab('tugas')}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 mr-6 outline-none ${
                                    activeTab === 'tugas'
                                        ? 'border-[#0a6c32] text-[#0a6c32]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Tugas Pokok
                            </button>
                            <button
                                onClick={() => setActiveTab('jobdesk')}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 outline-none ${
                                    activeTab === 'jobdesk'
                                        ? 'border-[#0a6c32] text-[#0a6c32]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Rincian Jobdesk
                            </button>
                        </div>

                        {/* Details Area */}
                        <div className="min-h-[150px]">
                            {activeTab === 'tugas' ? (
                                selectedAnggota.tugas_pokok ? (
                                    <div
                                        className="prose prose-sm prose-emerald max-w-none text-gray-600 prose-ul:list-disc prose-ul:pl-4 prose-li:my-1"
                                        dangerouslySetInnerHTML={{ __html: selectedAnggota.tugas_pokok }}
                                    />
                                ) : (
                                    <p className="text-sm italic text-gray-400">Belum ada rincian tugas pokok.</p>
                                )
                            ) : (
                                selectedAnggota.jobdesk ? (
                                    <div
                                        className="prose prose-sm prose-emerald max-w-none text-gray-600 prose-ul:list-disc prose-ul:pl-4 prose-li:my-1"
                                        dangerouslySetInnerHTML={{ __html: selectedAnggota.jobdesk }}
                                    />
                                ) : (
                                    <p className="text-sm italic text-gray-400">Belum ada rincian jobdesk.</p>
                                )
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="mt-8 pt-6 border-t border-[#DDE5DD] text-right">
                            <button
                                type="button"
                                onClick={() => setSelectedAnggota(null)}
                                className="inline-flex items-center justify-center rounded-xl border border-[#DDE5DD] bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Struktur.layout = (page: React.ReactNode) => (
    <PublicLayout>{page}</PublicLayout>
);
