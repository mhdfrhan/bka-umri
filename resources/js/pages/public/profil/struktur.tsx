import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Users, ZoomIn } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import PublicLayout from '@/layouts/public-layout';
import Lightbox from 'yet-another-react-lightbox';

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

export default function Struktur({ gambarBagan, kepalaBiro, anggotaList }: StrukturProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Fallback Mock Data
    const defaultGambarBagan = gambarBagan || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80';

    const defaultKepalaBiro = kepalaBiro || {
        nama: 'Rahmawita, S.E',
        jabatan: 'Kepala Biro Keuangan & Aset UMRI',
        periode: 'Periode 2024 - 2028',
        foto: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/f405f-rahmawita-se.jpg'
    };

    const defaultAnggotaList = anggotaList || [
        {
            id: 1,
            nama: 'Dina Amalia, S.E., Ak.',
            jabatan: 'Kepala Bagian Keuangan & Verifikasi',
            foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
            urutan: 1
        },
        {
            id: 2,
            nama: 'Budi Hartono, S.Kom.',
            jabatan: 'Kepala Bagian Pengelolaan Aset & Inventaris',
            foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
            urutan: 2
        },
        {
            id: 3,
            nama: 'Rina Marlina, A.Md.',
            jabatan: 'Staf Administrasi Pembayaran SPP',
            foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
            urutan: 3
        },
        {
            id: 4,
            nama: 'Fahmi Syahputra, S.Ak.',
            jabatan: 'Staf Verifikasi & Anggaran Belanja',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            urutan: 4
        },
        {
            id: 5,
            nama: 'Siti Rahmah, S.E.',
            jabatan: 'Staf Logistik & Pengadaan Barang',
            foto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80',
            urutan: 5
        },
        {
            id: 6,
            nama: 'Andi Wijaya, A.Md.T.',
            jabatan: 'Staf Sarana Prasarana & Inventaris Aset',
            foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
            urutan: 6
        }
    ];

    const [liveGambarBagan, setLiveGambarBagan] = useState(defaultGambarBagan);
    const [liveKepalaBiro, setLiveKepalaBiro] = useState<KepalaBiroProps | null>(defaultKepalaBiro);
    const [liveAnggotaList, setLiveAnggotaList] = useState<AnggotaProps[]>(defaultAnggotaList);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bka_struktur_organisasi');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.gambarBagan) setLiveGambarBagan(parsed.gambarBagan);
                    if (parsed.anggotaList) setLiveAnggotaList(parsed.anggotaList);
                } catch (e) {
                    // ignore
                }
            }

            // Sync Kepala Biro from home page CMS if exists
            const savedBeranda = localStorage.getItem('bka_beranda');
            if (savedBeranda) {
                try {
                    const parsedBeranda = JSON.parse(savedBeranda);
                    if (parsedBeranda.kepalaBiro) {
                        setLiveKepalaBiro({
                            nama: parsedBeranda.kepalaBiro.nama || defaultKepalaBiro.nama,
                            jabatan: parsedBeranda.kepalaBiro.jabatan || defaultKepalaBiro.jabatan,
                            periode: parsedBeranda.kepalaBiro.periode || defaultKepalaBiro.periode,
                            foto: parsedBeranda.kepalaBiro.foto || defaultKepalaBiro.foto
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }, [defaultGambarBagan, defaultAnggotaList]);

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
    ];

    return (
        <>
            <Head>
                <title>Struktur Organisasi - Profil BKA UMRI</title>
                <meta name="description" content="Bagan struktur organisasi dan daftar personalia/anggota resmi Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI)." />
            </Head>

            <div className="min-h-screen bg-[#F7F9F7] flex flex-col w-full pb-20">
                {/* Reusable PageHero */}
                <PageHero 
                    title="Profil BKA" 
                    description="Struktur Organisasi dan Personalia pengelola BKA UMRI."
                    className="bg-gradient-to-r from-[#1B5E20] to-[#0D3C10]"
                >
                    <Breadcrumbs breadcrumbs={breadcrumbItems} />
                </PageHero>

                {/* Sub Navigation Tabs */}
                <ProfilTabs />

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
                    
                    {/* Section 1: Bagan Struktur Organisasi */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] shadow-sm">
                                <Users size={20} />
                            </div>
                            <div>
                                <h2 className="text-xs uppercase tracking-widest text-[#1B5E20] font-bold">Bagan Instansi</h2>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Bagan Alur Organisasi</h3>
                            </div>
                        </div>

                        {/* Bagan Image with zoom modal */}
                        <div 
                            className="bg-white rounded-2xl border border-[#DDE5DD] p-4 sm:p-6 shadow-md relative overflow-hidden group cursor-zoom-in"
                            onClick={() => setIsOpen(true)}
                        >
                            <img 
                                src={liveGambarBagan} 
                                alt="Diagram Bagan Struktur Organisasi BKA UMRI" 
                                className="w-full max-h-[500px] object-contain rounded-xl transition-all duration-300 group-hover:scale-[1.01]" 
                            />
                            
                            {/* Zoom overlay indicator */}
                            <div className="absolute inset-0 bg-[#1B5E20]/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                <div className="bg-white/95 text-gray-800 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg font-semibold text-sm transform scale-95 group-hover:scale-100 transition-all duration-300">
                                    <ZoomIn size={16} className="text-[#1B5E20]" />
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
                        <div className="flex flex-col items-center text-center mb-10">
                            <span className="text-xs uppercase tracking-widest text-[#1B5E20] font-bold">Struktur Personalia</span>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">Pengelola & Anggota BKA UMRI</h2>
                            <div className="w-12 h-1 bg-[#C8A000] rounded-full mt-3" />
                        </div>

                        {/* Top Spotlight: Kepala Biro BKA */}
                        {liveKepalaBiro && (
                            <div className="max-w-md mx-auto mb-16 relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/5 to-[#C8A000]/5 rounded-3xl border-2 border-[#C8A000] -z-0 opacity-100 shadow-md" />
                                
                                <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center relative z-10 border border-[#DDE5DD] shadow-sm transform hover:translate-y-[-4px] transition-all duration-200">
                                    {/* Gold crown or top accent */}
                                    <div className="absolute top-0 transform -translate-y-1/2 bg-[#C8A000] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow">
                                        Pimpinan
                                    </div>
                                    
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E8F5E9] shadow-inner mb-6 relative">
                                        <img 
                                            src={liveKepalaBiro.foto} 
                                            alt={liveKepalaBiro.nama} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                        {liveKepalaBiro.nama}
                                    </h3>
                                    <p className="text-sm font-semibold text-[#1B5E20] mt-1">
                                        {liveKepalaBiro.jabatan}
                                    </p>
                                    {liveKepalaBiro.periode && (
                                        <span className="inline-block mt-3 text-xs bg-[#E8F5E9] text-[#1B5E20] px-3 py-1 rounded-full font-medium">
                                            {liveKepalaBiro.periode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Grid: Staff & Anggota */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveAnggotaList
                                .sort((a, b) => a.urutan - b.urutan)
                                .map((anggota) => (
                                    <div 
                                        key={anggota.id} 
                                        className="bg-white rounded-2xl p-6 border border-[#DDE5DD] shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-[#1B5E20]/30 transform hover:translate-y-[-2px] transition-all duration-200"
                                    >
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E8F5E9] mb-4 shadow-sm">
                                            <img 
                                                src={anggota.foto} 
                                                alt={anggota.nama} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        
                                        <h4 className="text-base font-bold text-gray-900 tracking-tight">
                                            {anggota.nama}
                                        </h4>
                                        <p className="text-xs font-semibold text-[#1B5E20] mt-0.5">
                                            {anggota.jabatan}
                                        </p>
                                        
                                        {/* Decorative separator */}
                                        <div className="w-8 h-[1px] bg-gray-100 my-4" />
                                        
                                        <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
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

Struktur.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
