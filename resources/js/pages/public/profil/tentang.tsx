import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Landmark, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import PublicLayout from '@/layouts/public-layout';

interface TentangProps {
    konten?: string;
}

export default function Tentang({ konten }: TentangProps) {
    // Fallback Mock Data
    const defaultKonten =
        konten ||
        `
        <p class="lead">Biro Keuangan dan Aset (BKA) Universitas Muhammadiyah Riau merupakan unsur pelaksana administratif yang menyelenggarakan pelayanan teknis dan administratif di bidang pengelolaan keuangan serta pembinaan dan pengelolaan sarana, prasarana, dan aset universitas.</p>
        
        <h2>Sejarah Singkat</h2>
        <p>Seiring dengan perkembangan Universitas Muhammadiyah Riau yang tumbuh pesat sejak didirikan pada tahun 2008, kebutuhan akan tata kelola keuangan yang sistematis, transparan, dan akuntabel menjadi sangat krusial. Biro Keuangan dan Aset dibentuk sebagai langkah strategis universitas untuk mengkonsolidasikan seluruh urusan anggaran, pembiayaan, logistik, inventarisasi, dan optimalisasi aset fisik dalam satu pintu koordinasi yang profesional.</p>
        
        <h2>Fungsi Utama BKA UMRI</h2>
        <p>Biro Keuangan & Aset menjalankan serangkaian fungsi penting guna mendukung kelancaran seluruh proses Tri Dharma Perguruan Tinggi di lingkungan Universitas Muhammadiyah Riau:</p>
        <ul>
            <li><strong>Perencanaan Anggaran & Pendapatan:</strong> Merumuskan rancangan anggaran tahunan universitas berdasarkan prinsip efisiensi dan skala prioritas pengembangan institusi.</li>
            <li><strong>Administrasi Transaksi & Pembukuan:</strong> Memproses seluruh transaksi keuangan secara cermat, akurat, terverifikasi, serta melakukan pencatatan buku besar terintegrasi.</li>
            <li><strong>Pelayanan Administrasi Pembayaran Mahasiswa:</strong> Memberikan fasilitas pembayaran biaya kuliah (SPP, DPP, Jas Almamater, Wisuda, dll) secara mudah melalui sistem perbankan online yang modern.</li>
            <li><strong>Pengelolaan Sarana, Prasarana & Aset:</strong> Melakukan inventarisasi berkala, perawatan, distribusi logistik, serta menjaga legalitas kepemilikan aset fisik kampus secara sistematis.</li>
            <li><strong>Pelaporan Keuangan Berkala:</strong> Menyajikan laporan keuangan real-time dan tahunan yang diaudit oleh Kantor Akuntan Publik (KAP) independen demi mewujudkan akuntabilitas publik.</li>
        </ul>

        <blockquote>
            BKA UMRI berkomitmen untuk terus menghadirkan inovasi digitalisasi layanan demi mewujudkan ekosistem keuangan kampus yang andal, amanah, dan berorientasi pada kepuasan civitas akademika.
        </blockquote>
    `;

    const [liveKonten, setLiveKonten] = useState(defaultKonten);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bka_tentang_kami');
            if (saved) {
                setLiveKonten(saved);
            }
        }
    }, [defaultKonten]);

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Tentang Kami', href: '/profil/tentang-kami' },
    ];

    return (
        <>
            <Head>
                <title>Tentang Kami - Profil BKA UMRI</title>
                <meta
                    name="description"
                    content="Ketahui profil lengkap, sejarah singkat, dan fungsi utama Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI)."
                />
            </Head>

            <div className="flex min-h-screen w-full flex-col bg-[#F7F9F7] pb-16">
                {/* Reusable PageHero */}
                <PageHero
                    title="Profil BKA"
                    description="Mengenal Biro Keuangan & Aset Universitas Muhammadiyah Riau lebih dekat."
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
                <div className="mx-auto mt-12 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Article Column */}
                        <div className="rounded-2xl border border-[#DDE5DD] bg-white p-6 shadow-md sm:p-10 lg:col-span-2">
                            <article
                                className="prose max-w-none text-gray-700 prose-emerald prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h2:mt-8 prose-h2:border-b prose-h2:border-[#E8F5E9] prose-h2:pb-3 prose-h2:text-2xl prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-[#1B5E20] prose-blockquote:bg-[#E8F5E9] prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:italic prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5"
                                dangerouslySetInnerHTML={{ __html: liveKonten }}
                            />
                        </div>

                        {/* Sidebar Info Cards */}
                        <div className="space-y-6">
                            {/* Card 1: Nilai Utama */}
                            <div className="relative overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white p-6 shadow-md">
                                <div className="absolute top-0 right-0 -z-0 h-24 w-24 rounded-bl-full bg-[#E8F5E9] opacity-40" />
                                <h3 className="relative z-10 mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <ShieldCheck
                                        className="text-[#1B5E20]"
                                        size={20}
                                    />
                                    Nilai-Nilai BKA
                                </h3>
                                <ul className="relative z-10 space-y-3 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C8A000]" />
                                        <div>
                                            <strong className="block text-gray-800">
                                                Amanah
                                            </strong>
                                            Menjaga keandalan pengelolaan dana
                                            dan aset secara jujur dan
                                            berintegritas.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C8A000]" />
                                        <div>
                                            <strong className="block text-gray-800">
                                                Transparan
                                            </strong>
                                            Menyajikan pencatatan keuangan dan
                                            laporan aset yang dapat diakses
                                            secara terbuka.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C8A000]" />
                                        <div>
                                            <strong className="block text-gray-800">
                                                Profesional
                                            </strong>
                                            Melayani civitas akademika dengan
                                            standar kompetensi tinggi dan
                                            keilmuan yang mumpuni.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2: Layanan Cepat */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#0D3C10] p-6 text-white shadow-md">
                                <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
                                <h3 className="relative z-10 mb-3 flex items-center gap-2 text-lg font-bold">
                                    <Landmark
                                        size={20}
                                        className="text-[#C8A000]"
                                    />
                                    Butuh Bantuan Keuangan?
                                </h3>
                                <p className="relative z-10 mb-5 text-sm text-white/80">
                                    BKA menyediakan kanal layanan administrasi
                                    pembayaran perkuliahan dan bantuan keuangan
                                    untuk seluruh civitas akademika UMRI.
                                </p>
                                <a
                                    href="/kontak"
                                    className="relative z-10 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B5E20] shadow transition-colors duration-150 hover:bg-gray-100"
                                >
                                    Hubungi BKA
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Tentang.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
