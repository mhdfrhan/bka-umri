import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Newspaper, Search, Plus, Trash2, Edit2, FolderOpen, Calendar, User, Eye, AlertCircle, X, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
    id: number;
    slug: string;
    thumbnail: string;
    category?: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author?: string;
    status: 'draf' | 'terpublikasi' | 'diarsipkan';
}

const DEFAULT_CATEGORIES = ['Kegiatan', 'Layanan', 'Mitra', 'Prestasi', 'Aturan'];

const INITIAL_NEWS: NewsItem[] = [
    {
        id: 1,
        slug: 'bka-luncurkan-sistem-keuangan-baru-2026',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        category: 'Layanan',
        title: 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
        excerpt: 'Mulai semester ganjil ini, seluruh layanan administrasi keuangan dan pembayaran kuliah diintegrasikan dalam satu sistem online untuk mempermudah civitas akademika.',
        content: '<p>Universitas Muhammadiyah Riau (UMRI) melalui Biro Keuangan dan Aset (BKA) secara resmi meluncurkan Portal Keuangan Terintegrasi. Inovasi ini ditujukan khusus untuk mempermudah proses administrasi keuangan dan pembayaran biaya kuliah bagi seluruh mahasiswa aktif.</p>',
        date: '2026-05-20',
        author: 'Admin BKA',
        status: 'terpublikasi'
    },
    {
        id: 2,
        slug: 'workshop-pengelolaan-aset-muhammadiyah',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        category: 'Kegiatan',
        title: 'Workshop Sinergi & Optimalisasi Aset Kampus bersama Wilayah Muhammadiyah',
        excerpt: 'Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.',
        content: '<p>Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.</p>',
        date: '2026-05-15',
        author: 'Humas UMRI',
        status: 'terpublikasi'
    },
    {
        id: 3,
        slug: 'sosialisasi-pembayaran-mitra-perbankan',
        thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
        category: 'Mitra',
        title: 'Perluas Akses, UMRI Jalin Kerja Kerja Sama dengan 4 Bank Rekanan Baru',
        excerpt: 'Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.',
        content: '<p>Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.</p>',
        date: '2026-05-10',
        author: 'Bagian Keuangan',
        status: 'terpublikasi'
    }
];

