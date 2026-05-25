import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Compass, Target } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import PublicLayout from '@/layouts/public-layout';

interface MisiItem {
    id: number;
    isi: string;
    urutan: number;
}

interface VisiMisiProps {
    visi?: string;
    misiItems?: MisiItem[];
}

export default function VisiMisi({ visi, misiItems }: VisiMisiProps) {
    // Fallback Mock Data
    const defaultVisi =
        visi ||
        'Menjadi penyelenggara administrasi keuangan dan pengelolaan aset yang unggul, terpercaya, transparan, dan akuntabel berbasis digitalisasi layanan demi mendukung Universitas Muhammadiyah Riau yang cerdas, inovatif, dan berkemajuan pada tahun 2028.';

    const defaultMisiItems = misiItems || [
        {
            id: 1,
            isi: 'Menyelenggarakan sistem perencanaan, penganggaran, dan pengendalian keuangan yang efisien, transparan, dan akuntabel.',
            urutan: 1,
        },
        {
            id: 2,
            isi: 'Mengembangkan digitalisasi administrasi layanan keuangan terintegrasi guna memberikan kemudahan pelayanan terbaik bagi seluruh mahasiswa dan civitas akademika.',
            urutan: 2,
        },
        {
            id: 3,
            isi: 'Melaksanakan penataan, pembukuan, dan pelaporan sarana, prasarana, serta aset fisik universitas secara profesional dan akurat.',
            urutan: 3,
        },
        {
            id: 4,
            isi: 'Mengoptimalkan pemanfaatan dan produktivitas aset fisik maupun finansial kampus untuk keberlangsungan finansial universitas yang mandiri.',
            urutan: 4,
        },
        {
            id: 5,
            isi: 'Membina kualitas sumber daya manusia pengelola keuangan dan logistik yang berintegritas tinggi, kompeten, dan memegang teguh nilai-nilai Al-Islam Kemuhammadiyahan.',
            urutan: 5,
        },
    ];

    const [liveVisi, setLiveVisi] = useState(defaultVisi);
    const [liveMisiItems, setLiveMisiItems] =
        useState<MisiItem[]>(defaultMisiItems);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('bka_visi_misi');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.visi) setLiveVisi(parsed.visi);
                    if (parsed.misiItems) setLiveMisiItems(parsed.misiItems);
                } catch (e) {
                    // ignore
                }
            }
        }
    }, [defaultVisi, defaultMisiItems]);

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Visi & Misi', href: '/profil/visi-misi' },
    ];

    return (
        <>
            <Head>
                <title>Visi & Misi - Profil BKA UMRI</title>
                <meta
                    name="description"
                    content="Visi dan Misi Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI) sebagai dasar nilai operasional."
                />
            </Head>

            <div className="flex min-h-screen w-full flex-col bg-[#F7F9F7] pb-16">
                {/* Reusable PageHero */}
                <PageHero
                    title="Profil BKA"
                    description="Visi dan Misi sebagai arah gerak komitmen pelayanan BKA UMRI."
                    className="bg-gradient-to-r from-[#1B5E20] to-[#0D3C10]"
                >
                    <Breadcrumbs
                        breadcrumbs={breadcrumbItems}
                        variant="public"
                    />
                </PageHero>

                {/* Sub Navigation Tabs */}
                <ProfilTabs />

                {/* Main Content Area */}
                <div className="mx-auto mt-12 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Visi Section */}
                    <div className="relative mb-12 overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white p-8 shadow-md sm:p-12">
                        <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-[#E8F5E9] opacity-40" />
                        <div className="pointer-events-none absolute -top-4 -left-4 font-serif text-8xl text-gray-100 opacity-30 select-none">
                            “
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#1B5E20] shadow-sm">
                                <Compass size={32} />
                            </div>
                            <h2 className="mb-2 text-xs font-bold tracking-widest text-[#1B5E20] uppercase">
                                Visi BKA UMRI
                            </h2>
                            <p className="max-w-3xl text-2xl leading-relaxed font-bold tracking-tight text-gray-900 italic">
                                &ldquo;{liveVisi}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Misi Section */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white p-8 shadow-md sm:p-12">
                        <div className="flex flex-col items-start gap-8 md:flex-row">
                            {/* Left column title */}
                            <div className="flex-shrink-0 md:w-1/3">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                                    <Target size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Misi BKA UMRI
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Langkah-langkah strategis terukur yang kami
                                    jalankan demi tercapainya Visi luhur
                                    institusi secara konsisten.
                                </p>
                            </div>

                            {/* Right column list items */}
                            <div className="w-full space-y-6 md:w-2/3">
                                {liveMisiItems
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((misi, index) => (
                                        <div
                                            key={misi.id}
                                            className="group flex items-start gap-4"
                                        >
                                            {/* Number Circle Badge */}
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#DDE5DD] bg-[#E8F5E9] text-sm font-bold text-[#1B5E20] shadow-sm transition-all duration-200 group-hover:bg-[#1B5E20] group-hover:text-white">
                                                {index + 1}
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 pt-0.5">
                                                <p className="leading-relaxed font-medium text-gray-700">
                                                    {misi.isi}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

VisiMisi.layout = (page: React.ReactNode) => (
    <PublicLayout>{page}</PublicLayout>
);
