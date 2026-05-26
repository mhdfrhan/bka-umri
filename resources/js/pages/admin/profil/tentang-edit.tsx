import { Head, Link, useForm } from '@inertiajs/react';
import { Info, Save, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

const DEFAULT_ABOUT_CONTENT = `
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

interface Halaman {
    id: number;
    slug: string;
    judul: string;
    konten: string | null;
}

interface Props {
    halaman: Halaman;
}

export default function EditTentang({ halaman }: Props) {
    const { data, setData, put, processing } = useForm({
        konten: halaman.konten || DEFAULT_ABOUT_CONTENT.trim(),
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        put('/admin/profil/tentang', {
            onSuccess: () => {
                toast.success('Profil Tentang BKA berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal menyimpan perubahan.');
            },
        });
    };

    return (
        <>
            <Head title="Edit Tentang Kami - BKA UMRI" />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Info className="size-6 text-emerald-600" />
                            Kelola Halaman: Tentang Kami
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Tulis profil singkat, sejarah pendirian, nilai-nilai
                            utama, dan tupoksi resmi BKA UMRI yang tampil di
                            website publik.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/profil/tentang-kami"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950"
                        >
                            <ExternalLink className="size-4" />
                            Lihat Halaman
                        </a>
                    </div>
                </div>

                {/* Form Editor Card */}
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-amber-800">
                            <FileText className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <div className="text-sm leading-relaxed">
                                <span className="font-bold">
                                    Panduan Konten:
                                </span>{' '}
                                Gunakan pemformatan heading (H2, H3), list
                                (unordered/ordered list), kutipan blok
                                (blockquote), serta tautan (links) untuk
                                menyusun tata letak profil yang profesional dan
                                terstruktur. Gunakan tombol simpan di bawah
                                setelah selesai mengedit.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold tracking-wide text-neutral-700">
                                Editor Konten Profil
                            </label>
                            <RichTextEditor
                                value={data.konten}
                                onChange={(val) => setData('konten', val)}
                                className="border-neutral-200 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="size-4.5" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

// Assign static breadcrumbs for automatic navigation topbar
EditTentang.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Profil Organisasi',
            href: '#',
        },
        {
            title: 'Tentang Kami',
            href: '/admin/profil/tentang',
        },
    ],
};
