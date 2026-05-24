import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Megaphone, Search, Plus, Trash2, Edit2, Calendar, User, Eye, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

interface AnnouncementItem {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author?: string;
    status: 'draf' | 'terpublikasi' | 'diarsipkan';
    isPenting: boolean;
    thumbnail?: string;
    attachments?: Array<{ name: string; url: string; size: number; extension: string }>;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
    {
        id: 1,
        slug: 'jadwal-registrasi-keuangan-semester-ganjil-2026',
        title: 'Jadwal & Prosedur Registrasi Keuangan Semester Ganjil TA 2026/2027',
        excerpt: 'Diberitahukan kepada seluruh mahasiswa Universitas Muhammadiyah Riau bahwa registrasi keuangan semester ganjil dimulai tanggal 1 Juni s.d. 30 Juli 2026.',
        content: '<p>Diberitahukan kepada seluruh mahasiswa Universitas Muhammadiyah Riau bahwa registrasi keuangan semester ganjil dimulai tanggal 1 Juni s.d. 30 Juli 2026. Pembayaran dapat diangsur sesuai dengan ketentuan administrasi BKA.</p>',
        date: '2026-05-22',
        author: 'Admin BKA',
        status: 'terpublikasi',
        isPenting: true
    },
    {
        id: 2,
        slug: 'panduan-pembayaran-va-mahasiswa',
        title: 'Panduan Pembayaran Uang Kuliah Melalui Virtual Account (VA) Bank Mitra',
        excerpt: 'Simak tata cara lengkap pembayaran SPP via m-banking dan ATM untuk Bank Syariah Indonesia (BSI), Bank Muamalat, Bank Bukopin, dan Bank Riau Kepri.',
        content: '<p>Simak tata cara lengkap pembayaran SPP via m-banking dan ATM untuk Bank Syariah Indonesia (BSI), Bank Muamalat, Bank Bukopin, dan Bank Riau Kepri.</p>',
        date: '2026-05-18',
        author: 'Bagian Keuangan',
        status: 'terpublikasi',
        isPenting: false
    },
    {
        id: 3,
        slug: 'kebijakan-keringanan-biaya-kuliah-2026',
        title: 'Pengajuan Dispensasi dan Keringanan Pembayaran SPP Mahasiswa Aktif',
        excerpt: 'BKA membuka pendaftaran berkas dispensasi keringanan pembayaran kuliah hingga 15 Juni 2026 bagi mahasiswa yang memenuhi kriteria berkas pendukung.',
        content: '<p>BKA membuka pendaftaran berkas dispensasi keringanan pembayaran kuliah hingga 15 Juni 2026 bagi mahasiswa yang memenuhi kriteria berkas pendukung.</p>',
        date: '2026-05-12',
        author: 'Admin BKA',
        status: 'terpublikasi',
        isPenting: true
    }
];

