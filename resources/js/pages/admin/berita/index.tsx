import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Newspaper,
    Search,
    Plus,
    Trash2,
    Edit2,
    FolderOpen,
    Calendar,
    User,
    Eye,
    AlertCircle,
    X,
    HelpCircle,
} from 'lucide-react';
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

const DEFAULT_CATEGORIES = [
    'Kegiatan',
    'Layanan',
    'Mitra',
    'Prestasi',
    'Aturan',
];

const INITIAL_NEWS: NewsItem[] = [
    {
        id: 1,
        slug: 'bka-luncurkan-sistem-keuangan-baru-2026',
        thumbnail:
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
        category: 'Layanan',
        title: 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
        excerpt:
            'Mulai semester ganjil ini, seluruh layanan administrasi keuangan dan pembayaran kuliah diintegrasikan dalam satu sistem online untuk mempermudah civitas akademika.',
        content:
            '<p>Universitas Muhammadiyah Riau (UMRI) melalui Biro Keuangan dan Aset (BKA) secara resmi meluncurkan Portal Keuangan Terintegrasi. Inovasi ini ditujukan khusus untuk mempermudah proses administrasi keuangan dan pembayaran biaya kuliah bagi seluruh mahasiswa aktif.</p>',
        date: '2026-05-20',
        author: 'Admin BKA',
        status: 'terpublikasi',
    },
    {
        id: 2,
        slug: 'workshop-pengelolaan-aset-muhammadiyah',
        thumbnail:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
        category: 'Kegiatan',
        title: 'Workshop Sinergi & Optimalisasi Aset Kampus bersama Wilayah Muhammadiyah',
        excerpt:
            'Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.',
        content:
            '<p>Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.</p>',
        date: '2026-05-15',
        author: 'Humas UMRI',
        status: 'terpublikasi',
    },
    {
        id: 3,
        slug: 'sosialisasi-pembayaran-mitra-perbankan',
        thumbnail:
            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
        category: 'Mitra',
        title: 'Perluas Akses, UMRI Jalin Kerja Kerja Sama dengan 4 Bank Rekanan Baru',
        excerpt:
            'Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.',
        content:
            '<p>Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.</p>',
        date: '2026-05-10',
        author: 'Bagian Keuangan',
        status: 'terpublikasi',
    },
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
            localStorage.setItem(
                'bka_categories',
                JSON.stringify(DEFAULT_CATEGORIES),
            );
        }
    }, []);

    // Filter Logic
    const filteredNews = news.filter((item) => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            filterCategory === 'Semua' || item.category === filterCategory;
        const matchesStatus =
            filterStatus === 'Semua' || item.status === filterStatus;
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

        if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
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
        const updatedCategories = categories.filter((c) => c !== catToDelete);
        setCategories(updatedCategories);
        localStorage.setItem(
            'bka_categories',
            JSON.stringify(updatedCategories),
        );

        // Orphan updates: Set news belonging to this category to Uncategorized (Tanpa Kategori)
        const updatedNews = news.map((item) =>
            item.category === catToDelete
                ? { ...item, category: 'Tanpa Kategori' }
                : item,
        );
        setNews(updatedNews);
        localStorage.setItem('bka_berita', JSON.stringify(updatedNews));

        toast.success(
            `Kategori "${catToDelete}" dihapus. Berita terkait dialihkan ke "Tanpa Kategori".`,
        );
    };

    // Handle delete news
    const confirmDeleteNews = () => {
        if (deletingNewsId === null) return;
        const targetNews = news.find((n) => n.id === deletingNewsId);
        const updated = news.filter((n) => n.id !== deletingNewsId);
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
                            Publikasikan pengumuman berita, liputan acara, dan
                            update informasi layanan Biro Keuangan & Aset UMRI.
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
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                        >
                            <Plus className="size-4" />
                            Tambah Berita
                        </Link>
                    </div>
                </div>

                {/* CSS Grid layout for perfect side-by-side management */}
                <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[28%_1fr]">
                    {/* Left Column: Filter Sidebar & Quick Actions */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <div className="border-b border-neutral-200 pb-3">
                            <h2 className="text-sm font-extrabold tracking-wider text-emerald-950 uppercase">
                                Filter Pencarian
                            </h2>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-neutral-600 uppercase">
                                Kata Kunci Judul
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari judul berita..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-10 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-neutral-600 uppercase">
                                Pilih Kategori
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="Semua">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                                <option value="Tanpa Kategori">
                                    Tanpa Kategori
                                </option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-wide text-neutral-600 uppercase">
                                Pilih Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-semibold text-neutral-800 transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="terpublikasi">
                                    Terpublikasi
                                </option>
                                <option value="draf">Draf</option>
                                <option value="diarsipkan">Diarsipkan</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery ||
                            filterCategory !== 'Semua' ||
                            filterStatus !== 'Semua') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('Semua');
                                    setFilterStatus('Semua');
                                }}
                                className="w-full rounded-xl border border-dashed border-red-200 bg-red-50/50 py-2 text-center text-xs font-bold text-red-600 hover:text-red-700"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>

                    {/* Right Column: Main News Table */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                            <th className="w-24 py-3 pl-3">
                                                Thumbnail
                                            </th>
                                            <th className="px-3 py-3">
                                                Judul Berita
                                            </th>
                                            <th className="w-32 px-3 py-3">
                                                Kategori
                                            </th>
                                            <th className="w-28 px-3 py-3">
                                                Status
                                            </th>
                                            <th className="w-24 py-3 pr-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-sm text-neutral-800">
                                        {currentItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="group hover:bg-neutral-50/40"
                                            >
                                                {/* Thumbnail */}
                                                <td className="py-3 pl-3">
                                                    <div className="aspect-video w-20 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                                                        <img
                                                            src={item.thumbnail}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                {/* Title */}
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                                        <span className="line-clamp-2 leading-snug font-bold text-neutral-900 transition-colors group-hover:text-emerald-800">
                                                            {item.title}
                                                        </span>
                                                        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {item.date}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="size-3" />
                                                                {item.author ||
                                                                    'Admin'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Category Badge */}
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            item.category ===
                                                            'Tanpa Kategori'
                                                                ? 'bg-neutral-100 text-neutral-600'
                                                                : 'border border-emerald-100 bg-emerald-50 text-emerald-800'
                                                        }`}
                                                    >
                                                        {item.category ||
                                                            'Tanpa Kategori'}
                                                    </span>
                                                </td>
                                                {/* Status Badge */}
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                                                            item.status ===
                                                            'terpublikasi'
                                                                ? 'border border-green-200 bg-green-50 text-green-700'
                                                                : item.status ===
                                                                    'draf'
                                                                  ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                                                  : 'border border-amber-200 bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`size-1.5 rounded-full ${
                                                                item.status ===
                                                                'terpublikasi'
                                                                    ? 'bg-green-600'
                                                                    : item.status ===
                                                                        'draf'
                                                                      ? 'bg-blue-600'
                                                                      : 'bg-amber-600'
                                                            }`}
                                                        />
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
                                                            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                                                            title="Pratinjau Publik"
                                                        >
                                                            <Eye className="size-4" />
                                                        </a>
                                                        <Link
                                                            href={`/admin/berita/${item.id}/edit`}
                                                            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
                                                            title="Edit Berita"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeletingNewsId(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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
                                                <td
                                                    colSpan={5}
                                                    className="py-16 text-center text-neutral-400"
                                                >
                                                    <Newspaper className="mx-auto mb-2 size-12 animate-pulse opacity-35" />
                                                    <p className="text-sm font-semibold">
                                                        Tidak ada berita yang
                                                        cocok dengan filter
                                                        filter saat ini.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setFilterCategory(
                                                                'Semua',
                                                            );
                                                            setFilterStatus(
                                                                'Semua',
                                                            );
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
                                    <span className="text-xs font-semibold text-neutral-500">
                                        Menampilkan {indexOfFirstItem + 1}–
                                        {Math.min(
                                            indexOfLastItem,
                                            filteredNews.length,
                                        )}{' '}
                                        dari {filteredNews.length} berita
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage(
                                                    (prev) => prev - 1,
                                                )
                                            }
                                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                                        >
                                            Sebelumnya
                                        </button>
                                        {[...Array(totalPages)].map(
                                            (_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage(idx + 1)
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                                        currentPage === idx + 1
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ),
                                        )}
                                        <button
                                            type="button"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    (prev) => prev + 1,
                                                )
                                            }
                                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
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
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div className="relative w-full max-w-md animate-in rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                        {/* Close button */}
                        <button
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            <X className="size-5" />
                        </button>

                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-800">
                            <FolderOpen className="size-5 text-emerald-600" />
                            Kelola Kategori Berita
                        </h3>

                        {/* Add category form */}
                        <form
                            onSubmit={handleAddCategory}
                            className="mb-6 flex gap-2"
                        >
                            <input
                                type="text"
                                maxLength={50}
                                placeholder="Tulis kategori baru..."
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-800 transition-all outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                                Tambah
                            </button>
                        </form>

                        {/* List of current categories with delete button */}
                        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                            <label className="block text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                Kategori Terdaftar
                            </label>
                            {categories.map((cat) => (
                                <div
                                    key={cat}
                                    className="flex items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50 px-3.5 py-2"
                                >
                                    <span className="text-sm font-semibold text-neutral-800">
                                        {cat}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteCategory(cat)
                                        }
                                        className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                                        title="Hapus Kategori"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <div className="py-6 text-center text-xs text-neutral-400">
                                    Belum ada kategori kustom.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end border-t border-neutral-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm dialog box for news deletion */}
            {deletingNewsId !== null && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
                    <div className="w-full max-w-md animate-in rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-150 zoom-in-95">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertCircle className="size-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-neutral-900">
                            Hapus Artikel Berita?
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                            Apakah Anda yakin ingin menghapus artikel berita "
                            <strong>
                                {
                                    news.find((n) => n.id === deletingNewsId)
                                        ?.title
                                }
                            </strong>
                            "? Tindakan ini akan menghapus artikel secara
                            permanen dari server lokal.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingNewsId(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteNews}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all outline-none hover:bg-red-700"
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
