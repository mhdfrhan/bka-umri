import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import { Award, Compass, Milestone, Target } from 'lucide-react';

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
    // ----------------------------------------------------
    // Fallback Mock Data for UI Visual Completeness
    // ----------------------------------------------------
    const finalVisi = visi || 'Menjadi penyelenggara administrasi keuangan dan pengelolaan aset yang unggul, terpercaya, transparan, dan akuntabel berbasis digitalisasi layanan demi mendukung Universitas Muhammadiyah Riau yang cerdas, inovatif, dan berkemajuan pada tahun 2028.';

    const finalMisiItems = misiItems || [
        {
            id: 1,
            isi: 'Menyelenggarakan sistem perencanaan, penganggaran, dan pengendalian keuangan yang efisien, transparan, dan akuntabel.',
            urutan: 1
        },
        {
            id: 2,
            isi: 'Mengembangkan digitalisasi administrasi layanan keuangan terintegrasi guna memberikan kemudahan pelayanan terbaik bagi seluruh mahasiswa dan civitas akademika.',
            urutan: 2
        },
        {
            id: 3,
            isi: 'Melaksanakan penataan, pembukuan, dan pelaporan sarana, prasarana, serta aset fisik universitas secara profesional dan akurat.',
            urutan: 3
        },
        {
            id: 4,
            isi: 'Mengoptimalkan pemanfaatan dan produktivitas aset fisik maupun finansial kampus untuk keberlangsungan finansial universitas yang mandiri.',
            urutan: 4
        },
        {
            id: 5,
            isi: 'Membina kualitas sumber daya manusia pengelola keuangan dan logistik yang berintegritas tinggi, kompeten, dan memegang teguh nilai-nilai Al-Islam Kemuhammadiyahan.',
            urutan: 5
        }
    ];

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Visi & Misi', href: '/profil/visi-misi' },
    ];

    return (
        <>
            <Head>
                <title>Visi & Misi - Profil BKA UMRI</title>
                <meta name="description" content="Visi dan Misi Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI) sebagai dasar nilai operasional." />
            </Head>

            <div className="min-h-screen bg-[#F7F9F7] flex flex-col w-full pb-16">
                {/* Reusable PageHero */}
                <PageHero 
                    title="Profil BKA" 
                    description="Visi dan Misi sebagai arah gerak komitmen pelayanan BKA UMRI."
                    className="bg-gradient-to-r from-[#1B5E20] to-[#0D3C10]"
                >
                    <Breadcrumbs breadcrumbs={breadcrumbItems} />
                </PageHero>

                {/* Sub Navigation Tabs */}
                <ProfilTabs />

                {/* Main Content Area */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
                    {/* Visi Section */}
                    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-md border border-[#DDE5DD] relative overflow-hidden mb-12">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8F5E9] rounded-bl-full -z-0 opacity-40" />
                        <div className="absolute -top-4 -left-4 text-gray-100 font-serif text-8xl pointer-events-none select-none opacity-30">“</div>
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] mb-6 shadow-sm">
                                <Compass size={32} />
                            </div>
                            <h2 className="text-xs uppercase tracking-widest text-[#1B5E20] font-bold mb-2">Visi BKA UMRI</h2>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight max-w-3xl leading-relaxed italic">
                                &ldquo;{finalVisi}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Misi Section */}
                    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-md border border-[#DDE5DD] relative overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Left column title */}
                            <div className="md:w-1/3 flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] mb-4">
                                    <Target size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Misi BKA UMRI</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    Langkah-langkah strategis terukur yang kami jalankan demi tercapainya Visi luhur institusi secara konsisten.
                                </p>
                            </div>

                            {/* Right column list items */}
                            <div className="md:w-2/3 w-full space-y-6">
                                {finalMisiItems
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((misi, index) => (
                                        <div key={misi.id} className="flex gap-4 items-start group">
                                            {/* Number Circle Badge */}
                                            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#1B5E20] font-bold text-sm flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B5E20] group-hover:text-white transition-all duration-200 shadow-sm border border-[#DDE5DD]">
                                                {index + 1}
                                            </div>
                                            
                                            {/* Text Content */}
                                            <div className="flex-1 pt-0.5">
                                                <p className="text-gray-700 leading-relaxed font-medium">
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

VisiMisi.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