export default function PengumumanIndex() {
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterPenting, setFilterPenting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete Modal
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('bka_pengumuman');
        if (saved) {
            try {
                setAnnouncements(JSON.parse(saved));
            } catch {
                setAnnouncements(INITIAL_ANNOUNCEMENTS);
            }
        } else {
            setAnnouncements(INITIAL_ANNOUNCEMENTS);
            localStorage.setItem('bka_pengumuman', JSON.stringify(INITIAL_ANNOUNCEMENTS));
        }
    }, []);

    const saveAnnouncements = (updatedList: AnnouncementItem[]) => {
        setAnnouncements(updatedList);
        localStorage.setItem('bka_pengumuman', JSON.stringify(updatedList));
    };

    // Confirm Delete
    const handleConfirmDelete = () => {
        if (deletingId === null) return;
        const target = announcements.find(a => a.id === deletingId);
        const updated = announcements.filter(a => a.id !== deletingId);
        saveAnnouncements(updated);
        setDeletingId(null);
        toast.success(`Pengumuman "${target?.title}" berhasil dihapus.`);
    };

    // Filter Logic
    const filtered = announcements.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
        const matchesPenting = !filterPenting || item.isPenting;
        return matchesSearch && matchesStatus && matchesPenting;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <>
            <Head title="Kelola Pengumuman - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Megaphone className="size-6 text-emerald-600" />
                            Manajemen Pengumuman BKA
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Terbitkan pengumuman penting, jadwal registrasi, dispensasi keuangan, beserta berkas lampirannya.
                        </p>
                    </div>

                    <Link
                        href="/admin/pengumuman/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all outline-none"
                    >
                        <Plus className="size-4" />
                        Tambah Pengumuman
                    </Link>
                </div>

                {/* Filter and search bar */}
                <div className="grid w-full grid-cols-1 gap-6 items-start lg:grid-cols-[28%_1fr]">
                    
                    {/* Left Filter Column */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <div className="border-b border-neutral-200 pb-3">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950">Filter Pencarian</h2>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Kata Kunci Judul</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari pengumuman..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Pilih Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="terpublikasi">Terpublikasi</option>
                                <option value="draf">Draf</option>
                                <option value="diarsipkan">Diarsipkan</option>
                            </select>
                        </div>

                        {/* Hanya Penting Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none pt-2">
                            <input
                                type="checkbox"
                                checked={filterPenting}
                                onChange={(e) => {
                                    setFilterPenting(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 size-4 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-700">Hanya Pengumuman Penting</span>
                                <span className="text-[10px] text-neutral-400 leading-tight">Menampilkan pengumuman bertanda bintang penting.</span>
                            </div>
                        </label>

                        {/* Reset Filters */}
                        {(searchQuery || filterStatus !== 'Semua' || filterPenting) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterStatus('Semua');
                                    setFilterPenting(false);
                                }}
                                className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 py-2 border border-dashed border-red-200 rounded-xl bg-red-50/50"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    {/* Right Table Column */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                            <th className="py-3 pl-3">Judul Pengumuman</th>
                                            <th className="py-3 px-3 w-28 text-center">Tingkat</th>
                                            <th className="py-3 px-3 w-28">Status</th>
                                            <th className="py-3 pr-3 w-24 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {currentItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/40 group">
                                                {/* Title */}
                                                <td className="py-3 pl-3">
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                                                            {item.title}
                                                        </span>
                                                        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {item.date}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="size-3" />
                                                                {item.author || 'Admin'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Penting indicator */}
                                                <td className="py-3 px-3 text-center">
                                                    {item.isPenting ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                            <Star className="size-3 fill-amber-500 text-amber-500" />
                                                            Penting
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-neutral-400 font-medium">Biasa</span>
                                                    )}
                                                </td>
                                                {/* Status Badge */}
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                        item.status === 'terpublikasi' 
                                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                                            : item.status === 'draf'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        <span className={`size-1.5 rounded-full ${
                                                            item.status === 'terpublikasi' ? 'bg-green-600' : item.status === 'draf' ? 'bg-blue-600' : 'bg-amber-600'
                                                        }`} />
                                                        {item.status}
                                                    </span>
                                                </td>
                                                {/* Action buttons */}
                                                <td className="py-3 pr-3 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <a
                                                            href={`/pengumuman/${item.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
                                                            title="Pratinjau Publik"
                                                        >
                                                            <Eye className="size-4" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/pengumuman/${item.id}/edit`}
                                                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                                                            title="Edit Pengumuman"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingId(item.id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                                            title="Hapus Pengumuman"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-16 text-center text-neutral-400">
                                                    <Megaphone className="mx-auto mb-2 size-12 opacity-35 animate-pulse" />
                                                    <p className="text-sm font-semibold">Tidak ada pengumuman yang ditemukan.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
                                    <span className="text-xs text-neutral-500 font-semibold">
                                        Menampilkan {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filtered.length)} dari {filtered.length} pengumuman
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40"
                                        >
                                            Sebelumnya
                                        </button>
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setCurrentPage(idx + 1)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                                                    currentPage === idx + 1 
                                                        ? 'bg-emerald-600 text-white' 
                                                        : 'text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Confirm Dialog */}
            {deletingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center border border-neutral-200 animate-in zoom-in-95 duration-150">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertCircle className="size-6" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Hapus Pengumuman?</h3>
                        <p className="text-sm leading-relaxed text-neutral-500 mb-6">
                            Apakah Anda yakin ingin menghapus pengumuman "<strong>{announcements.find(a => a.id === deletingId)?.title}</strong>"? Tindakan ini bersifat permanen.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition-all outline-none"
                            >
                                Hapus Permanen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

PengumumanIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Pengumuman',
            href: '/admin/pengumuman',
        },
    ],
};
