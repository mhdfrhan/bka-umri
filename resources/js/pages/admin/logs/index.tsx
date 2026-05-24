import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Search,
    Trash2,
    Download,
    FileCode,
    RefreshCw,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ShieldAlert,
    PlusCircle,
    Edit2,
    UserPlus,
    Settings,
    Eye,
    Shield,
    X,
    Info,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeDate } from '@/lib/format-date';

interface ActivityLog {
    id: number;
    time: string; // ISO string
    user: string;
    role: string;
    action: string;
    target: string;
    type: 'create' | 'update' | 'delete' | 'system' | 'user';
}

const SEEDED_LOGS: ActivityLog[] = [
    {
        id: 1,
        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'Super Admin',
        action: 'Menerbitkan berita baru',
        target: 'BKA UMRI Luncurkan Portal Informasi Baru Terintegrasi',
        type: 'create',
    },
    {
        id: 2,
        time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        user: 'Admin BKA',
        role: 'Admin',
        action: 'Mengubah status pengumuman',
        target: 'Jadwal Pengisian KRS Semester Genap 2025/2026',
        type: 'update',
    },
    {
        id: 3,
        time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'Super Admin',
        action: 'Mengubah pengaturan sistem',
        target: 'Pemberlakuan SSL & Favicon Baru',
        type: 'system',
    },
    {
        id: 4,
        time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'Super Admin',
        action: 'Membuat akun pengguna',
        target: 'Lusi Lestari (Admin Bidang Keuangan)',
        type: 'user',
    },
    {
        id: 5,
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin BKA',
        role: 'Admin',
        action: 'Menghapus berkas lampiran kedaluwarsa',
        target: 'Panduan Penggunaan Portal Versi 1.0 (PDF)',
        type: 'delete',
    },
    {
        id: 6,
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'Super Admin',
        action: 'Mengubah struktur bidang baru',
        target: 'Bidang Kemahasiswaan & Hubungan Alumni',
        type: 'update',
    },
    {
        id: 7,
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin BKA',
        role: 'Admin',
        action: 'Mengunggah dokumentasi album baru',
        target: 'Pelantikan Rektor Universitas Muhammadiyah Riau Periode 2026-2030',
        type: 'create',
    },
    {
        id: 8,
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'Super Admin',
        action: 'Menonaktifkan akses administrator',
        target: 'Rudi Hermawan (Admin Bidang Humas)',
        type: 'user',
    }
];

