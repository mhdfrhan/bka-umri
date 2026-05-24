import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Download, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

// ─── Dummy Data ───
const dummyAnnouncement = {
    slug: 'jadwal-registrasi-keuangan-semester-ganjil-2026',
    title: 'Jadwal & Prosedur Registrasi Keuangan Semester Ganjil TA 2026/2027',
    date: '22 Mei 2026',
    isPenting: true,
    content: `
        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
        <p>Sehubungan dengan akan dimulainya perkuliahan Semester Ganjil Tahun Akademik 2026/2027, bersama ini kami sampaikan jadwal dan prosedur registrasi pembayaran biaya pendidikan bagi seluruh mahasiswa aktif Universitas Muhammadiyah Riau (UMRI).</p>
        
        <h3>Jadwal Pembayaran</h3>
        <p>Masa pembayaran SPP dan uang pembangunan ditetapkan sebagai berikut:</p>
        <ul>
            <li><strong>Mulai:</strong> 1 Juni 2026, pukul 08.00 WIB</li>
            <li><strong>Berakhir:</strong> 30 Juli 2026, pukul 23.59 WIB</li>
        </ul>
        <p>Mahasiswa yang tidak melakukan pembayaran hingga batas waktu yang ditentukan <strong>tidak diperkenankan untuk mengisi Kartu Rencana Studi (KRS)</strong> dan secara otomatis akan dianggap cuti akademik oleh sistem.</p>
        
        <h3>Prosedur Pembayaran (Virtual Account)</h3>
        <p>Pembayaran wajib dilakukan melalui sistem Virtual Account (VA) untuk memastikan status pembayaran Anda terkonfirmasi secara real-time. Langkah-langkahnya adalah sebagai berikut:</p>
        <ol>
            <li>Login ke Portal Mahasiswa SIKAD UMRI.</li>
            <li>Pilih menu <strong>Keuangan &gt; Tagihan Saya</strong>.</li>
            <li>Pilih bank tujuan (Bank Syariah Indonesia, Bank Riau Kepri Syariah, atau Bank Muamalat).</li>
            <li>Klik tombol <strong>Generate Virtual Account</strong>.</li>
            <li>Lakukan pembayaran melalui ATM, M-Banking, atau Teller sesuai dengan petunjuk yang tertera.</li>
        </ol>
        
        <p>Dimohon kepada seluruh mahasiswa agar menyimpan bukti transaksi yang sah jika sewaktu-waktu diperlukan untuk proses verifikasi manual (apabila terjadi gangguan koneksi jaringan bank).</p>
        
        <p>Demikian pengumuman ini kami sampaikan agar dapat menjadi perhatian bagi seluruh mahasiswa UMRI. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
        <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
    `,
    attachments: [
        {
            name: 'Surat_Edaran_Registrasi_Ganjil_2026.pdf',
            size: '245 KB',
            url: '#'
        },
        {
            name: 'Panduan_Pembayaran_VA.pdf',
            size: '1.2 MB',
            url: '#'
        }
    ]
};

export default function PengumumanShow() {
    const articleRef = useScrollReveal<HTMLDivElement>();
    const item = dummyAnnouncement;

    return (
        <>
            <Head title={`${item.title} - BKA UMRI`}>
                <meta name="description" content="Detail pengumuman resmi dari Biro Keuangan dan Aset Universitas Muhammadiyah Riau." />
            </Head>

            {/* Header */}
            <section className="bg-white pt-24 pb-10 md:pt-32 md:pb-14">
                <div className="bka-container">
                    <div className="mx-auto max-w-[800px] text-center">
                        {item.isPenting && (
                            <div className="mb-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAE5] px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E53935]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E53935] opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E53935]"></span>
                                    </span>
                                    Penting
                                </span>
                            </div>
                        )}
                        
                        <h1 
                            className="mb-6 font-bold leading-[1.3] text-[#1A1A1A]"
                            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}
                        >
                            {item.title}
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#5C6B73]">
                            <Calendar size={16} />
                            <span>Dipublikasikan pada {item.date}</span>
                        </div>
                        <span className="bka-gold-line bka-gold-line-center mt-8" />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="bg-white pb-16 md:pb-24">
                <div className="bka-container">
                    <div ref={articleRef} className="bka-reveal mx-auto max-w-[760px]">
                        
                        {/* Prose Content */}
                        <div 
                            className="prose prose-lg prose-[#5C6B73] max-w-none prose-headings:text-[#1A1A1A] prose-headings:font-bold prose-h3:text-xl prose-a:text-[#1B5E20] prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#C8A000]"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />

                        {/* Attachments */}
                        {item.attachments && item.attachments.length > 0 && (
                            <div className="mt-12 rounded-2xl border border-[#DDE5DD] bg-[#F7F9F7] p-6 md:p-8">
                                <h3 className="mb-4 text-lg font-bold text-[#1A1A1A]">Lampiran Dokumen</h3>
                                <div className="flex flex-col gap-3">
                                    {item.attachments.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.url}
                                            className="group flex items-center justify-between rounded-xl border border-transparent bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#1B5E20] hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#1B5E20]">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B5E20]">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-[#9EAAB2]">
                                                        Ukuran: {file.size}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F9F7] text-[#1B5E20] transition-colors group-hover:bg-[#1B5E20] group-hover:text-white">
                                                <Download size={16} />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share & Back Area */}
                        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-[#DDE5DD] pt-8 md:flex-row">
                            <Link
                                href="/pengumuman"
                                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5C6B73] no-underline transition-all duration-200 hover:gap-3 hover:text-[#1B5E20]"
                            >
                                <ArrowLeft
                                    size={16}
                                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                                Kembali ke Daftar Pengumuman
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
