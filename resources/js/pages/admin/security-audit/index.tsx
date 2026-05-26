import { Head, usePage, router } from '@inertiajs/react';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    Search,
    Trash2,
    Download,
    FileCode,
    RefreshCw,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Eye,
    X,
    Info,
    CheckCircle2,
    Lock,
    KeyRound,
    AlertTriangle,
    Laptop,
    Smartphone,
    Globe,
    Ban,
    UserX,
    Unlock,
    HelpCircle,
    Server,
    WifiOff,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDate, formatRelativeDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

interface LoginLog {
    id: number;
    time: string; // ISO string
    username: string;
    ipAddress: string;
    browser: string;
    platform: string;
    location: string;
    status: 'sukses' | 'gagal';
    reason?: string;
}

interface ActiveSession {
    id: string;
    ipAddress: string;
    browser: string;
    platform: string;
    location: string;
    loginTime: string;
    lastActive: string;
    isCurrent: boolean;
}

// Props for SecurityAudit component initialized from database props
interface SecurityAuditProps {
    dbLogs?: LoginLog[];
    dbSessions?: ActiveSession[];
    dbBlacklistedIps?: string[];
}

export default function SecurityAuditIndex({
    dbLogs = [],
    dbSessions = [],
    dbBlacklistedIps = [],
}: SecurityAuditProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [logs, setLogs] = useState<LoginLog[]>(dbLogs);
    const [sessions, setSessions] = useState<ActiveSession[]>(dbSessions);
    const [blacklistedIps, setBlacklistedIps] =
        useState<string[]>(dbBlacklistedIps);

    // Sync state when Inertia props reload
    useEffect(() => {
        setLogs(dbLogs);
    }, [dbLogs]);

    useEffect(() => {
        setSessions(dbSessions);
    }, [dbSessions]);

    useEffect(() => {
        setBlacklistedIps(dbBlacklistedIps);
    }, [dbBlacklistedIps]);

    // Filters & pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'semua' | 'sukses' | 'gagal'
    >('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 8;

    // Modals & inspectors
    const [detailLog, setDetailLog] = useState<LoginLog | null>(null);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [sessionToTerminate, setSessionToTerminate] =
        useState<ActiveSession | null>(null);
    const [isSimulatingBruteForce, setIsSimulatingBruteForce] = useState(false);

    // ─── BRUTE FORCE DETECTION ENGINE ───
    // Groups failures in the last 10 minutes by IP. If count >= 5, returns the flagged IPs.
    const detectBruteForceIps = () => {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        const recentFailures = logs.filter(
            (log) =>
                log.status === 'gagal' &&
                new Date(log.time).getTime() >= tenMinutesAgo,
        );

        const ipFailureCounts: { [ip: string]: number } = {};
        recentFailures.forEach((log) => {
            ipFailureCounts[log.ipAddress] =
                (ipFailureCounts[log.ipAddress] || 0) + 1;
        });

        // Filter where count >= 5
        const bruteForceIps = Object.keys(ipFailureCounts).filter(
            (ip) => ipFailureCounts[ip] >= 5,
        );

        return bruteForceIps.map((ip) => ({
            ip,
            attempts: ipFailureCounts[ip],
            lastTime:
                logs.find((log) => log.ipAddress === ip)?.time ||
                new Date().toISOString(),
        }));
    };

    const bruteForceAlerts = detectBruteForceIps();

    // ─── ACTIONS ───
    const handleClearLogs = () => {
        router.delete('/admin/security-audit/logs', {
            onSuccess: () => {
                setClearConfirmOpen(false);
                toast.success(
                    'Seluruh data rekapitulasi login berhasil dikosongkan.',
                );
            },
            onError: () => {
                toast.error('Gagal mengosongkan log audit.');
            },
        });
    };

    const handleResetAll = () => {
        router.reload({
            onSuccess: () => {
                toast.success(
                    'Data audit keamanan berhasil diperbarui dari server.',
                );
            },
        });
    };

    const handleForceLogout = () => {
        if (!sessionToTerminate) {
            return;
        }

        router.delete(
            `/admin/security-audit/sessions/${sessionToTerminate.id}`,
            {
                onSuccess: () => {
                    toast.success(
                        `Sesi dengan IP ${sessionToTerminate.ipAddress} (${sessionToTerminate.platform}) berhasil diputus paksa.`,
                    );
                    setSessionToTerminate(null);
                },
                onError: () => {
                    toast.error('Gagal memutus sesi masuk.');
                },
            },
        );
    };

    const handleToggleBlacklist = (ip: string) => {
        router.post(
            '/admin/security-audit/blacklist',
            { ip },
            {
                onSuccess: () => {
                    const wasBlacklisted = blacklistedIps.includes(ip);
                    if (wasBlacklisted) {
                        toast.success(
                            `IP Address ${ip} berhasil dihapus dari daftar blokir.`,
                        );
                    } else {
                        toast.success(
                            `IP Address ${ip} berhasil dimasukkan ke daftar blokir sistem.`,
                        );
                    }
                },
                onError: () => {
                    toast.error('Gagal memperbarui status blokir IP.');
                },
            },
        );
    };

    // ─── SIMULATION TOOL ───
    // Generates real failed login requests to populate logs and test brute force detection
    const handleSimulateBruteForce = async () => {
        setIsSimulatingBruteForce(true);
        const usernames = [
            'admin',
            'superadmin',
            'keuangan',
            'bka_admin',
            'root',
            'user',
        ];

        // Send 6 failed login attempts asynchronously
        for (let i = 0; i < 6; i++) {
            try {
                await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        email:
                            usernames[i % usernames.length] + '@bka.umri.ac.id',
                        password: 'wrong_password_simulated_' + Math.random(),
                    }),
                });
            } catch (e) {
                // Ignore failed fetches
            }
        }

        setTimeout(() => {
            router.reload({
                onSuccess: () => {
                    setIsSimulatingBruteForce(false);
                    toast.warning(
                        `Simulasi brute-force selesai! 6 kegagalan login berturut-turut berhasil dikirim dan dicatat ke database.`,
                        { duration: 5000 },
                    );
                },
            });
        }, 1200);
    };

    // ─── EXPORTERS ───
    const exportCSV = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data rekapitulasi login untuk diekspor.');

            return;
        }

        const headers = [
            'ID',
            'Waktu (ISO)',
            'Nama Pengguna',
            'IP Address',
            'Browser',
            'Sistem Operasi',
            'Lokasi',
            'Status',
            'Alasan Eror',
        ];
        const csvRows = [
            headers.join(','),
            ...logs.map((log) =>
                [
                    log.id,
                    `"${log.time}"`,
                    `"${log.username}"`,
                    `"${log.ipAddress}"`,
                    `"${log.browser}"`,
                    `"${log.platform}"`,
                    `"${log.location}"`,
                    log.status,
                    `"${log.reason || '-'}"`,
                ].join(','),
            ),
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `bka_security_login_audit_${Date.now()}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Unduhan rekap CSV berhasil disiapkan.');
    };

    const exportJSON = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data rekapitulasi login untuk diekspor.');

            return;
        }

        const jsonContent =
            'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(logs, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonContent);
        link.setAttribute(
            'download',
            `bka_security_login_audit_${Date.now()}.json`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Unduhan rekap JSON berhasil disiapkan.');
    };

    // ─── FILTERS ───
    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.platform.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'semua' ? true : log.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Paginated logs
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    // Calculate rates
    const totalAttempts = logs.length;
    const successAttempts = logs.filter((l) => l.status === 'sukses').length;
    const failedAttempts = logs.filter((l) => l.status === 'gagal').length;
    const failureRate =
        totalAttempts > 0
            ? ((failedAttempts / totalAttempts) * 100).toFixed(1)
            : '0.0';

    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Audit Keamanan" />
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
                                    Halaman Log Audit Keamanan Akses Autentikasi
                                    portal BKA hanya dapat diakses oleh akun
                                    dengan wewenang{' '}
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
            <Head title="Audit Keamanan Akses Autentikasi" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Shield className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                                    Audit Keamanan Akses Autentikasi
                                </h1>
                                <p className="mt-0.5 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                    Panel Manajemen Sesi & Log Proteksi
                                    Autentikasi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSimulateBruteForce}
                            disabled={isSimulatingBruteForce}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2.5 text-xs font-bold text-amber-800 transition-all outline-none hover:bg-amber-100/50 disabled:opacity-50"
                        >
                            <KeyRound
                                size={14}
                                className={cn(
                                    isSimulatingBruteForce && 'animate-spin',
                                )}
                            />
                            <span>
                                {isSimulatingBruteForce
                                    ? 'Menimulasikan...'
                                    : 'Simulasi Brute Force'}
                            </span>
                        </button>
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/20 bg-emerald-50/50 px-4 py-2.5 text-xs font-bold text-[#1B5E20] transition-all outline-none hover:bg-[#1B5E20]/10"
                        >
                            <Download size={14} />
                            <span>Ekspor CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-all outline-none hover:bg-blue-100/50"
                        >
                            <FileCode size={14} />
                            <span>Ekspor JSON</span>
                        </button>
                        <button
                            onClick={handleResetAll}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 transition-all outline-none hover:bg-neutral-50"
                            title="Reset data audit"
                        >
                            <RefreshCw size={14} />
                            <span>Reset Data</span>
                        </button>
                    </div>
                </div>

                {/* Brute Force Real-time Danger Alerts */}
                {bruteForceAlerts.length > 0 && (
                    <div className="relative animate-pulse overflow-hidden rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm duration-1000">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#FEF2F2_0%,transparent_100%)] opacity-50" />
                        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-100 text-red-600">
                                    <ShieldAlert className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold text-red-950">
                                        DETEKSI SERANGAN BRUTE FORCE AKTIF!
                                    </h4>
                                    <p className="max-w-2xl text-xs leading-relaxed font-light text-red-700">
                                        Sistem mengidentifikasi adanya aktivitas
                                        tebakan kata sandi tidak wajar ({'>'} 5
                                        kegagalan login dalam 10 menit) dari
                                        alamat IP berikut. Disarankan untuk
                                        segera melakukan pemblokiran IP untuk
                                        melindungi server BKA UMRI.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 md:items-end">
                                {bruteForceAlerts.map((alert) => (
                                    <div
                                        key={alert.ip}
                                        className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs shadow-2xs"
                                    >
                                        <span className="font-mono font-bold text-red-700">
                                            {alert.ip}
                                        </span>
                                        <span className="h-3 w-px bg-neutral-200" />
                                        <span className="font-extrabold text-neutral-600">
                                            {alert.attempts} Kegagalan
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleToggleBlacklist(alert.ip)
                                            }
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-extrabold uppercase transition-colors',
                                                blacklistedIps.includes(
                                                    alert.ip,
                                                )
                                                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                    : 'bg-red-600 text-white hover:bg-red-700',
                                            )}
                                        >
                                            {blacklistedIps.includes(
                                                alert.ip,
                                            ) ? (
                                                <>
                                                    <Unlock size={10} />
                                                    <span>Terblokir</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Ban size={10} />
                                                    <span>Blokir IP</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-600">
                            <Globe className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Total Upaya
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {totalAttempts}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Masuk Sukses
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {successAttempts}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                            <Lock className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Upaya Gagal
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {failedAttempts}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Tingkat Kegagalan
                            </p>
                            <p className="mt-0.5 text-xl font-extrabold text-neutral-800">
                                {failureRate}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* ACTIVE SESSIONS ROW */}
                <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div>
                            <h3 className="text-sm font-extrabold text-neutral-800">
                                Sesi Masuk Aktif Saat Ini
                            </h3>
                            <p className="mt-0.5 text-[10px] font-light text-neutral-400">
                                Daftar perangkat yang saat ini sedang terhubung
                                dan memiliki hak akses ke panel BKA.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                            <span className="size-1.5 animate-ping rounded-full bg-emerald-600" />
                            <span>{sessions.length} Perangkat Terkoneksi</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    'relative flex flex-col justify-between space-y-3.5 rounded-xl border p-4 transition-all',
                                    session.isCurrent
                                        ? 'border-[#1B5E20]/30 bg-emerald-50/20 shadow-2xs'
                                        : 'border-neutral-200/80 bg-white hover:border-neutral-300',
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-500">
                                            {session.platform
                                                .toLowerCase()
                                                .includes('windows') ||
                                            session.platform
                                                .toLowerCase()
                                                .includes('mac') ? (
                                                <Laptop size={20} />
                                            ) : (
                                                <Smartphone size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-800">
                                                {session.platform}
                                            </p>
                                            <p className="text-[10px] font-medium text-neutral-400">
                                                {session.browser}
                                            </p>
                                        </div>
                                    </div>

                                    {session.isCurrent ? (
                                        <span className="rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-[#1B5E20] uppercase select-none">
                                            Aktif Anda
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSessionToTerminate(session)
                                            }
                                            className="rounded border border-red-100 bg-red-50 p-1.5 text-[10px] font-bold text-red-700 uppercase transition-all hover:bg-red-100"
                                            title="Putus koneksi sesi secara paksa"
                                        >
                                            Putuskan
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-[10px]">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">
                                            IP Address:
                                        </span>
                                        <span className="font-mono font-bold text-neutral-700">
                                            {session.ipAddress}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">
                                            Lokasi:
                                        </span>
                                        <span className="font-bold text-neutral-600">
                                            {session.location}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">
                                            Waktu Masuk:
                                        </span>
                                        <span className="font-semibold text-neutral-500">
                                            {new Date(
                                                session.loginTime,
                                            ).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            WIB
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">
                                            Aktif Terakhir:
                                        </span>
                                        <span className="font-semibold text-neutral-500">
                                            {formatRelativeDate(
                                                session.lastActive,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BLACKLISTED IPS CONTROL */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left: Interactive blacklisted IPs block */}
                    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs md:col-span-1">
                        <div>
                            <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-neutral-800">
                                <Ban size={15} className="text-red-600" />
                                <span>Blokir IP Address</span>
                            </h3>
                            <p className="mt-0.5 text-[10px] font-light text-neutral-400">
                                Daftar IP Address yang diblokir oleh sistem
                                karena terdeteksi brute force atau berbahaya.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {blacklistedIps.length > 0 ? (
                                blacklistedIps.map((ip) => (
                                    <div
                                        key={ip}
                                        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
                                            <span className="font-mono font-bold text-neutral-700">
                                                {ip}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleBlacklist(ip)
                                            }
                                            className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#1B5E20] uppercase hover:text-emerald-700"
                                            title="Buka blokir"
                                        >
                                            <Unlock size={10} />
                                            <span>Izinkan</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-neutral-400">
                                    <ShieldCheck
                                        size={24}
                                        className="mx-auto mb-2 text-neutral-300"
                                    />
                                    <p className="text-[10px] font-bold text-neutral-600">
                                        Tidak Ada IP Terblokir
                                    </p>
                                    <p className="mt-0.5 text-[9px] font-light text-neutral-400">
                                        Sistem berjalan dengan aman dan lancar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Main Rekapitulasi Login Table */}
                    <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs md:col-span-2">
                        <div className="flex flex-col gap-4 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-neutral-800">
                                    Rekapitulasi Riwayat Percobaan Masuk
                                </h3>
                                <p className="mt-0.5 text-[10px] font-light text-neutral-400">
                                    Riwayat terperinci upaya login administrator
                                    di portal BKA UMRI.
                                </p>
                            </div>

                            <button
                                onClick={() => setClearConfirmOpen(true)}
                                className="inline-flex items-center gap-1 self-start rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-[10px] font-extrabold text-red-700 transition-colors hover:bg-red-100/50 sm:self-auto"
                            >
                                <Trash2 size={12} />
                                <span>Kosongkan Riwayat</span>
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Username, IP, Platform, Lokasi..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-neutral-200 py-1.5 pr-3 pl-9 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="mr-1 text-[10px] font-bold text-neutral-400 uppercase select-none">
                                    Status:
                                </span>
                                {['semua', 'sukses', 'gagal'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() =>
                                            setStatusFilter(status as any)
                                        }
                                        className={cn(
                                            'rounded-lg border px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors',
                                            statusFilter === status
                                                ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table Logs View */}
                        <div className="overflow-x-auto rounded-xl border border-neutral-100">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-bold text-neutral-400 uppercase select-none">
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Pengguna</th>
                                        <th className="px-4 py-3">
                                            IP & Lokasi
                                        </th>
                                        <th className="px-4 py-3">
                                            Sistem & Browser
                                        </th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">
                                            Detail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-xs">
                                    {currentLogs.length > 0 ? (
                                        currentLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="transition-colors hover:bg-neutral-50/30"
                                            >
                                                {/* Timestamp */}
                                                <td className="px-4 py-3 font-medium whitespace-nowrap text-neutral-400">
                                                    <span className="block font-semibold text-neutral-500">
                                                        {formatRelativeDate(
                                                            log.time,
                                                        )}
                                                    </span>
                                                    <span className="text-[9px] font-light text-neutral-300">
                                                        {new Date(
                                                            log.time,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}{' '}
                                                        WIB
                                                    </span>
                                                </td>

                                                {/* Username */}
                                                <td className="max-w-[140px] truncate px-4 py-3 font-bold text-neutral-800">
                                                    {log.username}
                                                </td>

                                                {/* IP & Location */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="block font-mono font-bold text-neutral-600">
                                                        {log.ipAddress}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-neutral-400">
                                                        {log.location}
                                                    </span>
                                                </td>

                                                {/* Platform & Browser */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="block font-medium text-neutral-600">
                                                        {log.platform}
                                                    </span>
                                                    <span className="text-[9px] font-light text-neutral-400">
                                                        {log.browser}
                                                    </span>
                                                </td>

                                                {/* Status badge */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase',
                                                            log.status ===
                                                                'sukses'
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-red-200 bg-red-50 text-red-700',
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'size-1 shrink-0 rounded-full',
                                                                log.status ===
                                                                    'sukses'
                                                                    ? 'bg-emerald-600'
                                                                    : 'bg-red-600',
                                                            )}
                                                        />
                                                        <span>
                                                            {log.status}
                                                        </span>
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetailLog(log)
                                                        }
                                                        className="inline-flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px] font-bold text-neutral-500 transition-colors hover:bg-neutral-50"
                                                    >
                                                        <Eye size={10} />
                                                        <span>Detail</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="bg-neutral-50/10 px-4 py-12 text-center font-medium text-neutral-400"
                                            >
                                                <AlertCircle
                                                    size={28}
                                                    className="mx-auto mb-2 text-neutral-300"
                                                />
                                                <p className="text-xs font-semibold text-neutral-700">
                                                    Hasil Penyaringan Kosong
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-neutral-400">
                                                    Tidak ditemukan data log
                                                    login yang sesuai.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-xs select-none md:flex-row">
                                <span className="text-[10px] font-bold text-neutral-400">
                                    Menampilkan {indexOfFirstLog + 1} -{' '}
                                    {Math.min(
                                        indexOfLastLog,
                                        filteredLogs.length,
                                    )}{' '}
                                    dari {filteredLogs.length} entri
                                </span>

                                <div className="inline-flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-400 transition-all outline-none hover:bg-neutral-50 disabled:opacity-40"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setCurrentPage(i + 1)
                                            }
                                            className={cn(
                                                'size-7 rounded-lg text-[10px] font-bold transition-all outline-none',
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
                                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-400 transition-all outline-none hover:bg-neutral-50 disabled:opacity-40"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: ERASE HISTORY CONFIRM */}
            {clearConfirmOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                    <div className="w-full max-w-sm animate-in rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                        <div className="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-neutral-950">
                            Kosongkan Riwayat Login?
                        </h3>
                        <p className="mb-6 px-2 text-xs leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin mengosongkan seluruh riwayat
                            login audit keamanan ini?
                            <br />
                            <span className="font-semibold text-red-600">
                                Tindakan ini menghapus riwayat log audit
                                keamanan secara permanen
                            </span>{' '}
                            dan tidak dapat dipulihkan.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setClearConfirmOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: FORCE LOGOUT CONFIRM */}
            {sessionToTerminate && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                    <div className="w-full max-w-sm animate-in rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                            <WifiOff size={24} />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-neutral-950">
                            Putuskan Koneksi Perangkat?
                        </h3>
                        <p className="mb-6 px-2 text-xs leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin mematikan sesi login pada IP{' '}
                            <strong className="font-mono text-red-600">
                                {sessionToTerminate.ipAddress}
                            </strong>{' '}
                            ({sessionToTerminate.platform}) secara paksa?
                            <br />
                            Pengguna sesi tersebut akan langsung diarahkan
                            keluar (*logged out*) ke halaman login.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setSessionToTerminate(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleForceLogout}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none hover:bg-red-700"
                            >
                                Putuskan Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DETAIL LOG AUDIT INSPECTOR */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs transition-all fade-in">
                    <div className="relative flex max-h-[85vh] w-full max-w-lg animate-in flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                        {/* Modal Header */}
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 select-none">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-600">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Inspektur Audit Autentikasi
                                    </h3>
                                    <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                        Detail Upaya Akses Masuk
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailLog(null)}
                                className="rounded-lg p-1 text-neutral-400 transition-all outline-none hover:bg-neutral-50 hover:text-neutral-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 space-y-4 overflow-y-auto py-1 pr-1 text-xs">
                            <div
                                className={cn(
                                    'flex items-start gap-3 rounded-2xl border p-3.5',
                                    detailLog.status === 'sukses'
                                        ? 'border-emerald-100 bg-emerald-50/50 text-emerald-800'
                                        : 'border-red-100 bg-red-50/50 text-red-800',
                                )}
                            >
                                {detailLog.status === 'sukses' ? (
                                    <ShieldCheck
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                ) : (
                                    <ShieldAlert
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                )}
                                <div className="text-[11px] leading-relaxed">
                                    <p className="font-bold">
                                        {detailLog.status === 'sukses'
                                            ? 'Upaya Masuk Terverifikasi Sukses'
                                            : 'Upaya Masuk Ditolak Sistem'}
                                    </p>
                                    <p
                                        className={cn(
                                            detailLog.status === 'sukses'
                                                ? 'text-emerald-700/90'
                                                : 'text-red-700/90',
                                        )}
                                    >
                                        {detailLog.status === 'sukses'
                                            ? 'Hak akses administrator berhasil diberikan untuk sesi aktif ini.'
                                            : `Akses ditolak dengan alasan keamanan: ${detailLog.reason || 'Sebab tidak diketahui'}`}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4">
                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Waktu Upaya
                                    </span>
                                    <span className="col-span-2 font-semibold text-neutral-700 select-all">
                                        {formatDate(detailLog.time)}
                                        <span className="mt-0.5 block text-[10px] font-normal text-neutral-400">
                                            {formatRelativeDate(detailLog.time)}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Identitas / User
                                    </span>
                                    <span className="col-span-2 font-mono text-[11px] font-bold text-neutral-800 select-all">
                                        {detailLog.username}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        IP Address
                                    </span>
                                    <span className="col-span-2 font-mono font-bold text-neutral-800 select-all">
                                        {detailLog.ipAddress}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Lokasi Deteksi
                                    </span>
                                    <span className="col-span-2 flex items-center gap-1 font-bold text-neutral-600">
                                        <Globe
                                            size={11}
                                            className="text-neutral-400"
                                        />
                                        <span>{detailLog.location}</span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Perangkat / OS
                                    </span>
                                    <span className="col-span-2 font-semibold text-neutral-600">
                                        {detailLog.platform}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Klien / Browser
                                    </span>
                                    <span className="col-span-2 font-mono text-[10px] leading-relaxed break-words text-neutral-500 select-all">
                                        {detailLog.browser}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 select-none">
                                <button
                                    onClick={() =>
                                        handleToggleBlacklist(
                                            detailLog.ipAddress,
                                        )
                                    }
                                    className={cn(
                                        'rounded-xl border px-4 py-2 text-[10px] font-extrabold uppercase transition-colors',
                                        blacklistedIps.includes(
                                            detailLog.ipAddress,
                                        )
                                            ? 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
                                    )}
                                >
                                    {blacklistedIps.includes(
                                        detailLog.ipAddress,
                                    )
                                        ? 'Izinkan IP'
                                        : 'Blokir IP'}
                                </button>
                                <button
                                    onClick={() => setDetailLog(null)}
                                    className="rounded-xl bg-neutral-900 px-4 py-2 text-[10px] font-bold text-white transition-colors hover:bg-neutral-800"
                                >
                                    Selesai Inspeksi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