export default function LogsIndex() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    // Modals state
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

    // Load logs on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bka_activity_logs');
            if (saved) {
                try {
                    setLogs(JSON.parse(saved));
                } catch {
                    setLogs(SEEDED_LOGS);
                    localStorage.setItem('bka_activity_logs', JSON.stringify(SEEDED_LOGS));
                }
            } else {
                setLogs(SEEDED_LOGS);
                localStorage.setItem('bka_activity_logs', JSON.stringify(SEEDED_LOGS));
            }
        }
    }, []);

    // Helper to persist logs back
    const saveLogs = (updatedLogs: ActivityLog[]) => {
        setLogs(updatedLogs);
        localStorage.setItem('bka_activity_logs', JSON.stringify(updatedLogs));
    };

    // Filter Logs
    const filteredLogs = logs.filter(log => {
        // Search query filter
        const matchesSearch = 
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.role.toLowerCase().includes(searchQuery.toLowerCase());

        // Type filter
        const matchesType = selectedType === 'all' || log.type === selectedType;

        // Date range filter
        let matchesDate = true;
        const logDate = new Date(log.time);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDateRange === 'today') {
            matchesDate = logDate >= today;
        } else if (selectedDateRange === '7days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            matchesDate = logDate >= sevenDaysAgo;
        } else if (selectedDateRange === '30days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchesDate = logDate >= thirtyDaysAgo;
        }

        return matchesSearch && matchesType && matchesDate;
    });

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedType, selectedDateRange]);

    // Paginated logs
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    // Stats calculations
    const totalCount = logs.length;
    const createCount = logs.filter(l => l.type === 'create').length;
    const updateCount = logs.filter(l => l.type === 'update').length;
    const deleteCount = logs.filter(l => l.type === 'delete').length;
    const systemUserCount = logs.filter(l => l.type === 'system' || l.type === 'user').length;

    // Erase all logs
    const handleClearLogs = () => {
        saveLogs([]);
        setClearConfirmOpen(false);
        toast.success('Seluruh log aktivitas sistem berhasil dikosongkan.');
    };

    // Seed mock logs
    const handleSeedLogs = () => {
        saveLogs(SEEDED_LOGS);
        toast.success('Berhasil memuat ulang data log contoh (Mock Logs).');
    };

    // CSV Exporter
    const exportCSV = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data log untuk diekspor.');
            return;
        }
        
        const headers = ['ID', 'Waktu (ISO)', 'Pengguna', 'Peran', 'Aksi', 'Target', 'Tipe'];
        const csvRows = [
            headers.join(','),
            ...logs.map(log => 
                [
                    log.id,
                    `"${log.time}"`,
                    `"${log.user}"`,
                    `"${log.role}"`,
                    `"${log.action.replace(/"/g, '""')}"`,
                    `"${log.target.replace(/"/g, '""')}"`,
                    log.type
                ].join(',')
            )
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `bka_activity_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Ekspor CSV berhasil disiapkan dan diunduh.');
    };

    // JSON Exporter
    const exportJSON = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data log untuk diekspor.');
            return;
        }
        const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonContent);
        link.setAttribute('download', `bka_activity_logs_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Ekspor berkas JSON berhasil disiapkan.');
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'create':
                return {
                    icon: PlusCircle,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    label: 'Tambah'
                };
            case 'update':
                return {
                    icon: Edit2,
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    label: 'Edit'
                };
            case 'delete':
                return {
                    icon: Trash2,
                    color: 'text-red-600 bg-red-50 border-red-100',
                    label: 'Hapus'
                };
            case 'user':
                return {
                    icon: UserPlus,
                    color: 'text-purple-600 bg-purple-50 border-purple-100',
                    label: 'Pengguna'
                };
            case 'system':
            default:
                return {
                    icon: Settings,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    label: 'Sistem'
                };
        }
    };

    // Render restricted screen if not Super Admin
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Log Keamanan" />
                <div className="mx-auto w-full max-w-4xl p-6 md:p-12">
                    <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg md:p-16">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#FEF2F2_0%,transparent_100%)] opacity-70" />
                        <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-bounce">
                                <ShieldAlert size={32} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                    Akses Terbatas
                                </h1>
                                <p className="text-sm font-light leading-relaxed text-neutral-500">
                                    Halaman Log Aktivitas dan Audit Keamanan portal BKA hanya dapat diakses oleh akun dengan tingkat wewenang <strong className="font-semibold text-red-700">Super Admin</strong>.
                                </p>
                            </div>
                            <div className="pt-4 flex w-full flex-col gap-2">
                                <a
                                    href="/admin"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-3 px-6 transition-all shadow-sm"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Kembali ke Dashboard</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Log Aktivitas Sistem" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Activity className="size-5" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                                Log Aktivitas Sistem
                            </h1>
                        </div>
                        <p className="text-sm font-light leading-relaxed text-neutral-500">
                            Pantau riwayat perubahan, pembaruan konten, audit keamanan, dan operasi administratif Super Admin secara terinci.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {logs.length === 0 && (
                            <button
                                onClick={handleSeedLogs}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-600 py-2.5 px-4 shadow-2xs transition-all outline-none"
                            >
                                <RefreshCw size={14} className="animate-spin-slow" />
                                <span>Muat Log Contoh</span>
                            </button>
                        )}
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/20 bg-emerald-50/50 hover:bg-[#1B5E20]/10 text-xs font-bold text-[#1B5E20] py-2.5 px-4 transition-all outline-none"
                            title="Unduh seluruh data log dalam format .csv"
                        >
                            <Download size={14} />
                            <span>Ekspor CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-xs font-bold text-blue-700 py-2.5 px-4 transition-all outline-none"
                            title="Unduh seluruh data log dalam format mentah .json"
                        >
                            <FileCode size={14} />
                            <span>Ekspor JSON</span>
                        </button>
                        <button
                            onClick={() => setClearConfirmOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/50 text-xs font-bold text-red-700 py-2.5 px-4 transition-all outline-none"
                            title="Kosongkan seluruh log dalam penyimpanan lokal"
                        >
                            <Trash2 size={14} />
                            <span>Kosongkan Log</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats Overview Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {/* Block Total */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-neutral-50 text-neutral-600 flex items-center justify-center border border-neutral-100 shrink-0">
                            <Activity className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Total Log</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{totalCount}</p>
                        </div>
                    </div>
                    {/* Block Creates */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                            <PlusCircle className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Tambah Konten</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{createCount}</p>
                        </div>
                    </div>
                    {/* Block Updates */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                            <Edit2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Ubah Konten</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{updateCount}</p>
                        </div>
                    </div>
                    {/* Block Deletes */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                            <Trash2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Hapus Konten</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{deleteCount}</p>
                        </div>
                    </div>
                    {/* Block System/Users */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-3.5 col-span-2 sm:col-span-1">
                        <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                            <Shield className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Akses & Sistem</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{systemUserCount}</p>
                        </div>
                    </div>
                </div>

                {/* Main Filter Table Block */}
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Filters Toolbar */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
                            <input
                                type="text"
                                placeholder="Cari nama, aksi, atau target..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/20"
                            />
                        </div>

                        {/* Date filter dropdown */}
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
                            <select
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                                className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/20 appearance-none cursor-pointer"
                            >
                                <option value="all">Seluruh Waktu</option>
                                <option value="today">Hari Ini</option>
                                <option value="7days">7 Hari Terakhir</option>
                                <option value="30days">30 Hari Terakhir</option>
                            </select>
                        </div>

                        {/* Result Counter */}
                        <div className="flex justify-end text-xs font-bold text-neutral-400">
                            Menemukan {filteredLogs.length} hasil penyaringan
                        </div>
                    </div>

                    {/* Filter Pills / Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-400 mr-2">Tipe Aksi:</span>
                        <button
                            type="button"
                            onClick={() => setSelectedType('all')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'all'
                                    ? "bg-[#1B5E20] border-[#1B5E20] text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                            )}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('create')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'create'
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-emerald-50"
                            )}
                        >
                            Tambah (+ / Create)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('update')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'update'
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-blue-50"
                            )}
                        >
                            Perbarui (✎ / Update)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('delete')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'delete'
                                    ? "bg-red-600 border-red-600 text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-red-50"
                            )}
                        >
                            Hapus (✗ / Delete)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('system')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'system'
                                    ? "bg-amber-600 border-amber-600 text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-amber-50"
                            )}
                        >
                            Konfigurasi Sistem
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('user')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer",
                                selectedType === 'user'
                                    ? "bg-purple-600 border-purple-600 text-white"
                                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-purple-50"
                            )}
                        >
                            Manajemen Pengguna
                        </button>
                    </div>

                    {/* Table Logs view */}
                    <div className="overflow-x-auto rounded-xl border border-neutral-100">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold text-neutral-400 uppercase select-none">
                                    <th className="px-5 py-4">Waktu</th>
                                    <th className="px-5 py-4">Tipe Aksi</th>
                                    <th className="px-5 py-4">Aktor / Administrator</th>
                                    <th className="px-5 py-4">Rincian Aktivitas</th>
                                    <th className="px-5 py-4 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                                {currentLogs.length > 0 ? (
                                    currentLogs.map((log) => {
                                        const { icon: Icon, color, label } = getLogIcon(log.type);
                                        return (
                                            <tr key={log.id} className="hover:bg-neutral-50/30 transition-colors">
                                                {/* Timestamp */}
                                                <td className="px-5 py-4 text-neutral-400 whitespace-nowrap">
                                                    <span className="font-semibold text-neutral-500" title={formatDate(log.time)}>
                                                        {formatRelativeDate(log.time)}
                                                    </span>
                                                    <span className="block text-[10px] text-neutral-300 font-light mt-0.5">
                                                        {new Date(log.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                                                    </span>
                                                </td>

                                                {/* Action type badge */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                                        color
                                                    )}>
                                                        <Icon className="size-3" />
                                                        <span>{label}</span>
                                                    </span>
                                                </td>

                                                {/* Actor user details */}
                                                <td className="px-5 py-4">
                                                    <span className="font-bold text-neutral-800">{log.user}</span>
                                                    <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                                        {log.role}
                                                    </span>
                                                </td>

                                                {/* Log payload action and target */}
                                                <td className="px-5 py-4 max-w-sm">
                                                    <p className="text-neutral-600 leading-relaxed font-light break-words">
                                                        {log.action}{' '}
                                                        <strong className="font-bold text-[#1B5E20] break-all block md:inline mt-0.5 md:mt-0">
                                                            "{log.target}"
                                                        </strong>
                                                    </p>
                                                </td>

                                                {/* Action parameters button */}
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailLog(log)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:text-[#1B5E20] text-[10px] font-bold text-neutral-500 py-1.5 px-3 transition-all outline-none cursor-pointer"
                                                        title="Buka rincian data log lengkap"
                                                    >
                                                        <Eye size={12} />
                                                        <span>Inspeksi</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-neutral-400 font-medium bg-neutral-50/10">
                                            <Activity size={36} className="mx-auto text-neutral-300 mb-3 animate-pulse" />
                                            <p className="text-sm font-semibold text-neutral-700">Tidak Ada Log Aktivitas</p>
                                            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                                                Belum ada aktivitas terekam yang sesuai dengan kriteria penyaringan Anda saat ini.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination control footer panel */}
                    {totalPages > 1 && (
                        <div className="flex flex-col gap-4 items-center justify-between border-t border-neutral-100 pt-4 md:flex-row select-none">
                            <span className="text-[11px] font-bold text-neutral-400">
                                Menampilkan {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)} dari {filteredLogs.length} entri log
                            </span>

                            <div className="inline-flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-all outline-none cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "size-8 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer",
                                            currentPage === i + 1
                                                ? "bg-[#1B5E20] text-white shadow-2xs"
                                                : "border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-400 transition-all outline-none cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: ERASE CONFIRMATION */}
            {clearConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all animate-in fade-in select-none">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 text-center duration-200">
                        <div className="mx-auto h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100 animate-pulse">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-1">
                            Kosongkan Log Aktivitas?
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-500 mb-6 px-2 font-light">
                            Apakah Anda yakin ingin mengosongkan seluruh riwayat perubahan log aktivitas sistem BKA UMRI?
                            <br />
                            <span className="text-red-600 font-semibold">Tindakan ini bersifat destruktif</span>, menghapus seluruh riwayat audit lokal secara permanen, dan tidak dapat dibatalkan.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setClearConfirmOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none cursor-pointer"
                            >
                                Ya, Kosongkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: LOG AUDIT INSPECTOR */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs transition-all animate-in fade-in">
                    <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 relative duration-200 flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4 select-none">
                            <div className="flex items-center gap-2">
                                <div className="h-8.5 w-8.5 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-600 shrink-0">
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Inspektur Audit Log Keamanan
                                    </h3>
                                    <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
                                        Rincian Parameter Aktivitas
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailLog(null)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all outline-none cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal content */}
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1">
                            {/* Alert Notification */}
                            <div className="flex items-start gap-3 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-800">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <p className="font-bold">Log Otomatis Terverifikasi</p>
                                    <p className="font-light text-emerald-700/90">
                                        Log ini tercatat di browser lokal admin secara aman saat aktor melakukan perubahan sistem, menggunakan pengidentifikasi akun tervalidasi.
                                    </p>
                                </div>
                            </div>

                            {/* Details table grid */}
                            <div className="rounded-2xl border border-neutral-100 p-4 bg-neutral-50/30 space-y-3.5 text-xs">
                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">ID Log</span>
                                    <span className="col-span-2 font-mono text-[10px] text-neutral-600 font-bold select-all">{detailLog.id}</span>
                                </div>
                                <div className="h-px bg-neutral-100" />
                                
                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Aktor</span>
                                    <span className="col-span-2 font-bold text-neutral-800 flex items-center gap-1.5">
                                        <span>{detailLog.user}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[9px] text-neutral-500 font-extrabold uppercase">
                                            {detailLog.role}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Tipe Tindakan</span>
                                    <span className="col-span-2 font-bold uppercase text-[9px] text-[#1B5E20] flex items-center gap-1.5">
                                        <CheckCircle2 size={11} className="text-[#1B5E20]" />
                                        <span>{detailLog.type}</span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Deskripsi Aksi</span>
                                    <span className="col-span-2 text-neutral-700 leading-relaxed font-light">{detailLog.action}</span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Subjek Target</span>
                                    <span className="col-span-2 font-semibold text-emerald-800 break-all bg-emerald-50/50 border border-emerald-100/30 p-2 rounded-xl block leading-normal select-all">
                                        "{detailLog.target}"
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Waktu Lokal</span>
                                    <span className="col-span-2 text-neutral-600 font-semibold">
                                        {formatDate(detailLog.time)}
                                        <span className="block text-[10px] text-neutral-400 font-light mt-0.5">
                                            {new Date(detailLog.time).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Raw JSON viewer */}
                            <div className="space-y-1.5">
                                <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider select-none">Representasi Mentah (Raw JSON)</span>
                                <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-3.5 text-[10px] font-mono text-emerald-400 select-all overflow-x-auto max-h-[140px]">
                                    <pre>{JSON.stringify(detailLog, null, 2)}</pre>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end border-t border-neutral-100 pt-4 mt-4 select-none">
                            <button
                                onClick={() => setDetailLog(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none cursor-pointer"
                            >
                                Tutup Inspeksi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

LogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Log Aktivitas',
            href: '/admin/logs',
        },
    ],
};
