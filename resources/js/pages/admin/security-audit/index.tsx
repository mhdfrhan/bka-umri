import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeDate } from '@/lib/format-date';

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

const INITIAL_LOGIN_LOGS: LoginLog[] = [
    {
        id: 1,
        time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        username: 'superadmin@bka.umri.ac.id',
        ipAddress: '180.242.234.12',
        browser: 'Chrome 122.0',
        platform: 'Windows 11',
        location: 'Pekanbaru, Indonesia',
        status: 'sukses',
    },
    {
        id: 2,
        time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        username: 'admin.keuangan@bka.umri.ac.id',
        ipAddress: '36.85.120.44',
        browser: 'Firefox 123.0',
        platform: 'macOS Sonoma',
        location: 'Jakarta, Indonesia',
        status: 'sukses',
    },
    {
        id: 3,
        time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        username: 'admin.hacker@bka.umri.ac.id',
        ipAddress: '198.51.100.75',
        browser: 'Python-requests/2.31',
        platform: 'Linux x86_64',
        location: 'Frankfurt, Jerman',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 4,
        time: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        username: 'superadmin@bka.umri.ac.id',
        ipAddress: '180.242.234.12',
        browser: 'Chrome 122.0',
        platform: 'Windows 11',
        location: 'Pekanbaru, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 5,
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        username: 'admin.keuangan@bka.umri.ac.id',
        ipAddress: '110.138.89.200',
        browser: 'Safari 17.2',
        platform: 'iOS 17',
        location: 'Padang, Indonesia',
        status: 'sukses',
    },
    {
        id: 6,
        time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        username: 'root',
        ipAddress: '203.0.113.120',
        browser: 'Go-http-client/1.1',
        platform: 'Linux x86_64',
        location: 'Seoul, Korea Selatan',
        status: 'gagal',
        reason: 'Nama pengguna tidak terdaftar',
    },
    // Seed failed attempts for automated brute force demo (e.g. 182.253.140.8)
    {
        id: 11,
        time: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        username: 'superadmin',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 12,
        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        username: 'admin',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 13,
        time: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        username: 'bka_admin',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 14,
        time: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        username: 'keuangan',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 15,
        time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        username: 'dosen_admin',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    },
    {
        id: 16,
        time: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        username: 'rektor',
        ipAddress: '182.253.140.8',
        browser: 'Hydra/9.5',
        platform: 'Linux x86_64',
        location: 'Surabaya, Indonesia',
        status: 'gagal',
        reason: 'Kata sandi tidak cocok',
    }
];

const INITIAL_SESSIONS: ActiveSession[] = [
    {
        id: 'sess-1',
        ipAddress: '180.242.234.12',
        browser: 'Chrome 122.0',
        platform: 'Windows 11',
        location: 'Pekanbaru, Indonesia (Sesi Anda)',
        loginTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        isCurrent: true,
    },
    {
        id: 'sess-2',
        ipAddress: '36.85.120.44',
        browser: 'Firefox 123.0',
        platform: 'macOS Sonoma',
        location: 'Jakarta, Indonesia',
        loginTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        isCurrent: false,
    },
    {
        id: 'sess-3',
        ipAddress: '110.138.89.200',
        browser: 'Safari 17.2',
        platform: 'iOS 17',
        location: 'Padang, Indonesia',
        loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        isCurrent: false,
    }
];

