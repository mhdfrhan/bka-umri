import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProfilTabs from '@/components/public/profil/profil-tabs';
import { BookOpen, Landmark, ShieldCheck } from 'lucide-react';

interface TentangProps {
    konten?: string;
}

export default function Tentang({ konten }: TentangProps) {
    // ----------------------------------------------------
    // Fallback Mock Data for Visual Completeness
    // ----------------------------------------------------
    const finalKonten = konten || `
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

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Profil', href: '#' },
        { title: 'Tentang Kami', href: '/profil/tentang-kami' },
    ];

    return (
        <>
            <Head>
                <title>Tentang Kami - Profil BKA UMRI</title>
                <meta name="description" content="Ketahui profil lengkap, sejarah singkat, dan fungsi utama Biro Keuangan & Aset Universitas Muhammadiyah Riau (UMRI)." />
            </Head>

            <div className="min-h-screen bg-[#F7F9F7] flex flex-col w-full pb-16">
                {/* Reusable PageHero */}
                <PageHero 
                    title="Profil BKA" 
                    description="Mengenal Biro Keuangan & Aset Universitas Muhammadiyah Riau lebih dekat."
                    className="bg-gradient-to-r from-[#1B5E20] to-[#0D3C10]"
                >
                    <Breadcrumbs breadcrumbs={breadcrumbItems} />
                </PageHero>

                {/* Sub Navigation Tabs */}
                <ProfilTabs />

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Article Column */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-10 shadow-md border border-[#DDE5DD]">
                            <article 
                                className="prose prose-emerald max-w-none text-gray-700
                                           prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                                           prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#E8F5E9] prose-h2:pb-3 prose-h2:mt-8
                                           prose-ul:list-disc prose-ul:pl-5
                                           prose-blockquote:border-l-4 prose-blockquote:border-[#1B5E20] prose-blockquote:bg-[#E8F5E9] prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:italic
                                           prose-strong:text-gray-900"
                                dangerouslySetInnerHTML={{ __html: finalKonten }}
                            />
                        </div>

                        {/* Sidebar Info Cards */}
                        <div className="space-y-6">
                            {/* Card 1: Nilai Utama */}
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DDE5DD] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8F5E9] rounded-bl-full -z-0 opacity-40" />
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                                    <ShieldCheck className="text-[#1B5E20]" size={20} />
                                    Nilai-Nilai BKA
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-600 relative z-10">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A000] mt-1.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-800 block">Amanah</strong>
                                            Menjaga keandalan pengelolaan dana dan aset secara jujur dan berintegritas.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A000] mt-1.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-800 block">Transparan</strong>
                                            Menyajikan pencatatan keuangan dan laporan aset yang dapat diakses secara terbuka.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A000] mt-1.5 flex-shrink-0" />
                                        <div>
                                            <strong className="text-gray-800 block">Profesional</strong>
                                            Melayani civitas akademika dengan standar kompetensi tinggi dan keilmuan yang mumpuni.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2: Layanan Cepat */}
                            <div className="bg-gradient-to-br from-[#1B5E20] to-[#0D3C10] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 relative z-10">
                                    <Landmark size={20} className="text-[#C8A000]" />
                                    Butuh Bantuan Keuangan?
                                </h3>
                                <p className="text-sm text-white/80 mb-5 relative z-10">
                                    BKA menyediakan kanal layanan administrasi pembayaran perkuliahan dan bantuan keuangan untuk seluruh civitas akademika UMRI.
                                </p>
                                <a 
                                    href="/kontak" 
                                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-white text-[#1B5E20] font-semibold text-sm shadow hover:bg-gray-100 transition-colors duration-150 relative z-10"
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
