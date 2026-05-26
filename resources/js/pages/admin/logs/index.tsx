import { Head, usePage, router } from '@inertiajs/react';
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
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDate, formatRelativeDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

interface ActivityLog {
    id: number;
    time: string; // ISO string
    user: string;
    role: string;
    action: string;
    target: string;
    type: 'create' | 'update' | 'delete' | 'system' | 'user';
}

export default function LogsIndex({ logs }: { logs: ActivityLog[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    // Modals state
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

    // Filter Logs
    const filteredLogs = logs.filter((log) => {
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
    const createCount = logs.filter((l) => l.type === 'create').length;
    const updateCount = logs.filter((l) => l.type === 'update').length;
    const deleteCount = logs.filter((l) => l.type === 'delete').length;
    const systemUserCount = logs.filter(
        (l) => l.type === 'system' || l.type === 'user',
    ).length;

    // Erase all logs
    const handleClearLogs = () => {
        router.delete('/admin/logs', {
            onSuccess: () => {
                setClearConfirmOpen(false);
                toast.success(
                    'Seluruh log aktivitas sistem berhasil dikosongkan.',
                );
            },
            onError: (errors) => {
                const message =
                    Object.values(errors)[0] || 'Gagal mengosongkan log.';
                toast.error(message);
            },
        });
    };

    // Seed mock logs
    const handleSeedLogs = () => {
        router.post(
            '/admin/logs/seed',
            {},
            {
                onSuccess: () => {
                    toast.success(
                        'Berhasil memuat ulang data log contoh (Mock Logs).',
                    );
                },
                onError: (errors) => {
                    const message =
                        Object.values(errors)[0] || 'Gagal memuat log contoh.';
                    toast.error(message);
                },
            },
        );
    };

    // CSV Exporter
    const exportCSV = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data log untuk diekspor.');

            return;
        }

        const headers = [
            'ID',
            'Waktu (ISO)',
            'Pengguna',
            'Peran',
            'Aksi',
            'Target',
            'Tipe',
        ];
        const csvRows = [
            headers.join(','),
            ...logs.map((log) =>
                [
                    log.id,
                    `"${log.time}"`,
                    `"${log.user}"`,
                    `"${log.role}"`,
                    `"${log.action.replace(/"/g, '""')}"`,
                    `"${log.target.replace(/"/g, '""')}"`,
                    log.type,
                ].join(','),
            ),
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

        const jsonContent =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(logs, null, 2));
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
                    label: 'Tambah',
                };
            case 'update':
                return {
                    icon: Edit2,
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    label: 'Edit',
                };
            case 'delete':
                return {
                    icon: Trash2,
                    color: 'text-red-600 bg-red-50 border-red-100',
                    label: 'Hapus',
                };
            case 'user':
                return {
                    icon: UserPlus,
                    color: 'text-purple-600 bg-purple-50 border-purple-100',
                    label: 'Pengguna',
                };
            case 'system':
            default:
                return {
                    icon: Settings,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    label: 'Sistem',
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
                        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center space-y-6">
                            <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                                <ShieldAlert size={32} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                    Akses Terbatas
                                </h1>
                                <p className="text-sm leading-relaxed font-light text-neutral-500">
                                    Halaman Log Aktivitas dan Audit Keamanan
                                    portal BKA hanya dapat diakses oleh akun
                                    dengan tingkat wewenang{' '}
                                    <strong className="font-semibold text-red-700">
                                        Super Admin
                                    </strong>
                                    .
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-2 pt-4">
                                <a
                                    href="/admin"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800"
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
                        <p className="text-sm leading-relaxed font-light text-neutral-500">
                            Pantau riwayat perubahan, pembaruan konten, audit
                            keamanan, dan operasi administratif Super Admin
                            secara terinci.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {logs.length === 0 && (
                            <button
                                onClick={handleSeedLogs}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 shadow-2xs transition-all outline-none hover:bg-neutral-50"
                            >
                                <RefreshCw
                                    size={14}
                                    className="animate-spin-slow"
                                />
                                <span>Muat Log Contoh</span>
                            </button>
                        )}
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/20 bg-emerald-50/50 px-4 py-2.5 text-xs font-bold text-[#1B5E20] transition-all outline-none hover:bg-[#1B5E20]/10"
                            title="Unduh seluruh data log dalam format .csv"
                        >
                            <Download size={14} />
                            <span>Ekspor CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-all outline-none hover:bg-blue-100/50"
                            title="Unduh seluruh data log dalam format mentah .json"
                        >
                            <FileCode size={14} />
                            <span>Ekspor JSON</span>
                        </button>
                        <button
                            onClick={() => setClearConfirmOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-xs font-bold text-red-700 transition-all outline-none hover:bg-red-100/50"
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
                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-600">
                            <Activity className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Total Log
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {totalCount}
                            </p>
                        </div>
                    </div>
                    {/* Block Creates */}
                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                            <PlusCircle className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Tambah Konten
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {createCount}
                            </p>
                        </div>
                    </div>
                    {/* Block Updates */}
                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                            <Edit2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Ubah Konten
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {updateCount}
                            </p>
                        </div>
                    </div>
                    {/* Block Deletes */}
                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                            <Trash2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Hapus Konten
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {deleteCount}
                            </p>
                        </div>
                    </div>
                    {/* Block System/Users */}
                    <div className="col-span-2 flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] sm:col-span-1">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
                            <Shield className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Akses & Sistem
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {systemUserCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Filter Table Block */}
                <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                    {/* Filters Toolbar */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, aksi, atau target..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 py-2.5 pr-4 pl-10 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Date filter dropdown */}
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                            <select
                                value={selectedDateRange}
                                onChange={(e) =>
                                    setSelectedDateRange(e.target.value)
                                }
                                className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-neutral-50/20 py-2.5 pr-4 pl-10 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                        <span className="mr-2 text-[10px] font-extrabold tracking-wide text-neutral-400 uppercase">
                            Tipe Aksi:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedType('all')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'all'
                                    ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
                            )}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('create')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'create'
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-emerald-50',
                            )}
                        >
                            Tambah (+ / Create)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('update')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'update'
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-blue-50',
                            )}
                        >
                            Perbarui (✎ / Update)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('delete')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'delete'
                                    ? 'border-red-600 bg-red-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-red-50',
                            )}
                        >
                            Hapus (✗ / Delete)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('system')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'system'
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-amber-50',
                            )}
                        >
                            Konfigurasi Sistem
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedType('user')}
                            className={cn(
                                'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all',
                                selectedType === 'user'
                                    ? 'border-purple-600 bg-purple-600 text-white'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-purple-50',
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
                                    <th className="px-5 py-4">
                                        Aktor / Administrator
                                    </th>
                                    <th className="px-5 py-4">
                                        Rincian Aktivitas
                                    </th>
                                    <th className="px-5 py-4 text-right">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                                {currentLogs.length > 0 ? (
                                    currentLogs.map((log) => {
                                        const {
                                            icon: Icon,
                                            color,
                                            label,
                                        } = getLogIcon(log.type);

                                        return (
                                            <tr
                                                key={log.id}
                                                className="transition-colors hover:bg-neutral-50/30"
                                            >
                                                {/* Timestamp */}
                                                <td className="px-5 py-4 whitespace-nowrap text-neutral-400">
                                                    <span
                                                        className="font-semibold text-neutral-500"
                                                        title={formatDate(
                                                            log.time,
                                                        )}
                                                    >
                                                        {formatRelativeDate(
                                                            log.time,
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 block text-[10px] font-light text-neutral-300">
                                                        {new Date(
                                                            log.time,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit',
                                                            },
                                                        )}{' '}
                                                        WIB
                                                    </span>
                                                </td>

                                                {/* Action type badge */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase',
                                                            color,
                                                        )}
                                                    >
                                                        <Icon className="size-3" />
                                                        <span>{label}</span>
                                                    </span>
                                                </td>

                                                {/* Actor user details */}
                                                <td className="px-5 py-4">
                                                    <span className="font-bold text-neutral-800">
                                                        {log.user}
                                                    </span>
                                                    <span className="mt-0.5 block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                        {log.role}
                                                    </span>
                                                </td>

                                                {/* Log payload action and target */}
                                                <td className="max-w-sm px-5 py-4">
                                                    <p className="leading-relaxed font-light break-words text-neutral-600">
                                                        {log.action}{' '}
                                                        <strong className="mt-0.5 block font-bold break-all text-[#1B5E20] md:mt-0 md:inline">
                                                            "{log.target}"
                                                        </strong>
                                                    </p>
                                                </td>

                                                {/* Action parameters button */}
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetailLog(log)
                                                        }
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-bold text-neutral-500 transition-all outline-none hover:bg-neutral-50 hover:text-[#1B5E20]"
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
                                        <td
                                            colSpan={5}
                                            className="bg-neutral-50/10 px-5 py-16 text-center font-medium text-neutral-400"
                                        >
                                            <Activity
                                                size={36}
                                                className="mx-auto mb-3 animate-pulse text-neutral-300"
                                            />
                                            <p className="text-sm font-semibold text-neutral-700">
                                                Tidak Ada Log Aktivitas
                                            </p>
                                            <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
                                                Belum ada aktivitas terekam yang
                                                sesuai dengan kriteria
                                                penyaringan Anda saat ini.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination control footer panel */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-4 select-none md:flex-row">
                            <span className="text-[11px] font-bold text-neutral-400">
                                Menampilkan {indexOfFirstLog + 1} -{' '}
                                {Math.min(indexOfLastLog, filteredLogs.length)}{' '}
                                dari {filteredLogs.length} entri log
                            </span>

                            <div className="inline-flex items-center gap-1.5">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-2 text-neutral-400 transition-all outline-none hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-400"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            'size-8 cursor-pointer rounded-lg text-xs font-bold transition-all outline-none',
                                            currentPage === i + 1
                                                ? 'bg-[#1B5E20] text-white shadow-2xs'
                                                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-2 text-neutral-400 transition-all outline-none hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-400"
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
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                    <div className="w-full max-w-sm animate-in rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                        <div className="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-neutral-950">
                            Kosongkan Log Aktivitas?
                        </h3>
                        <p className="mb-6 px-2 text-xs leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin mengosongkan seluruh riwayat
                            perubahan log aktivitas sistem BKA UMRI?
                            <br />
                            <span className="font-semibold text-red-600">
                                Tindakan ini bersifat destruktif
                            </span>
                            , menghapus seluruh riwayat audit lokal secara
                            permanen, dan tidak dapat dibatalkan.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setClearConfirmOpen(false)}
                                className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                            >
                                Ya, Kosongkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: LOG AUDIT INSPECTOR */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs transition-all fade-in">
                    <div className="relative flex max-h-[85vh] w-full max-w-lg animate-in flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                        {/* Modal Header */}
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 select-none">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-600">
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Inspektur Audit Log Keamanan
                                    </h3>
                                    <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                        Rincian Parameter Aktivitas
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailLog(null)}
                                className="cursor-pointer rounded-lg p-1 text-neutral-400 transition-all outline-none hover:bg-neutral-50 hover:text-neutral-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal content */}
                        <div className="flex-1 space-y-4 overflow-y-auto py-1 pr-1">
                            {/* Alert Notification */}
                            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-emerald-800">
                                <Info size={16} className="mt-0.5 shrink-0" />
                                <div className="text-[11px] leading-relaxed">
                                    <p className="font-bold">
                                        Log Otomatis Terverifikasi
                                    </p>
                                    <p className="font-light text-emerald-700/90">
                                        Log ini tercatat di browser lokal admin
                                        secara aman saat aktor melakukan
                                        perubahan sistem, menggunakan
                                        pengidentifikasi akun tervalidasi.
                                    </p>
                                </div>
                            </div>

                            {/* Details table grid */}
                            <div className="space-y-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 text-xs">
                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        ID Log
                                    </span>
                                    <span className="col-span-2 font-mono text-[10px] font-bold text-neutral-600 select-all">
                                        {detailLog.id}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Aktor
                                    </span>
                                    <span className="col-span-2 flex items-center gap-1.5 font-bold text-neutral-800">
                                        <span>{detailLog.user}</span>
                                        <span className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[9px] font-extrabold text-neutral-500 uppercase">
                                            {detailLog.role}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Tipe Tindakan
                                    </span>
                                    <span className="col-span-2 flex items-center gap-1.5 text-[9px] font-bold text-[#1B5E20] uppercase">
                                        <CheckCircle2
                                            size={11}
                                            className="text-[#1B5E20]"
                                        />
                                        <span>{detailLog.type}</span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Deskripsi Aksi
                                    </span>
                                    <span className="col-span-2 leading-relaxed font-light text-neutral-700">
                                        {detailLog.action}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Subjek Target
                                    </span>
                                    <span className="col-span-2 block rounded-xl border border-emerald-100/30 bg-emerald-50/50 p-2 leading-normal font-semibold break-all text-emerald-800 select-all">
                                        "{detailLog.target}"
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Waktu Lokal
                                    </span>
                                    <span className="col-span-2 font-semibold text-neutral-600">
                                        {formatDate(detailLog.time)}
                                        <span className="mt-0.5 block text-[10px] font-light text-neutral-400">
                                            {new Date(
                                                detailLog.time,
                                            ).toLocaleString('id-ID', {
                                                dateStyle: 'full',
                                                timeStyle: 'medium',
                                            })}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Raw JSON viewer */}
                            <div className="space-y-1.5">
                                <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase select-none">
                                    Representasi Mentah (Raw JSON)
                                </span>
                                <div className="max-h-[140px] overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-900 p-3.5 font-mono text-[10px] text-emerald-400 select-all">
                                    <pre>
                                        {JSON.stringify(detailLog, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4 select-none">
                            <button
                                onClick={() => setDetailLog(null)}
                                className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
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