export default function SecurityAuditIndex() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [logs, setLogs] = useState<LoginLog[]>([]);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [blacklistedIps, setBlacklistedIps] = useState<string[]>(['198.51.100.75']);
    
    // Filters & pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'semua' | 'sukses' | 'gagal'>('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 8;

    // Modals & inspectors
    const [detailLog, setDetailLog] = useState<LoginLog | null>(null);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [sessionToTerminate, setSessionToTerminate] = useState<ActiveSession | null>(null);
    const [isSimulatingBruteForce, setIsSimulatingBruteForce] = useState(false);

    // Initialize data on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLogs = localStorage.getItem('bka_security_login_logs');
            const savedSessions = localStorage.getItem('bka_active_sessions');
            const savedBlacklist = localStorage.getItem('bka_blacklisted_ips');

            if (savedLogs) {
                try { setLogs(JSON.parse(savedLogs)); } catch { setLogs(INITIAL_LOGIN_LOGS); }
            } else {
                setLogs(INITIAL_LOGIN_LOGS);
                localStorage.setItem('bka_security_login_logs', JSON.stringify(INITIAL_LOGIN_LOGS));
            }

            if (savedSessions) {
                try { setSessions(JSON.parse(savedSessions)); } catch { setSessions(INITIAL_SESSIONS); }
            } else {
                setSessions(INITIAL_SESSIONS);
                localStorage.setItem('bka_active_sessions', JSON.stringify(INITIAL_SESSIONS));
            }

            if (savedBlacklist) {
                try { setBlacklistedIps(JSON.parse(savedBlacklist)); } catch { setBlacklistedIps(['198.51.100.75']); }
            } else {
                localStorage.setItem('bka_blacklisted_ips', JSON.stringify(['198.51.100.75']));
            }
        }
    }, []);

    const saveLogs = (updatedLogs: LoginLog[]) => {
        setLogs(updatedLogs);
        localStorage.setItem('bka_security_login_logs', JSON.stringify(updatedLogs));
    };

    const saveSessions = (updatedSessions: ActiveSession[]) => {
        setSessions(updatedSessions);
        localStorage.setItem('bka_active_sessions', JSON.stringify(updatedSessions));
    };

    const saveBlacklist = (updatedList: string[]) => {
        setBlacklistedIps(updatedList);
        localStorage.setItem('bka_blacklisted_ips', JSON.stringify(updatedList));
    };

    // ─── BRUTE FORCE DETECTION ENGINE ───
    // Groups failures in the last 10 minutes by IP. If count > 5, returns the flagged IPs.
    const detectBruteForceIps = () => {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        const recentFailures = logs.filter(log => log.status === 'gagal' && new Date(log.time).getTime() >= tenMinutesAgo);
        
        const ipFailureCounts: { [ip: string]: number } = {};
        recentFailures.forEach(log => {
            ipFailureCounts[log.ipAddress] = (ipFailureCounts[log.ipAddress] || 0) + 1;
        });

        // Filter where count > 5
        const bruteForceIps = Object.keys(ipFailureCounts).filter(ip => ipFailureCounts[ip] >= 5);
        return bruteForceIps.map(ip => ({
            ip,
            attempts: ipFailureCounts[ip],
            lastTime: logs.find(log => log.ipAddress === ip)?.time || new Date().toISOString()
        }));
    };

    const bruteForceAlerts = detectBruteForceIps();

    // ─── ACTIONS ───
    const handleClearLogs = () => {
        saveLogs([]);
        setClearConfirmOpen(false);
        toast.success('Seluruh data rekapitulasi login berhasil dikosongkan.');
    };

    const handleResetAll = () => {
        saveLogs(INITIAL_LOGIN_LOGS);
        saveSessions(INITIAL_SESSIONS);
        saveBlacklist(['198.51.100.75']);
        toast.success('Sistem audit keamanan diset ulang ke data awal.');
    };

    const handleForceLogout = () => {
        if (!sessionToTerminate) return;
        
        const updated = sessions.filter(s => s.id !== sessionToTerminate.id);
        saveSessions(updated);
        
        // Log this action to system logs (Simulated integration)
        toast.success(`Sesi dengan IP ${sessionToTerminate.ipAddress} (${sessionToTerminate.platform}) berhasil diputus paksa.`);
        setSessionToTerminate(null);
    };

    const handleToggleBlacklist = (ip: string) => {
        let updated: string[];
        if (blacklistedIps.includes(ip)) {
            updated = blacklistedIps.filter(item => item !== ip);
            toast.success(`IP Address ${ip} berhasil dihapus dari daftar blokir.`);
        } else {
            updated = [...blacklistedIps, ip];
            toast.success(`IP Address ${ip} berhasil dimasukkan ke daftar blokir sistem.`);
        }
        saveBlacklist(updated);
    };

    // ─── SIMULATION TOOL ───
    // Generates a mock brute-force attack from a new IP
    const handleSimulateBruteForce = () => {
        setIsSimulatingBruteForce(true);
        const attackIp = '103.111.45.19';
        const usernames = ['admin', 'superadmin', 'keuangan', 'bka_admin', 'root', 'user'];
        const simulatedAttempts: LoginLog[] = [];

        // Generate 6 failed logs separated by seconds
        for (let i = 0; i < 6; i++) {
            simulatedAttempts.push({
                id: Date.now() + i,
                time: new Date(Date.now() - (6 - i) * 1000).toISOString(),
                username: usernames[i % usernames.length] + '@bka.umri.ac.id',
                ipAddress: attackIp,
                browser: 'Hydra/9.5 Attack Agent',
                platform: 'Linux x86_64',
                location: 'Bandung, Indonesia',
                status: 'gagal',
                reason: 'Brute force attack simulation',
            });
        }

        setTimeout(() => {
            saveLogs([...simulatedAttempts, ...logs]);
            setIsSimulatingBruteForce(false);
            toast.warning(`Sistem mendeteksi 6 upaya login gagal berurutan dari IP ${attackIp}! Menampilkan lencana merah peringatan.`, {
                duration: 5000,
            });
        }, 1500);
    };

    // ─── EXPORTERS ───
    const exportCSV = () => {
        if (logs.length === 0) {
            toast.error('Tidak ada data rekapitulasi login untuk diekspor.');
            return;
        }
        
        const headers = ['ID', 'Waktu (ISO)', 'Nama Pengguna', 'IP Address', 'Browser', 'Sistem Operasi', 'Lokasi', 'Status', 'Alasan Eror'];
        const csvRows = [
            headers.join(','),
            ...logs.map(log => 
                [
                    log.id,
                    `"${log.time}"`,
                    `"${log.username}"`,
                    `"${log.ipAddress}"`,
                    `"${log.browser}"`,
                    `"${log.platform}"`,
                    `"${log.location}"`,
                    log.status,
                    `"${log.reason || '-'}"`
                ].join(',')
            )
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `bka_security_login_audit_${Date.now()}.csv`);
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
        const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonContent);
        link.setAttribute('download', `bka_security_login_audit_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Unduhan rekap JSON berhasil disiapkan.');
    };

    // ─── FILTERS ───
    const filteredLogs = logs.filter(log => {
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
    const successAttempts = logs.filter(l => l.status === 'sukses').length;
    const failedAttempts = logs.filter(l => l.status === 'gagal').length;
    const failureRate = totalAttempts > 0 ? ((failedAttempts / totalAttempts) * 100).toFixed(1) : '0.0';

    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Audit Keamanan" />
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
                                    Halaman Log Audit Keamanan Akses Autentikasi portal BKA hanya dapat diakses oleh akun dengan wewenang <strong className="font-semibold text-red-700">Super Admin</strong>.
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
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                    Panel Manajemen Sesi & Log Proteksi Autentikasi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleSimulateBruteForce}
                            disabled={isSimulatingBruteForce}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-xs font-bold text-amber-800 py-2.5 px-4 transition-all outline-none disabled:opacity-50"
                        >
                            <KeyRound size={14} className={cn(isSimulatingBruteForce && "animate-spin")} />
                            <span>{isSimulatingBruteForce ? 'Menimulasikan...' : 'Simulasi Brute Force'}</span>
                        </button>
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1B5E20]/20 bg-emerald-50/50 hover:bg-[#1B5E20]/10 text-xs font-bold text-[#1B5E20] py-2.5 px-4 transition-all outline-none"
                        >
                            <Download size={14} />
                            <span>Ekspor CSV</span>
                        </button>
                        <button
                            onClick={exportJSON}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-xs font-bold text-blue-700 py-2.5 px-4 transition-all outline-none"
                        >
                            <FileCode size={14} />
                            <span>Ekspor JSON</span>
                        </button>
                        <button
                            onClick={handleResetAll}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-600 py-2.5 px-4 transition-all outline-none"
                            title="Reset data audit"
                        >
                            <RefreshCw size={14} />
                            <span>Reset Data</span>
                        </button>
                    </div>
                </div>

                {/* Brute Force Real-time Danger Alerts */}
                {bruteForceAlerts.length > 0 && (
                    <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm animate-pulse duration-1000">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#FEF2F2_0%,transparent_100%)] opacity-50" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0 border border-red-200">
                                    <ShieldAlert className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold text-red-950">
                                        DETEKSI SERANGAN BRUTE FORCE AKTIF!
                                    </h4>
                                    <p className="text-xs font-light text-red-700 leading-relaxed max-w-2xl">
                                        Sistem mengidentifikasi adanya aktivitas tebakan kata sandi tidak wajar ({'>'} 5 kegagalan login dalam 10 menit) dari alamat IP berikut. Disarankan untuk segera melakukan pemblokiran IP untuk melindungi server BKA UMRI.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 shrink-0 md:items-end">
                                {bruteForceAlerts.map(alert => (
                                    <div key={alert.ip} className="flex items-center gap-2.5 bg-white border border-red-200 rounded-xl px-3 py-2 text-xs shadow-2xs">
                                        <span className="font-mono font-bold text-red-700">{alert.ip}</span>
                                        <span className="h-3 w-px bg-neutral-200" />
                                        <span className="font-extrabold text-neutral-600">{alert.attempts} Kegagalan</span>
                                        <button
                                            onClick={() => handleToggleBlacklist(alert.ip)}
                                            className={cn(
                                                "inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-1 rounded transition-colors",
                                                blacklistedIps.includes(alert.ip)
                                                    ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                                                    : "bg-red-600 hover:bg-red-700 text-white"
                                            )}
                                        >
                                            {blacklistedIps.includes(alert.ip) ? (
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
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-neutral-50 text-neutral-600 flex items-center justify-center border border-neutral-100 shrink-0">
                            <Globe className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Total Upaya</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{totalAttempts}</p>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Masuk Sukses</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{successAttempts}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                            <Lock className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Upaya Gagal</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{failedAttempts}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                        <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">Tingkat Kegagalan</p>
                            <p className="text-xl font-extrabold text-neutral-800 mt-0.5">{failureRate}%</p>
                        </div>
                    </div>
                </div>

                {/* ACTIVE SESSIONS ROW */}
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <div>
                            <h3 className="text-sm font-extrabold text-neutral-800">
                                Sesi Masuk Aktif Saat Ini
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                Daftar perangkat yang saat ini sedang terhubung dan memiliki hak akses ke panel BKA.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                            <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
                            <span>{sessions.length} Perangkat Terkoneksi</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "rounded-xl border p-4 transition-all relative flex flex-col justify-between space-y-3.5",
                                    session.isCurrent
                                        ? "bg-emerald-50/20 border-[#1B5E20]/30 shadow-2xs"
                                        : "bg-white border-neutral-200/80 hover:border-neutral-300"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500">
                                            {session.platform.toLowerCase().includes('windows') || session.platform.toLowerCase().includes('mac') ? (
                                                <Laptop size={20} />
                                            ) : (
                                                <Smartphone size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-800">{session.platform}</p>
                                            <p className="text-[10px] text-neutral-400 font-medium">{session.browser}</p>
                                        </div>
                                    </div>
                                    
                                    {session.isCurrent ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[9px] font-extrabold text-[#1B5E20] uppercase select-none">
                                            Aktif Anda
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setSessionToTerminate(session)}
                                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 text-[10px] font-bold uppercase transition-all"
                                            title="Putus koneksi sesi secara paksa"
                                        >
                                            Putuskan
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-[10px]">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">IP Address:</span>
                                        <span className="font-mono font-bold text-neutral-700">{session.ipAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Lokasi:</span>
                                        <span className="font-bold text-neutral-600">{session.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Waktu Masuk:</span>
                                        <span className="font-semibold text-neutral-500">{new Date(session.loginTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Aktif Terakhir:</span>
                                        <span className="font-semibold text-neutral-500">{formatRelativeDate(session.lastActive)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BLACKLISTED IPS CONTROL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Interactive blacklisted IPs block */}
                    <div className="md:col-span-1 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs space-y-4">
                        <div>
                            <h3 className="text-sm font-extrabold text-neutral-800 flex items-center gap-1.5">
                                <Ban size={15} className="text-red-600" />
                                <span>Blokir IP Address</span>
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                Daftar IP Address yang diblokir oleh sistem karena terdeteksi brute force atau berbahaya.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {blacklistedIps.length > 0 ? (
                                blacklistedIps.map(ip => (
                                    <div key={ip} className="flex items-center justify-between border border-neutral-200 bg-neutral-50/50 rounded-xl p-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                                            <span className="font-mono font-bold text-neutral-700">{ip}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBlacklist(ip)}
                                            className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#1B5E20] hover:text-emerald-700 uppercase"
                                            title="Buka blokir"
                                        >
                                            <Unlock size={10} />
                                            <span>Izinkan</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                                    <ShieldCheck size={24} className="mx-auto text-neutral-300 mb-2" />
                                    <p className="text-[10px] font-bold text-neutral-600">Tidak Ada IP Terblokir</p>
                                    <p className="text-[9px] font-light text-neutral-400 mt-0.5">Sistem berjalan dengan aman dan lancar.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Main Rekapitulasi Login Table */}
                    <div className="md:col-span-2 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
                            <div>
                                <h3 className="text-sm font-extrabold text-neutral-800">
                                    Rekapitulasi Riwayat Percobaan Masuk
                                </h3>
                                <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                    Riwayat terperinci upaya login administrator di portal BKA UMRI.
                                </p>
                            </div>

                            <button
                                onClick={() => setClearConfirmOpen(true)}
                                className="inline-flex items-center gap-1 self-start sm:self-auto rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/50 text-[10px] font-extrabold text-red-700 py-1.5 px-3 transition-colors"
                            >
                                <Trash2 size={12} />
                                <span>Kosongkan Riwayat</span>
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 size-3.5" />
                                <input
                                    type="text"
                                    placeholder="Cari Username, IP, Platform, Lokasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#1B5E20] focus:border-[#1B5E20] font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase mr-1 select-none">Status:</span>
                                {['semua', 'sukses', 'gagal'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusFilter(status as any)}
                                        className={cn(
                                            "px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors",
                                            statusFilter === status
                                                ? "bg-[#1B5E20] border-[#1B5E20] text-white"
                                                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
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
                                        <th className="px-4 py-3">IP & Lokasi</th>
                                        <th className="px-4 py-3">Sistem & Browser</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-xs">
                                    {currentLogs.length > 0 ? (
                                        currentLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-neutral-50/30 transition-colors">
                                                {/* Timestamp */}
                                                <td className="px-4 py-3 whitespace-nowrap text-neutral-400 font-medium">
                                                    <span className="block text-neutral-500 font-semibold">{formatRelativeDate(log.time)}</span>
                                                    <span className="text-[9px] text-neutral-300 font-light">
                                                        {new Date(log.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </span>
                                                </td>

                                                {/* Username */}
                                                <td className="px-4 py-3 max-w-[140px] truncate font-bold text-neutral-800">
                                                    {log.username}
                                                </td>

                                                {/* IP & Location */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-neutral-600 block">{log.ipAddress}</span>
                                                    <span className="text-[9px] text-neutral-400 font-medium">{log.location}</span>
                                                </td>

                                                {/* Platform & Browser */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-neutral-600 font-medium block">{log.platform}</span>
                                                    <span className="text-[9px] text-neutral-400 font-light">{log.browser}</span>
                                                </td>

                                                {/* Status badge */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wide",
                                                        log.status === 'sukses'
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                            : "bg-red-50 border-red-200 text-red-700"
                                                    )}>
                                                        <span className={cn("size-1 rounded-full shrink-0", log.status === 'sukses' ? "bg-emerald-600" : "bg-red-600")} />
                                                        <span>{log.status}</span>
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailLog(log)}
                                                        className="inline-flex items-center gap-0.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 text-[10px] font-bold text-neutral-500 py-1 px-2 transition-colors"
                                                    >
                                                        <Eye size={10} />
                                                        <span>Detail</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-neutral-400 font-medium bg-neutral-50/10">
                                                <AlertCircle size={28} className="mx-auto text-neutral-300 mb-2" />
                                                <p className="text-xs font-semibold text-neutral-700">Hasil Penyaringan Kosong</p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">Tidak ditemukan data log login yang sesuai.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="flex flex-col gap-3 items-center justify-between border-t border-neutral-100 pt-3 md:flex-row select-none text-xs">
                                <span className="text-[10px] font-bold text-neutral-400">
                                    Menampilkan {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)} dari {filteredLogs.length} entri
                                </span>

                                <div className="inline-flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 disabled:opacity-40 transition-all outline-none"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={cn(
                                                "size-7 rounded-lg text-[10px] font-bold transition-all outline-none",
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
                                        className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 disabled:opacity-40 transition-all outline-none"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all animate-in fade-in select-none">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 text-center duration-200">
                        <div className="mx-auto h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100 animate-pulse">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-1">
                            Kosongkan Riwayat Login?
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-500 mb-6 px-2 font-light">
                            Apakah Anda yakin ingin mengosongkan seluruh riwayat login audit keamanan ini?
                            <br />
                            <span className="text-red-600 font-semibold">Tindakan ini menghapus riwayat log audit keamanan secara permanen</span> dan tidak dapat dipulihkan.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setClearConfirmOpen(false)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: FORCE LOGOUT CONFIRM */}
            {sessionToTerminate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all animate-in fade-in select-none">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 text-center duration-200">
                        <div className="mx-auto h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                            <WifiOff size={24} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-1">
                            Putuskan Koneksi Perangkat?
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-500 mb-6 px-2 font-light">
                            Apakah Anda yakin ingin mematikan sesi login pada IP <strong className="font-mono text-red-600">{sessionToTerminate.ipAddress}</strong> ({sessionToTerminate.platform}) secara paksa?
                            <br />
                            Pengguna sesi tersebut akan langsung diarahkan keluar (*logged out*) ke halaman login.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setSessionToTerminate(null)}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleForceLogout}
                                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none"
                            >
                                Putuskan Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DETAIL LOG AUDIT INSPECTOR */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs transition-all animate-in fade-in">
                    <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 relative duration-200 flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4 select-none">
                            <div className="flex items-center gap-2">
                                <div className="h-8.5 w-8.5 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-600 shrink-0">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        Inspektur Audit Autentikasi
                                    </h3>
                                    <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5">
                                        Detail Upaya Akses Masuk
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailLog(null)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all outline-none"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1 text-xs">
                            <div className={cn(
                                "flex items-start gap-3 p-3.5 border rounded-2xl",
                                detailLog.status === 'sukses'
                                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                                    : "bg-red-50/50 border-red-100 text-red-800"
                            )}>
                                {detailLog.status === 'sukses' ? (
                                    <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                                ) : (
                                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                )}
                                <div className="text-[11px] leading-relaxed">
                                    <p className="font-bold">
                                        {detailLog.status === 'sukses' ? 'Upaya Masuk Terverifikasi Sukses' : 'Upaya Masuk Ditolak Sistem'}
                                    </p>
                                    <p className={cn(detailLog.status === 'sukses' ? "text-emerald-700/90" : "text-red-700/90")}>
                                        {detailLog.status === 'sukses'
                                            ? 'Hak akses administrator berhasil diberikan untuk sesi aktif ini.'
                                            : `Akses ditolak dengan alasan keamanan: ${detailLog.reason || 'Sebab tidak diketahui'}`}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-100 p-4 bg-neutral-50/30 space-y-3.5">
                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Waktu Upaya</span>
                                    <span className="col-span-2 font-semibold text-neutral-700 select-all">
                                        {formatDate(detailLog.time)}
                                        <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">
                                            {formatRelativeDate(detailLog.time)}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Identitas / User</span>
                                    <span className="col-span-2 font-bold text-neutral-800 font-mono text-[11px] select-all">
                                        {detailLog.username}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">IP Address</span>
                                    <span className="col-span-2 font-bold text-neutral-800 font-mono select-all">
                                        {detailLog.ipAddress}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Lokasi Deteksi</span>
                                    <span className="col-span-2 font-bold text-neutral-600 flex items-center gap-1">
                                        <Globe size={11} className="text-neutral-400" />
                                        <span>{detailLog.location}</span>
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Perangkat / OS</span>
                                    <span className="col-span-2 font-semibold text-neutral-600">
                                        {detailLog.platform}
                                    </span>
                                </div>
                                <div className="h-px bg-neutral-100" />

                                <div className="grid grid-cols-3 items-baseline gap-2">
                                    <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider">Klien / Browser</span>
                                    <span className="col-span-2 font-mono text-[10px] text-neutral-500 break-words leading-relaxed select-all">
                                        {detailLog.browser}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 select-none">
                                <button
                                    onClick={() => handleToggleBlacklist(detailLog.ipAddress)}
                                    className={cn(
                                        "rounded-xl border px-4 py-2 text-[10px] font-extrabold uppercase transition-colors",
                                        blacklistedIps.includes(detailLog.ipAddress)
                                            ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700"
                                            : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                    )}
                                >
                                    {blacklistedIps.includes(detailLog.ipAddress) ? 'Izinkan IP' : 'Blokir IP'}
                                </button>
                                <button
                                    onClick={() => setDetailLog(null)}
                                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-[10px] font-bold text-white transition-colors"
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
