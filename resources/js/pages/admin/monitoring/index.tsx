import { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Cpu,
    Database,
    HardDrive,
    Terminal,
    ArrowUpRight,
    Activity,
    TrendingUp,
    AlertTriangle,
    Trash2,
    Play,
    CheckCircle,
    Server,
    Wifi,
    Settings,
    ArrowLeft,
    ShieldAlert,
    Clock,
    RefreshCw,
    AlertCircle,
    Info,
    Wrench,
    Copy,
    Download,
    Check,
    ToggleLeft,
    Shield,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/logger';

// ─── TYPES ───
interface ErrorLog {
    id: string;
    time: string;
    level: 'error' | 'critical' | 'warning';
    exception: string;
    message: string;
    stackTrace: string;
}

interface SlowQuery {
    id: string;
    time: string;
    duration: number; // in seconds
    query: string;
    explanation: string;
}

// ─── INITIAL DUMMY ERROR LOGS ───
const INITIAL_ERRORS: ErrorLog[] = [
    {
        id: 'err-1',
        time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'critical',
        exception: 'Illuminate\\Database\\QueryException',
        message: 'SQLSTATE[HY000] [2002] Connection refused (Connection: mysql, SQL: select * from `bka_settings` limit 1)',
        stackTrace: `at vendor/laravel/framework/src/Illuminate/Database/Connectors/Connector.php:65
at vendor/laravel/framework/src/Illuminate/Database/Connectors/MySqlConnector.php:24
at vendor/laravel/framework/src/Illuminate/Database/Connection.php:452
at app/Http/Controllers/Admin/SettingsController.php:32
at vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:48`
    },
    {
        id: 'err-2',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        level: 'error',
        exception: 'ErrorException',
        message: 'Undefined array key "allow_compression" in app/Http/Controllers/Admin/AsetController.php on line 124',
        stackTrace: `at app/Http/Controllers/Admin/AsetController.php:124
at vendor/laravel/framework/src/Illuminate/Foundation/Bootstrap/HandleExceptions.php:260
at app/Http/Controllers/Admin/AsetController.php:48
at vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php:48`
    },
    {
        id: 'err-3',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        level: 'warning',
        exception: 'Inertia\\Http\\Middleware',
        message: 'Inertia asset version mismatch. App version: 2d3f9a, Request version: undefined',
        stackTrace: `at vendor/inertiajs/inertia-laravel/src/Middleware.php:98
at vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:180
at app/Http/Middleware/HandleInertiaRequests.php:24`
    }
];

// ─── INITIAL SLOW QUERIES ───
const SLOW_QUERIES: SlowQuery[] = [
    {
        id: 'q-1',
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        duration: 1.48,
        query: 'SELECT * FROM `bka_berita` WHERE `content` LIKE "%mahasiswa%" ORDER BY `created_at` DESC LIMIT 10 OFFSET 50;',
        explanation: 'Pencarian kata kunci menggunakan operator LIKE tanpa indeks teks penuh (Full-Text Index) menyebabkan pemindaian tabel penuh (Full Table Scan).'
    },
    {
        id: 'q-2',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        duration: 2.12,
        query: 'SELECT `bka_albums`.*, COUNT(`bka_photos`.`id`) as `photos_count` FROM `bka_albums` LEFT JOIN `bka_photos` ON `bka_photos`.`album_id` = `bka_albums`.`id` GROUP BY `bka_albums`.`id` ORDER BY `photos_count` DESC;',
        explanation: 'Operasi agregasi COUNT pada LEFT JOIN dengan GROUP BY berukuran besar tanpa indeks asing (foreign key index) pada kolom `album_id`.'
    }
];

export default function PerformanceMonitoring() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.user?.roles?.includes('super_admin');

    const [activeTab, setActiveTab] = useState<'monitoring' | 'operations' | 'errors'>('monitoring');

    // Real-time ticking metrics state
    const [cpuHistory, setCpuHistory] = useState<number[]>([22, 28, 25, 30, 26, 21, 29, 32, 24, 27]);
    const [ramHistory, setRamHistory] = useState<number[]>([57, 57.2, 57.5, 57.3, 57.6, 57.4, 57.8, 58, 57.9, 58.1]);
    const [qpsHistory, setQpsHistory] = useState<number[]>([14, 18, 12, 22, 19, 15, 26, 21, 16, 20]);

    // Active spike simulation toggler
    const [isSpikeActive, setIsSpikeActive] = useState(false);

    // Database dynamic metrics
    const [dbStats, setDbStats] = useState({
        beritaRows: 0,
        beritaSize: '0 KB',
        pengumumanRows: 0,
        pengumumanSize: '0 KB',
        logsRows: 0,
        logsSize: '0 KB',
        pesanRows: 0,
        pesanSize: '0 KB',
        totalSize: '0 KB'
    });

    // Maintenance Mode States
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [bypassToken, setBypassToken] = useState('BKA-SECRET-2026');
    const [isCopied, setIsCopied] = useState(false);

    // Feature flags state
    const [allowReg, setAllowReg] = useState(true);
    const [cpuAlerts, setCpuAlerts] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);
    const [logLevel, setLogLevel] = useState('info');

    // Terminal State
    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        'BKA Server Diagnostics & Operations Shell v1.1.0',
        'Type "help" or trigger administrative buttons to execute.',
        'MySQL Server status: ONLINE (Active connections: 8/150)',
        'System Operations panel initialized.'
    ]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizeProgress, setOptimizeProgress] = useState(0);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Error states
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [expandedError, setExpandedError] = useState<string | null>(null);

    // Load configurations and table metrics on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Load error list
            const savedErrors = localStorage.getItem('bka_error_logs');
            if (savedErrors) {
                try {
                    setErrors(JSON.parse(savedErrors));
                } catch {
                    setErrors(INITIAL_ERRORS);
                    localStorage.setItem('bka_error_logs', JSON.stringify(INITIAL_ERRORS));
                }
            } else {
                setErrors(INITIAL_ERRORS);
                localStorage.setItem('bka_error_logs', JSON.stringify(INITIAL_ERRORS));
            }

            // Load maintenance configurations
            const maint = localStorage.getItem('bka_maintenance_mode') === 'true';
            setIsMaintenanceMode(maint);
            const token = localStorage.getItem('bka_maintenance_bypass') || 'BKA-SECRET-2026';
            setBypassToken(token);

            // Hydrate dynamic database sizes from localStorage
            const savedBerita = localStorage.getItem('bka_berita');
            const countBerita = savedBerita ? JSON.parse(savedBerita).length : 12;

            const savedPengumuman = localStorage.getItem('bka_pengumuman');
            const countPengumuman = savedPengumuman ? JSON.parse(savedPengumuman).length : 8;

            const savedLogs = localStorage.getItem('bka_activity_logs');
            const countLogs = savedLogs ? JSON.parse(savedLogs).length : SEEDED_LOGS_COUNT();

            const savedPesan = localStorage.getItem('bka_pesan');
            const countPesan = savedPesan ? JSON.parse(savedPesan).length : 10;

            // Estimation formulas: Overhead + content length bytes estimate
            const sizeBeritaKB = Math.round(countBerita * 3.4 + 16);
            const sizePengumumanKB = Math.round(countPengumuman * 2.8 + 12);
            const sizeLogsKB = Math.round(countLogs * 0.8 + 8);
            const sizePesanKB = Math.round(countPesan * 1.5 + 8);
            const totalKB = sizeBeritaKB + sizePengumumanKB + sizeLogsKB + sizePesanKB + 420; // 420KB static metadata/assets overhead

            setDbStats({
                beritaRows: countBerita,
                beritaSize: `${sizeBeritaKB} KB`,
                pengumumanRows: countPengumuman,
                pengumumanSize: `${sizePengumumanKB} KB`,
                logsRows: countLogs,
                logsSize: `${sizeLogsKB} KB`,
                pesanRows: countPesan,
                pesanSize: `${sizePesanKB} KB`,
                totalSize: totalKB >= 1024 ? `${(totalKB / 1024).toFixed(2)} MB` : `${totalKB} KB`
            });
        }
    }, []);

    function SEEDED_LOGS_COUNT() {
        try {
            const saved = localStorage.getItem('bka_activity_logs');
            if (saved) return JSON.parse(saved).length;
        } catch {}
        return 8;
    }

    // Scroll to terminal bottom on new logs
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLogs]);

    // Real-time ticking interval simulator (ticks every 2.5 seconds)
    useEffect(() => {
        const timer = setInterval(() => {
            setCpuHistory(prev => {
                const nextVal = isSpikeActive 
                    ? Math.round(85 + Math.random() * 12)  // Spikes between 85% and 97%
                    : Math.round(15 + Math.random() * 20); // Normal between 15% and 35%
                return [...prev.slice(1), nextVal];
            });

            setRamHistory(prev => {
                const baseRam = isSpikeActive ? 88 : 57.5;
                const nextVal = parseFloat((baseRam + Math.random() * 2.5).toFixed(1)); // RAM fluctuates slightly
                return [...prev.slice(1), nextVal];
            });

            setQpsHistory(prev => {
                const qpsMultiplier = isSpikeActive ? 6.5 : 1;
                const nextVal = Math.round((10 + Math.random() * 25) * qpsMultiplier); // QPS rate spike
                return [...prev.slice(1), nextVal];
            });
        }, 2500);

        return () => clearInterval(timer);
    }, [isSpikeActive]);

    // Clear system error logs
    const handlePurgeErrors = () => {
        setErrors([]);
        localStorage.setItem('bka_error_logs', JSON.stringify([]));
        logActivity('Membersihkan log kesalahan', 'Seluruh Laravel error runtime log berhasil dibersihkan', 'delete');
        toast.success('Seluruh data log error sistem berhasil dibersihkan.');
    };

    // Toggle Maintenance Mode
    const handleToggleMaintenance = () => {
        const nextState = !isMaintenanceMode;
        setIsMaintenanceMode(nextState);
        localStorage.setItem('bka_maintenance_mode', String(nextState));
        
        // Remove bypass session storage so it resets
        sessionStorage.removeItem('bka_maintenance_bypass_active');

        if (nextState) {
            toast.warning('Mode Pemeliharaan Aktif: Pengunjung publik akan dialihkan ke layar 503 Maintenance!');
            logActivity('Mengaktifkan mode pemeliharaan', `Bypass Token aktif: "${bypassToken}"`, 'system');
            
            setTerminalLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] WARNING: Mode Pemeliharaan (Maintenance Mode) diaktifkan!`,
                `[${new Date().toLocaleTimeString()}] INFO: Pengalihan 503 aktif. Bypass Token: ?bypass=${bypassToken}`
            ]);
        } else {
            toast.success('Mode Pemeliharaan Dinonaktifkan: Portal BKA kembali online untuk publik.');
            logActivity('Menonaktifkan mode pemeliharaan', 'Portal BKA kembali normal untuk publik', 'system');

            setTerminalLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] INFO: Mode Pemeliharaan dinonaktifkan. Portal BKA kembali online untuk publik.`
            ]);
        }
    };

    // Save customized bypass token
    const handleSaveBypassToken = (newToken: string) => {
        const sanitized = newToken.replace(/[^A-Za-z0-9_-]/g, ''); // alphanumeric + dashes
        setBypassToken(sanitized);
        localStorage.setItem('bka_maintenance_bypass', sanitized);
        sessionStorage.removeItem('bka_maintenance_bypass_active');
    };

    // Copy bypass URL to clipboard
    const getBypassUrl = () => {
        if (typeof window === 'undefined') return '';
        return `${window.location.protocol}//${window.location.host}/?bypass=${bypassToken}`;
    };

    const handleCopyBypassLink = () => {
        const url = getBypassUrl();
        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            toast.success('Link bypass pemeliharaan berhasil disalin ke clipboard.');
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // DB Table Optimizer Engine
    const handleRunOptimization = () => {
        if (isOptimizing) return;
        setIsOptimizing(true);
        setOptimizeProgress(5);
        
        setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] INFO: Menginisialisasi utas optimasi basis data...`,
            `[${new Date().toLocaleTimeString()}] SQL: CONNECT TO DB 'bka_portal_umri' via Local Socket... OK`
        ]);

        const steps = [
            { p: 20, log: 'SQL: OPTIMIZE TABLE `bka_berita`... OK (Row Count: {berita}, Freed Space: 24.5 KB)' },
            { p: 40, log: 'SQL: OPTIMIZE TABLE `bka_pengumuman`... OK (Row Count: {pengumuman}, Freed Space: 12.8 KB)' },
            { p: 60, log: 'SQL: OPTIMIZE TABLE `bka_activity_logs`... OK (Row Count: {logs}, Freed Space: 84.1 KB)' },
            { p: 85, log: 'SQL: REINDEX ALL INDEXES on tables... DONE (Rebuilt: 14 indexes)' },
            { p: 100, log: 'INFO: Rekonstruksi tabel MySQL & pembersihan fragmentasi data selesai 100%. Status DB: OPTIMAL.' }
        ];

        steps.forEach((step, idx) => {
            setTimeout(() => {
                setOptimizeProgress(step.p);
                let hydLog = step.log
                    .replace('{berita}', String(dbStats.beritaRows))
                    .replace('{pengumuman}', String(dbStats.pengumumanRows))
                    .replace('{logs}', String(dbStats.logsRows));

                setTerminalLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ${hydLog}`
                ]);

                if (step.p === 100) {
                    setIsOptimizing(false);
                    toast.success('Optimasi basis data selesai! Seluruh tabel berjalan dalam status optimal.');
                    logActivity('Optimasi basis data', 'Melakukan OPTIMIZE TABLE dan rekonstruksi indeks MySQL', 'system');
                }
            }, (idx + 1) * 1000);
        });
    };

    // Sequential DB Backup Generator
    const handleRunBackup = () => {
        if (isOptimizing) return;
        setIsOptimizing(true);
        setOptimizeProgress(5);
        
        setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] INFO: Memulai pembuatan cadangan (.sql.gz) basis data portal BKA...`,
            `[${new Date().toLocaleTimeString()}] SQL: Inisialisasi dump engine mysqldump v10.13...`
        ]);

        const steps = [
            { p: 15, log: 'mysqldump: Mengekspor skema & baris dari tabel `bka_berita`... OK ({berita} baris)' },
            { p: 35, log: 'mysqldump: Mengekspor skema & baris dari tabel `bka_pengumuman`... OK ({pengumuman} baris)' },
            { p: 55, log: 'mysqldump: Mengekspor skema & baris dari tabel `bka_activity_logs`... OK ({logs} baris)' },
            { p: 75, log: 'mysqldump: Mengekspor skema & baris dari tabel `bka_pesan`... OK ({pesan} baris)' },
            { p: 90, log: 'INFO: Mengompresi file dump SQL ke format gzip berkekuatan tinggi (Level 9)...' },
            { p: 100, log: 'INFO: Cadangan selesai! File cadangan: "bka_db_backup_20260524.sql.gz". Mengunduh otomatis...' }
        ];

        steps.forEach((step, idx) => {
            setTimeout(() => {
                setOptimizeProgress(step.p);
                let hydLog = step.log
                    .replace('{berita}', String(dbStats.beritaRows))
                    .replace('{pengumuman}', String(dbStats.pengumumanRows))
                    .replace('{logs}', String(dbStats.logsRows))
                    .replace('{pesan}', String(dbStats.pesanRows));

                setTerminalLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ${hydLog}`
                ]);

                if (step.p === 100) {
                    setIsOptimizing(false);
                    toast.success('Pencadangan basis data berhasil! File SQL.GZ otomatis diunduh.');
                    logActivity('Pencadangan basis data', 'Membuat dump backup basis data terkompresi .sql.gz', 'system');
                    
                    // Trigger actual mock download of the gzip backup file containing metadata
                    const mockSQLContent = `-- BKA UMRI PORTAL SQL DUMP --
-- Generated at: ${new Date().toISOString()}
-- CPU: ${latestCpu}%, RAM: ${latestRam}%
-- Table berita: ${dbStats.beritaRows} rows
-- Table pengumuman: ${dbStats.pengumumanRows} rows
-- Table logs: ${dbStats.logsRows} rows
-- TABLE SCHEMAS & CONTENT SUCCESSFULLY DUMPED.`;

                    const element = document.createElement("a");
                    const file = new Blob([mockSQLContent], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `bka_db_backup_${Date.now()}.sql.gz`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
            }, (idx + 1) * 1000);
        });
    };

    // Spike simulator trigger
    const handleToggleSpike = () => {
        const nextState = !isSpikeActive;
        setIsSpikeActive(nextState);
        
        if (nextState) {
            toast.warning('Simulasi Lonjakan Diaktifkan: Beban CPU & RAM meningkat pesat!');
            logActivity('Simulasi lonjakan server', 'Beban server disimulasikan spike (CPU > 90%)', 'system');
        } else {
            toast.success('Beban server kembali dalam batas normal.');
            logActivity('Simulasi lonjakan dinonaktifkan', 'Beban server kembali ke status normal', 'system');
        }
    };

    // Dynamic SVG line points helper
    const getSvgPoints = (data: number[], min: number, max: number, width: number, height: number) => {
        const stepX = width / (data.length - 1);
        return data.map((val, idx) => {
            const x = idx * stepX;
            const percentage = (val - min) / (max - min || 1);
            const y = height - (percentage * (height - 12) + 6);
            return `${x},${y}`;
        }).join(' ');
    };

    const latestCpu = cpuHistory[cpuHistory.length - 1];
    const latestRam = ramHistory[ramHistory.length - 1];
    const latestQps = qpsHistory[qpsHistory.length - 1];

    // Render restricted screen if not Super Admin
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Monitoring" />
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
                                    Halaman Dashboard Monitoring Performa Server dan MySQL hanya dapat diakses oleh akun dengan tingkat wewenang <strong className="font-semibold text-red-700">Super Admin</strong>.
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
            <Head title="Diagnostik & Manajemen Sistem" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Real-time Spike Warning Alarm */}
                {isSpikeActive && (
                    <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm animate-pulse select-none">
                        <AlertTriangle className="size-6 text-red-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-red-950">
                                Peringatan Sistem: Beban Kritis Terdeteksi!
                            </h3>
                            <p className="text-xs leading-relaxed text-red-800 font-light">
                                Simulasi lonjakan beban aktif. Penggunaan CPU ({latestCpu}%) dan RAM ({latestRam}%) melebihi ambang batas kritis aman 85%. Kinerja pemuatan halaman publik mungkin mengalami sedikit kelambatan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Cpu className="size-5" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                                Diagnostik & Manajemen Sistem
                            </h1>
                        </div>
                        <p className="text-sm font-light leading-relaxed text-neutral-500">
                            Analisis diagnostik server, kendalikan mode pemeliharaan, cadangkan basis data, dan konfigurasi performa portal.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 select-none">
                        <button
                            onClick={handleToggleSpike}
                            className={cn(
                                "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold py-2.5 px-4 transition-all shadow-xs outline-none cursor-pointer border",
                                isSpikeActive
                                    ? "bg-red-600 hover:bg-red-700 text-white border-red-700"
                                    : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                            )}
                        >
                            <AlertCircle size={14} className={cn(isSpikeActive && "animate-spin-slow")} />
                            <span>{isSpikeActive ? 'Hentikan Simulasi' : 'Simulasikan Beban Tinggi'}</span>
                        </button>
                    </div>
                </div>

                {/* Navigational Tabs Panel */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 pb-px select-none">
                    <button
                        onClick={() => setActiveTab('monitoring')}
                        className={cn(
                            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
                            activeTab === 'monitoring'
                                ? "border-[#1B5E20] text-[#1B5E20]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        )}
                    >
                        <Activity className="size-4 inline mr-1.5 align-text-bottom" />
                        Pemantauan Real-time
                    </button>
                    <button
                        onClick={() => setActiveTab('operations')}
                        className={cn(
                            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
                            activeTab === 'operations'
                                ? "border-[#1B5E20] text-[#1B5E20]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        )}
                    >
                        <Wrench className="size-4 inline mr-1.5 align-text-bottom" />
                        Manajemen & Pemeliharaan
                    </button>
                    <button
                        onClick={() => setActiveTab('errors')}
                        className={cn(
                            "px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
                            activeTab === 'errors'
                                ? "border-[#1B5E20] text-[#1B5E20]"
                                : "border-transparent text-neutral-500 hover:text-neutral-800"
                        )}
                    >
                        <AlertTriangle className="size-4 inline mr-1.5 align-text-bottom" />
                        Log Kesalahan Laravel ({errors.length})
                    </button>
                </div>

                {/* TAB 1: PEMANTAUAN REAL-TIME */}
                {activeTab === 'monitoring' && (
                    <div className="space-y-6">
                        {/* Real-time Charts Section Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* CPU Usage Chart Card */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <Cpu size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-neutral-800">Utilisasi CPU</h3>
                                            <p className="text-[10px] text-neutral-400 font-light mt-0.5">Pemrosesan Server Utama</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-2xl font-extrabold tracking-tight select-all tabular-nums",
                                        latestCpu >= 85 ? "text-red-600" : "text-neutral-800"
                                    )}>
                                        {latestCpu}%
                                    </span>
                                </div>

                                {/* Animated Line SVG Chart */}
                                <div className="h-28 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 relative overflow-hidden flex items-end">
                                    <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                                        <polyline
                                            fill="none"
                                            stroke={latestCpu >= 85 ? '#c62828' : '#1b5e20'}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={getSvgPoints(cpuHistory, 0, 100, 300, 80)}
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute bottom-2 left-2.5 text-[9px] font-bold text-neutral-400 uppercase select-none">Live Monitor</span>
                                    <span className="absolute top-2 right-2.5 size-2 rounded-full bg-emerald-500 animate-ping" />
                                </div>
                            </div>

                            {/* RAM Usage Chart Card */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                            <Server size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-neutral-800">Penggunaan Memori (RAM)</h3>
                                            <p className="text-[10px] text-neutral-400 font-light mt-0.5">Total Kapasitas: 8 GB</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-2xl font-extrabold tracking-tight select-all tabular-nums",
                                        latestRam >= 80 ? "text-red-600" : "text-neutral-800"
                                    )}>
                                        {latestRam}%
                                    </span>
                                </div>

                                {/* Animated Line SVG Chart */}
                                <div className="h-28 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 relative overflow-hidden flex items-end">
                                    <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                                        <polyline
                                            fill="none"
                                            stroke={latestRam >= 80 ? '#c62828' : '#1565c0'}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={getSvgPoints(ramHistory, 0, 100, 300, 80)}
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute bottom-2 left-2.5 text-[9px] font-bold text-neutral-400 uppercase select-none">Ticking 2.5s</span>
                                    <span className="absolute top-2 right-2.5 size-2 rounded-full bg-blue-500 animate-pulse" />
                                </div>
                            </div>

                            {/* MySQL QPS Rate Chart Card */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                                            <Database size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-neutral-800">Laju Kueri MySQL</h3>
                                            <p className="text-[10px] text-neutral-400 font-light mt-0.5">Queries Per Second (QPS)</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-extrabold tracking-tight text-neutral-800 select-all tabular-nums">
                                        {latestQps} <span className="text-xs font-semibold text-neutral-400">qps</span>
                                    </span>
                                </div>

                                {/* Animated Line SVG Chart */}
                                <div className="h-28 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 relative overflow-hidden flex items-end">
                                    <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                                        <polyline
                                            fill="none"
                                            stroke="#c8a000"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={getSvgPoints(qpsHistory, 0, 300, 300, 80)}
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute bottom-2 left-2.5 text-[9px] font-bold text-neutral-400 uppercase select-none">DB Access</span>
                                    <span className="absolute top-2 right-2.5 size-2 rounded-full bg-amber-500 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Database Health details and Slow Query */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left: MySQL Detailed Health Stats */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-5 lg:col-span-1">
                                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                    <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800 select-none">
                                        <Database className="size-4.5 text-emerald-600" />
                                        Database BKA Portal
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide select-none">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                                        MySQL Online
                                    </span>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400 font-light">Versi Engine</span>
                                        <span className="font-bold text-neutral-700">MariaDB 10.4.32</span>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400 font-light">Koneksi Aktif</span>
                                        <span className="font-semibold text-neutral-700">8 dari Maks 150</span>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400 font-light">Rasio Cache Hit</span>
                                        <span className="font-bold text-emerald-700">98.42%</span>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400 font-light">Total Ruang Basis Data</span>
                                        <span className="font-bold text-neutral-800 select-all">{dbStats.totalSize}</span>
                                    </div>
                                </div>

                                {/* Storage breakdown gauge */}
                                <div className="space-y-2.5">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider select-none">Metrik Ukuran Tabel BKA</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between font-light">
                                            <span>Tabel Berita (`bka_berita`)</span>
                                            <span className="font-semibold text-neutral-700">{dbStats.beritaSize} ({dbStats.beritaRows} baris)</span>
                                        </div>
                                        <div className="flex justify-between font-light">
                                            <span>Tabel Pengumuman (`bka_pengumuman`)</span>
                                            <span className="font-semibold text-neutral-700">{dbStats.pengumumanSize} ({dbStats.pengumumanRows} baris)</span>
                                        </div>
                                        <div className="flex justify-between font-light">
                                            <span>Tabel Log Audit (`bka_activity_logs`)</span>
                                            <span className="font-semibold text-neutral-700">{dbStats.logsSize} ({dbStats.logsRows} baris)</span>
                                        </div>
                                        <div className="flex justify-between font-light">
                                            <span>Tabel Inbox (`bka_pesan`)</span>
                                            <span className="font-semibold text-neutral-700">{dbStats.pesanSize} ({dbStats.pesanRows} baris)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Slow Query Log Tracking */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4 lg:col-span-2">
                                <div className="border-b border-neutral-100 pb-3 select-none">
                                    <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                                        <Clock className="size-4.5 text-amber-600" />
                                        Kueri SQL Terlambat (&gt; 1.0s)
                                    </h2>
                                    <p className="text-[10px] text-neutral-400 font-light mt-0.5">Audit log kueri database yang membebani server.</p>
                                </div>

                                <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1">
                                    {SLOW_QUERIES.map((q) => (
                                        <div key={q.id} className="rounded-xl border border-neutral-100 bg-neutral-50/40 p-3 space-y-2.5 text-xs relative">
                                            <div className="flex items-center justify-between select-none">
                                                <span className="font-bold text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                                                    {q.duration} Detik
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-medium">
                                                    {new Date(q.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-[9px] p-2 text-emerald-400 break-all select-all leading-normal">
                                                {q.query}
                                            </div>
                                            <div className="flex gap-1.5 text-[10px] leading-relaxed font-light text-neutral-500">
                                                <Info size={12} className="shrink-0 mt-0.5 text-neutral-400" />
                                                <p>{q.explanation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: MANAJEMEN & PEMELIHARAAN (SYSTEM OPERATIONS) */}
                {activeTab === 'operations' && (
                    <div className="space-y-6">
                        {/* Upper Control Grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Maintenance mode Card */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4 lg:col-span-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 select-none">
                                        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                                            <Wrench className="size-4.5 text-amber-600" />
                                            Mode Pemeliharaan
                                        </h2>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide",
                                            isMaintenanceMode
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-neutral-50 text-neutral-500 border-neutral-200"
                                        )}>
                                            {isMaintenanceMode ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-neutral-500 font-light">
                                        Ketika diaktifkan, seluruh kunjungan publik ke halaman website akan dialihkan otomatis ke halaman penunjuk pemeliharaan (HTTP 503).
                                    </p>
                                </div>

                                <div className="space-y-4 pt-2 select-none">
                                    {/* Action Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={handleToggleMaintenance}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold py-3 px-4 shadow-sm transition-all border outline-none cursor-pointer",
                                            isMaintenanceMode
                                                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
                                                : "bg-[#1B5E20] hover:bg-[#145218] text-white border-[#1B5E20]"
                                        )}
                                    >
                                        <Settings className={cn("size-4", isMaintenanceMode && "animate-spin-slow")} />
                                        <span>{isMaintenanceMode ? 'Matikan Mode Pemeliharaan' : 'Nyalakan Mode Pemeliharaan'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bypass token setup */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4 lg:col-span-2 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 select-none">
                                        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                                            <Lock className="size-4.5 text-blue-600" />
                                            Kunci Akses Bypass Pemeliharaan
                                        </h2>
                                    </div>
                                    <p className="text-xs leading-relaxed text-neutral-500 font-light">
                                        Gunakan kode akses bypass di URL agar Anda atau tim penilai tetap dapat mengunjungi website publik BKA UMRI meskipun sistem dalam mode pemeliharaan.
                                    </p>
                                </div>

                                {/* Custom token input & copy */}
                                <div className="space-y-3.5">
                                    <div className="flex flex-col gap-2.5 sm:flex-row">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-[10px] select-none uppercase font-bold">Kode:</span>
                                            <input
                                                type="text"
                                                value={bypassToken}
                                                onChange={(e) => handleSaveBypassToken(e.target.value)}
                                                placeholder="BKA-SECRET-CODE"
                                                className="w-full border border-neutral-200 rounded-xl pl-14 pr-4 py-2.5 text-xs font-mono font-bold text-neutral-800 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-neutral-50/20"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCopyBypassLink}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 py-2.5 px-4 transition-all outline-none cursor-pointer shrink-0 select-none"
                                            title="Salin tautan dengan bypass parameter"
                                        >
                                            {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                            <span>{isCopied ? 'Tersalin' : 'Salin URL Bypass'}</span>
                                        </button>
                                    </div>

                                    {/* Preview Bypass Link */}
                                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-2.5 font-mono text-[9.5px] text-neutral-500 select-all break-all select-none">
                                        <span className="font-bold text-neutral-400 block mb-1">Tautan Pengujian Bypass:</span>
                                        {getBypassUrl()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Database actions optimizer and backups */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* System Configurations Panel */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4 lg:col-span-1">
                                <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-2.5 select-none">
                                    Konfigurasi Operasional
                                </h3>

                                <div className="space-y-4 text-xs font-medium">
                                    {/* Config Allow Registrations */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5 select-none">
                                            <p className="text-neutral-800 font-bold">Pendaftaran Administrator</p>
                                            <p className="text-[10px] text-neutral-400 font-light">Izinkan pendaftaran admin baru.</p>
                                        </div>
                                        <button
                                            onClick={() => setAllowReg(!allowReg)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                                                allowReg ? "bg-emerald-600" : "bg-neutral-200"
                                            )}
                                        >
                                            <span className={cn(
                                                "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                                allowReg ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    {/* Config CPU Load alerts */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5 select-none">
                                            <p className="text-neutral-800 font-bold">Peringatan Kritis CPU</p>
                                            <p className="text-[10px] text-neutral-400 font-light">Notifikasi email saat beban &gt; 85%.</p>
                                        </div>
                                        <button
                                            onClick={() => setCpuAlerts(!cpuAlerts)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                                                cpuAlerts ? "bg-emerald-600" : "bg-neutral-200"
                                            )}
                                        >
                                            <span className={cn(
                                                "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                                cpuAlerts ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    {/* Config Auto rotation logs */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5 select-none">
                                            <p className="text-neutral-800 font-bold">Rotasi Log Aktivitas</p>
                                            <p className="text-[10px] text-neutral-400 font-light">Pembersihan log otomatis melebihi 100.</p>
                                        </div>
                                        <button
                                            onClick={() => setAutoRotate(!autoRotate)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                                                autoRotate ? "bg-emerald-600" : "bg-neutral-200"
                                            )}
                                        >
                                            <span className={cn(
                                                "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                                autoRotate ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                    <div className="h-px bg-neutral-100" />

                                    {/* Config Dropdown Level */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5 select-none">
                                            <p className="text-neutral-800 font-bold">Tingkat Pencatatan Log</p>
                                            <p className="text-[10px] text-neutral-400 font-light">Verbosity tingkat pelaporan sistem.</p>
                                        </div>
                                        <select
                                            value={logLevel}
                                            onChange={(e) => setLogLevel(e.target.value)}
                                            className="border border-neutral-200 rounded-lg p-1 text-[11px] font-bold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none bg-neutral-50/20 cursor-pointer"
                                        >
                                            <option value="info">INFO</option>
                                            <option value="warning">WARNING</option>
                                            <option value="debug">DEBUG</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Backups & DB optimizer console terminal */}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-5 lg:col-span-2 flex flex-col justify-between">
                                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-3">
                                    <div className="space-y-0.5">
                                        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                                            <Terminal className="size-4.5 text-neutral-700" />
                                            Utas Operasional & Backup Konsol
                                        </h2>
                                        <p className="text-[10px] text-neutral-400 font-light">Monitor keluaran perintah shell cadangan basis data atau defrag SQL.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 select-none">
                                        <button
                                            type="button"
                                            onClick={handleRunOptimization}
                                            disabled={isOptimizing}
                                            className={cn(
                                                "inline-flex items-center justify-center gap-1 rounded-lg text-[10px] font-bold py-1.5 px-3.5 shadow-2xs outline-none transition-all cursor-pointer border",
                                                isOptimizing
                                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200"
                                                    : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                                            )}
                                        >
                                            <RefreshCw size={10} className={isOptimizing ? "animate-spin" : ""} />
                                            <span>Optimasi DB</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRunBackup}
                                            disabled={isOptimizing}
                                            className={cn(
                                                "inline-flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold py-1.5 px-3.5 shadow-2xs outline-none transition-all cursor-pointer",
                                                isOptimizing
                                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                                                    : "bg-[#1B5E20] hover:bg-[#145218] text-white"
                                            )}
                                        >
                                            <Download size={11} />
                                            <span>Buat Backup Basis Data (.sql.gz)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Dark Console Terminal */}
                                <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 font-mono text-[10.5px] text-emerald-400 overflow-y-auto max-h-[170px] space-y-1 relative shadow-inner min-h-[150px] select-all">
                                    {terminalLogs.map((log, i) => {
                                        let color = 'text-emerald-400';
                                        if (log.includes('SQL:')) color = 'text-blue-400';
                                        if (log.includes('INFO:')) color = 'text-yellow-300';
                                        if (log.includes('WARNING:')) color = 'text-red-400 font-bold';
                                        if (log.includes('DONE') || log.includes('OPTIMAL') || log.includes('selesai 100%')) color = 'text-emerald-300 font-bold';
                                        return (
                                            <p key={i} className={color}>{log}</p>
                                        );
                                    })}
                                    <div ref={terminalEndRef} />
                                </div>

                                {/* Progress Bar inside optimize */}
                                {isOptimizing && (
                                    <div className="space-y-1 select-none animate-pulse">
                                        <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
                                            <span>Memproses Pekerjaan Konsol</span>
                                            <span>{optimizeProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-600 transition-all duration-300"
                                                style={{ width: `${optimizeProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: SYSTEM ERROR LOGS */}
                {activeTab === 'errors' && (
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-4 flex flex-col">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 select-none">
                            <div className="space-y-0.5">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                                    <AlertTriangle className="size-4.5 text-red-600" />
                                    Ringkasan Kesalahan Laravel (Laravel Error Logs)
                                </h2>
                                <p className="text-[10px] text-neutral-400 font-light">Catatan pengecualian fatal (*runtime exceptions*) yang dialami sistem.</p>
                            </div>
                            {errors.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handlePurgeErrors}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 text-[10px] font-bold text-red-600 py-1.5 px-3 transition-all outline-none cursor-pointer"
                                >
                                    <Trash2 size={12} />
                                    <span>Bersihkan Error</span>
                                </button>
                            )}
                        </div>

                        {/* Errors List */}
                        <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                            {errors.length > 0 ? (
                                errors.map((err) => {
                                    const isExpanded = expandedError === err.id;
                                    return (
                                        <div
                                            key={err.id}
                                            className={cn(
                                                "rounded-xl border transition-all p-3 space-y-2.5 text-xs text-left",
                                                err.level === 'critical'
                                                    ? "bg-red-50/30 border-red-200/80"
                                                    : (err.level === 'error' ? "bg-amber-50/20 border-amber-200/60" : "bg-neutral-50/30 border-neutral-200/60")
                                            )}
                                        >
                                            <div className="flex items-center justify-between select-none">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                        err.level === 'critical'
                                                            ? "bg-red-100 border-red-200 text-red-700"
                                                            : (err.level === 'error' ? "bg-amber-100 border-amber-200 text-amber-800" : "bg-neutral-100 border-neutral-200 text-neutral-600")
                                                    )}>
                                                        {err.level}
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold text-neutral-800 break-all select-all">{err.exception}</span>
                                                </div>
                                                <span className="text-[10px] text-neutral-400 font-bold whitespace-nowrap">
                                                    {new Date(err.time).toLocaleDateString('id-ID', { dateStyle: 'short' })} · {new Date(err.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </div>

                                            <p className="text-neutral-700 font-semibold leading-relaxed break-all select-all">{err.message}</p>

                                            <div className="pt-0.5 select-none">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedError(isExpanded ? null : err.id)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-neutral-500 hover:text-neutral-800 underline transition-colors cursor-pointer"
                                                >
                                                    {isExpanded ? 'Sembunyikan Jejak Tumpukan (Stack Trace)' : 'Lihat Jejak Tumpukan Lengkap (Stack Trace) →'}
                                                </button>
                                            </div>

                                            {/* Stack Trace Code Box */}
                                            {isExpanded && (
                                                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 font-mono text-[9px] text-red-400 overflow-x-auto leading-normal select-all">
                                                    <pre>{err.stackTrace}</pre>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-xl border-2 border-dashed border-neutral-100 py-16 text-center select-none bg-neutral-50/10">
                                    <CheckCircle className="mx-auto mb-3.5 size-9 text-emerald-500 animate-bounce" />
                                    <h3 className="text-sm font-semibold text-neutral-700">Sistem Berjalan Mulus</h3>
                                    <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400 font-light">
                                        Selamat! Tidak ada kueri tersendat atau kesalahan runtime Laravel yang tercatat saat ini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PerformanceMonitoring.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Diagnostik & Manajemen',
            href: '/admin/monitoring',
        },
    ],
};
