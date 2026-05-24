import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Facebook, Linkedin, Twitter, User } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

// ─── Dummy Data ───
const dummyArticle = {
    slug: 'bka-luncurkan-sistem-keuangan-baru-2026',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    category: 'Layanan',
    title: 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
    date: '20 Mei 2026',
    author: 'Admin BKA',
    content: `
        <p>Universitas Muhammadiyah Riau (UMRI) melalui Biro Keuangan dan Aset (BKA) secara resmi meluncurkan Portal Keuangan Terintegrasi. Inovasi ini ditujukan khusus untuk mempermudah proses administrasi keuangan dan pembayaran biaya kuliah bagi seluruh mahasiswa aktif.</p>
        
        <p>Dalam acara sosialisasi yang diselenggarakan secara hybrid di Aula Utama UMRI, Kepala BKA menyampaikan bahwa digitalisasi layanan administrasi adalah keniscayaan di era modern. "Kami memahami bahwa efisiensi waktu sangat berharga bagi civitas akademika. Dengan sistem baru ini, mahasiswa tidak perlu lagi mengantre panjang di loket pembayaran," ujarnya.</p>
        
        <h3>Fitur Utama Portal Terintegrasi</h3>
        <p>Sistem ini dirancang dengan antarmuka yang ramah pengguna (user-friendly) dan dilengkapi dengan beberapa fitur unggulan, antara lain:</p>
        <ul>
            <li><strong>Pembayaran Real-Time:</strong> Status pembayaran akan langsung diperbarui dalam sistem segera setelah transaksi berhasil melalui bank mitra (BSI, Bank Muamalat, Bank Riau Kepri Syariah).</li>
            <li><strong>Riwayat Tagihan Transparan:</strong> Mahasiswa dapat mengunduh invoice digital dan melihat rincian riwayat pembayaran dari semester pertama hingga saat ini.</li>
            <li><strong>Pengajuan Dispensasi Online:</strong> Proses pengajuan keringanan biaya kuliah kini dapat dilakukan dengan mengunggah berkas persyaratan langsung melalui portal tanpa perlu membawa dokumen fisik.</li>
        </ul>
        
        <blockquote>
            "Transformasi digital bukan sekadar mengubah dokumen fisik menjadi elektronik, tetapi mengubah paradigma pelayanan birokrasi menjadi lebih transparan, cepat, dan akuntabel."
        </blockquote>
        
        <p>Tim IT UMRI memastikan bahwa portal ini telah dilengkapi dengan sistem keamanan enkripsi terkini untuk melindungi data pribadi dan riwayat transaksi mahasiswa. Sistem ini akan mulai diimplementasikan secara penuh pada masa registrasi semester ganjil tahun akademik 2026/2027.</p>
        
        <p>Bagi mahasiswa yang mengalami kendala teknis saat mengakses portal, BKA telah menyediakan layanan *helpdesk* terpadu yang dapat dihubungi melalui email resmi maupun *hotline* WhatsApp yang beroperasi pada jam kerja.</p>
    `
};

export default function BeritaShow() {
    const articleRef = useScrollReveal<HTMLDivElement>();
    const article = dummyArticle;

    return (
        <>
            <Head title={`${article.title} - BKA UMRI`}>
                <meta name="description" content="Detail berita Biro Keuangan dan Aset Universitas Muhammadiyah Riau." />
            </Head>

            {/* Article Header / Hero */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={article.thumbnail} 
                        alt="" 
                        aria-hidden="true" 
                        className="h-full w-full object-cover"
                    />
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(13, 59, 17, 0.85) 0%, rgba(10, 40, 14, 0.95) 100%)'
                        }}
                    />
                </div>

                <div className="bka-container relative z-10">
                    <div className="mx-auto max-w-[800px] text-center">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block rounded-full bg-[#C8A000] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] shadow-md">
                                {article.category}
                            </span>
                        </div>
                        
                        {/* Title */}
                        <h1 
                            className="mb-8 font-bold leading-tight text-white"
                            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                        >
                            {article.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-[14px] font-medium text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-[#C8A000]" />
                                <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-[#C8A000]" />
                                <span>{article.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="bg-white py-12 md:py-20">
                <div className="bka-container">
                    <div ref={articleRef} className="bka-reveal mx-auto max-w-[760px]">
                        
                        {/* Prose Content */}
                        <div 
                            className="prose prose-lg prose-[#5C6B73] max-w-none prose-headings:text-[#1A1A1A] prose-headings:font-bold prose-h3:text-2xl prose-a:text-[#1B5E20] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-l-[#C8A000] prose-blockquote:bg-[#F7F9F7] prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:text-[#1B5E20]"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Share & Back Area */}
                        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#DDE5DD] pt-8 md:flex-row">
                            <Link
                                href="/berita"
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B73] no-underline transition-all duration-200 hover:gap-3 hover:text-[#1B5E20]"
                            >
                                <ArrowLeft
                                    size={16}
                                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                                Kembali ke Daftar Berita
                            </Link>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-[#1A1A1A]">Bagikan:</span>
                                <div className="flex items-center gap-2">
                                    <button aria-label="Share on Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white">
                                        <Facebook size={16} />
                                    </button>
                                    <button aria-label="Share on Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white">
                                        <Twitter size={16} />
                                    </button>
                                    <button aria-label="Share on LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9F7] text-[#5C6B73] transition-colors hover:bg-[#1B5E20] hover:text-white">
                                        <Linkedin size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}