export default function BeritaIndex() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Category CRUD inline
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    // Delete confirmation modal
    const [deletingNewsId, setDeletingNewsId] = useState<number | null>(null);

    // Load dynamic data from local storage
    useEffect(() => {
        const savedNews = localStorage.getItem('bka_berita');
        if (savedNews) {
            try {
                setNews(JSON.parse(savedNews));
            } catch (e) {
                setNews(INITIAL_NEWS);
            }
        } else {
            setNews(INITIAL_NEWS);
            localStorage.setItem('bka_berita', JSON.stringify(INITIAL_NEWS));
        }

        const savedCategories = localStorage.getItem('bka_categories');
        if (savedCategories) {
            try {
                setCategories(JSON.parse(savedCategories));
            } catch (e) {
                setCategories(DEFAULT_CATEGORIES);
            }
        } else {
            setCategories(DEFAULT_CATEGORIES);
            localStorage.setItem('bka_categories', JSON.stringify(DEFAULT_CATEGORIES));
        }
    }, []);

    // Filter Logic
    const filteredNews = news.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'Semua' || item.category === filterCategory;
        const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

    // Handle add category
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('Kategori tersebut sudah terdaftar!');
            return;
        }

        const updated = [...categories, trimmed];
        setCategories(updated);
        localStorage.setItem('bka_categories', JSON.stringify(updated));
        setNewCategoryName('');
        toast.success(`Kategori "${trimmed}" berhasil ditambahkan!`);
    };

    // Handle delete category with orphan handler
    const handleDeleteCategory = (catToDelete: string) => {
        const updatedCategories = categories.filter(c => c !== catToDelete);
        setCategories(updatedCategories);
        localStorage.setItem('bka_categories', JSON.stringify(updatedCategories));

        // Orphan updates: Set news belonging to this category to Uncategorized (Tanpa Kategori)
        const updatedNews = news.map(item => 
            item.category === catToDelete ? { ...item, category: 'Tanpa Kategori' } : item
        );
        setNews(updatedNews);
        localStorage.setItem('bka_berita', JSON.stringify(updatedNews));

        toast.success(`Kategori "${catToDelete}" dihapus. Berita terkait dialihkan ke "Tanpa Kategori".`);
    };

    // Handle delete news
    const confirmDeleteNews = () => {
        if (deletingNewsId === null) return;
        const targetNews = news.find(n => n.id === deletingNewsId);
        const updated = news.filter(n => n.id !== deletingNewsId);
        setNews(updated);
        localStorage.setItem('bka_berita', JSON.stringify(updated));
        setDeletingNewsId(null);
        toast.success(`Berita "${targetNews?.title}" berhasil dihapus.`);
    };

    return (
        <>
            <Head title="Kelola Berita - Admin BKA" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Newspaper className="size-6 text-emerald-600" />
                            Manajemen Berita & Kegiatan
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Publikasikan pengumuman berita, liputan acara, dan update informasi layanan Biro Keuangan & Aset UMRI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50"
                        >
                            <FolderOpen className="size-4 text-neutral-500" />
                            Kelola Kategori
                        </button>
                        <Link
                            href="/admin/berita/create"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
                        >
                            <Plus className="size-4" />
                            Tambah Berita
                        </Link>
                    </div>
                </div>

                {/* CSS Grid layout for perfect side-by-side management */}
                <div className="grid w-full grid-cols-1 gap-8 items-start lg:grid-cols-[28%_1fr]">
                    
                    {/* Left Column: Filter Sidebar & Quick Actions */}
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
                                    placeholder="Cari judul berita..."
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

                        {/* Category Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Pilih Kategori</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="Semua">Semua Kategori</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="Tanpa Kategori">Tanpa Kategori</option>
                            </select>
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

                        {/* Clear Filters */}
                        {(searchQuery || filterCategory !== 'Semua' || filterStatus !== 'Semua') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('Semua');
                                    setFilterStatus('Semua');
                                }}
                                className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 py-2 border border-dashed border-red-200 rounded-xl bg-red-50/50"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>

                    {/* Right Column: Main News Table */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                            <th className="py-3 pl-3 w-24">Thumbnail</th>
                                            <th className="py-3 px-3">Judul Berita</th>
                                            <th className="py-3 px-3 w-32">Kategori</th>
                                            <th className="py-3 px-3 w-28">Status</th>
                                            <th className="py-3 pr-3 w-24 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {currentItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/40 group">
                                                {/* Thumbnail */}
                                                <td className="py-3 pl-3">
                                                    <div className="aspect-video w-20 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                                                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                {/* Title */}
                                                <td className="py-3 px-3">
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
                                                {/* Category Badge */}
                                                <td className="py-3 px-3">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        item.category === 'Tanpa Kategori' 
                                                            ? 'bg-neutral-100 text-neutral-600'
                                                            : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                                    }`}>
                                                        {item.category || 'Tanpa Kategori'}
                                                    </span>
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
                                                            href={`/berita/${item.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
                                                            title="Pratinjau Publik"
                                                        >
                                                            <Eye className="size-4" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/berita/${item.id}/edit`}
                                                            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                                                            title="Edit Berita"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingNewsId(item.id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                                            title="Hapus Berita"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredNews.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-16 text-center text-neutral-400">
                                                    <Newspaper className="mx-auto mb-2 size-12 opacity-35 animate-pulse" />
                                                    <p className="text-sm font-semibold">Tidak ada berita yang cocok dengan filter filter saat ini.</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setFilterCategory('Semua');
                                                            setFilterStatus('Semua');
                                                        }}
                                                        className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                                    >
                                                        Reset Filter
                                                    </button>
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
                                        Menampilkan {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredNews.length)} dari {filteredNews.length} berita
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

            {/* Modal Box: Inline Category Manager */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-neutral-200 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        >
                            <X className="size-5" />
                        </button>

                        <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                            <FolderOpen className="size-5 text-emerald-600" />
                            Kelola Kategori Berita
                        </h3>

                        {/* Add category form */}
                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                maxLength={50}
                                placeholder="Tulis kategori baru..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                            >
                                Tambah
                            </button>
                        </form>

                        {/* List of current categories with delete button */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Kategori Terdaftar</label>
                            {categories.map((cat) => (
                                <div key={cat} className="flex items-center justify-between bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200/50">
                                    <span className="text-sm font-semibold text-neutral-800">{cat}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                                        title="Hapus Kategori"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <div className="text-center py-6 text-neutral-400 text-xs">
                                    Belum ada kategori kustom.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm dialog box for news deletion */}
            {deletingNewsId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center border border-neutral-200 animate-in zoom-in-95 duration-150">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertCircle className="size-6" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Hapus Artikel Berita?</h3>
                        <p className="text-sm leading-relaxed text-neutral-500 mb-6">
                            Apakah Anda yakin ingin menghapus artikel berita "<strong>{news.find(n => n.id === deletingNewsId)?.title}</strong>"? Tindakan ini akan menghapus artikel secara permanen dari server lokal.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingNewsId(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteNews}
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

BeritaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Kelola Berita',
            href: '/admin/berita',
        },
    ],
};
