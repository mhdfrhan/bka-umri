import { Head, usePage, Link } from '@inertiajs/react';
import {
    FileText,
    Megaphone,
    MessageSquare,
    Shield,
    Activity,
    Coins,
    FolderOpen,
    CloudSun,
    MoonStar,
    Sun,
    Cloud,
    CloudRain,
    CloudLightning,
    CloudDrizzle,
    Home,
    PlusCircle,
    ArrowRight,
    UserPlus,
    Trash2,
    Edit2,
    Settings,
    Users,
    Calendar,
    TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

interface DashboardProps {
    stats: {
        berita: number;
        pengumuman: number;
        lampiran: number;
        pesan: number;
    };
    activities: Array<{
        id: number;
        time: string;
        user: string;
        role: string;
        action: string;
        target: string;
        type: 'create' | 'update' | 'delete' | 'system' | 'user';
    }>;
    analytics: {
        today: number;
        yesterday: number;
        week: number;
        month: number;
        change_percentage: number;
        chart_data: Array<{
            tanggal: string;
            label: string;
            hari: string;
            hari_lengkap: string;
            kunjungan: number;
        }>;
    };
}

export default function AdminDashboard({
    stats = { berita: 0, pengumuman: 0, lampiran: 0, pesan: 0 },
    activities = [],
    analytics = {
        today: 0,
        yesterday: 0,
        week: 0,
        month: 0,
        change_percentage: 0,
        chart_data: [],
    },
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const isSuperAdmin = user?.roles?.includes('super_admin');

    const [time, setTime] = useState(new Date());
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    const [weather, setWeather] = useState<{
        temp: number;
        text: string;
        isNight: boolean;
        loading: boolean;
    }>({
        temp: 28,
        text: 'Cerah Berawan',
        isNight: new Date().getHours() >= 19 || new Date().getHours() < 6,
        loading: true,
    });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Set current user details in localStorage for client utility
            if (user) {
                localStorage.setItem(
                    'bka_current_user',
                    JSON.stringify({
                        name: user.name,
                        email: user.email,
                        role: isSuperAdmin ? 'super_admin' : 'admin',
                    }),
                );
            }
        }
    }, [user, isSuperAdmin]);

    useEffect(() => {
        let isMounted = true;

        async function fetchWeather() {
            try {
                // Coordinates for Pekanbaru, Riau
                const lat = 0.507;
                const lon = 101.4478;
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code`,
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }

                const data = await res.json();

                if (!data?.current) {
                    throw new Error('Invalid data');
                }

                const temp = Math.round(data.current.temperature_2m);
                const isDay = data.current.is_day === 1;
                const code = data.current.weather_code;

                // Map WMO codes to Indonesian text
                let text = 'Cerah Berawan';

                if (code === 0) {
                    text = 'Cerah';
                } else if (code === 1 || code === 2) {
                    text = 'Cerah Berawan';
                } else if (code === 3) {
                    text = 'Berawan';
                } else if (code >= 45 && code <= 48) {
                    text = 'Berkabut';
                } else if (code >= 51 && code <= 55) {
                    text = 'Gerimis';
                } else if (code >= 61 && code <= 65) {
                    text = 'Hujan';
                } else if (code >= 80 && code <= 82) {
                    text = 'Hujan Deras';
                } else if (code >= 95 && code <= 99) {
                    text = 'Hujan Petir';
                }

                if (isMounted) {
                    setWeather({
                        temp,
                        text,
                        isNight: !isDay,
                        loading: false,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    const currentHour = new Date().getHours();
                    setWeather({
                        temp: 28,
                        text: 'Cerah Berawan',
                        isNight: currentHour >= 19 || currentHour < 6,
                        loading: false,
                    });
                }
            }
        }

        fetchWeather();

        // Refresh weather every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Format time: HH:mm:ss
    const formattedTime = time.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    // Format date: Hari, Tanggal Bulan Tahun
    const formattedDate = time.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const getWeatherIcon = (text: string, isNight: boolean) => {
        if (text === 'Cerah') {
            return isNight ? MoonStar : Sun;
        }

        if (text === 'Cerah Berawan' || text === 'Berawan') {
            return isNight ? MoonStar : CloudSun;
        }

        if (text === 'Gerimis') {
            return CloudDrizzle;
        }

        if (text === 'Hujan' || text === 'Hujan Deras') {
            return CloudRain;
        }

        if (text === 'Hujan Petir') {
            return CloudLightning;
        }

        return Cloud;
    };

    const WeatherIcon = getWeatherIcon(weather.text, weather.isNight);

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Modern Welcoming Card */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-800/10 bg-[radial-gradient(circle_at_80%_20%,#048d46_0%,#0a6c32_100%)] p-6 text-white shadow-lg md:p-8">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:3rem_3rem]" />
                    <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-[100px]" />

                    <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-12">
                        <div className="max-w-2xl space-y-4 md:col-span-8">
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 uppercase backdrop-blur-sm">
                                Selamat Datang
                            </span>
                            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                Halo, {user?.name}
                            </h1>
                            <p className="text-sm leading-relaxed font-light text-emerald-100/90 md:text-base">
                                Anda masuk sebagai{' '}
                                <span className="font-semibold text-white">
                                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                                </span>
                                . Gunakan menu navigasi di sebelah kiri untuk
                                mengelola berita, pengumuman, dokumen, galeri,
                                serta profil BKA BKA Universitas Muhammadiyah
                                Riau secara profesional.
                            </p>
                        </div>

                        {/* Real-time Time, Date & Weather Widget */}
                        <div className="flex flex-col items-center justify-center md:col-span-4 md:items-end">
                            <div className="w-full max-w-[280px] space-y-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xs backdrop-blur-md transition-all duration-300 hover:bg-white/[0.13]">
                                {/* Clock & WIB */}
                                <div className="text-center md:text-right">
                                    <div className="text-2xl font-extrabold tracking-wider text-white tabular-nums md:text-3xl">
                                        {formattedTime}
                                        <span className="ml-1.5 rounded border border-emerald-400/20 bg-emerald-500/35 px-1.5 py-0.5 align-middle text-xs font-semibold text-emerald-100 select-none">
                                            WIB
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs font-semibold tracking-wider text-emerald-100/80 uppercase">
                                        {formattedDate}
                                    </p>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* Weather Status */}
                                <div className="flex items-center justify-between text-xs text-emerald-50/90 select-none">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                                            {weather.loading ? (
                                                <div className="size-3 animate-spin rounded-full border border-white/30 border-t-white" />
                                            ) : (
                                                <WeatherIcon className="size-4 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">
                                                Pekanbaru, Riau
                                            </p>
                                            <p className="text-xs text-emerald-200/80">
                                                {weather.loading
                                                    ? 'Memuat cuaca...'
                                                    : weather.text}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-base font-bold text-white">
                                        {weather.loading
                                            ? '—'
                                            : `${weather.temp}°C`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Statistik */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Stat Card: Berita */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
                                    Berita
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                    {stats.berita}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
                                <FileText className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                            <span>Total artikel terbit</span>
                            <Link
                                href="/admin/berita"
                                className="font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>

                    {/* Stat Card: Pengumuman */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
                                    Pengumuman
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                    {stats.pengumuman}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105">
                                <Megaphone className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                            <span>Informasi penting</span>
                            <Link
                                href="/admin/pengumuman"
                                className="font-semibold text-amber-600 hover:text-amber-700"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>

                    {/* Stat Card: Pesan */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
                                    Pesan Masuk
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                    {stats.pesan}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-transform group-hover:scale-105">
                                <MessageSquare className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                            <span>Belum dibaca</span>
                            <Link
                                href="/admin/settings"
                                className="font-semibold text-teal-600 hover:text-teal-700"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>

                    {/* Stat Card: Lampiran */}
                    <div className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
                                    Lampiran
                                </p>
                                <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                    {stats.lampiran}
                                </p>
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
                                <FolderOpen className="size-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                            <span>Unduhan dokumen</span>
                            <Link
                                href="/admin/dokumen"
                                className="font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Analitik Pengunjung Website (Publik) */}
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-800">
                        <TrendingUp className="size-5 text-emerald-600" />
                        Analitik Pengunjung Website (Publik)
                    </h2>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Bar Chart Container */}
                        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] lg:col-span-2">
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-neutral-700">
                                        Grafik Kunjungan Unik (7 Hari Terakhir)
                                    </h3>
                                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                        Non-Spam / Guest Only
                                    </span>
                                </div>

                                {/* Custom HTML/CSS Bar Chart with SVGs */}
                                <div className="relative mt-8 flex h-64 flex-col justify-end">
                                    {/* Y-Axis Grid Lines */}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                                        {[...Array(5)].map((_, i) => {
                                            const maxVal = Math.max(
                                                ...(
                                                    analytics?.chart_data || []
                                                ).map((d) => d.kunjungan),
                                                10,
                                            );
                                            const val = Math.round(
                                                maxVal - (maxVal / 4) * i,
                                            );
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex h-0 w-full items-center justify-between border-b border-neutral-100/70"
                                                >
                                                    <span className="bg-white pr-2 text-[10px] font-bold text-neutral-400/80 select-none">
                                                        {val}
                                                    </span>
                                                    <div className="flex-1 border-t border-dashed border-neutral-100" />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Bars Container */}
                                    <div className="relative z-10 flex h-48 items-end justify-between px-2">
                                        {(analytics?.chart_data || []).map(
                                            (item, index) => {
                                                const maxVal = Math.max(
                                                    ...(
                                                        analytics?.chart_data ||
                                                        []
                                                    ).map((d) => d.kunjungan),
                                                    10,
                                                );
                                                const heightPercent =
                                                    (item.kunjungan / maxVal) *
                                                    100;
                                                const isHovered =
                                                    hoveredBar === index;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="group relative mx-1 flex flex-1 flex-col items-center"
                                                        onMouseEnter={() =>
                                                            setHoveredBar(index)
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredBar(null)
                                                        }
                                                    >
                                                        {/* Tooltip */}
                                                        <div
                                                            className={cn(
                                                                'pointer-events-none absolute bottom-full z-30 mb-2 flex flex-col items-center transition-all duration-200',
                                                                isHovered
                                                                    ? 'translate-y-0 scale-100 opacity-100'
                                                                    : 'translate-y-1 scale-95 opacity-0',
                                                            )}
                                                        >
                                                            <div className="rounded-lg bg-neutral-800 px-2.5 py-1.5 text-center text-[10px] font-bold whitespace-nowrap text-white shadow-lg">
                                                                <p className="font-semibold text-emerald-300">
                                                                    {
                                                                        item.kunjungan
                                                                    }{' '}
                                                                    Kunjungan
                                                                </p>
                                                                <p className="text-[8px] font-light text-neutral-300">
                                                                    {
                                                                        item.hari_lengkap
                                                                    }
                                                                    ,{' '}
                                                                    {item.label}
                                                                </p>
                                                            </div>
                                                            <div className="-mt-1 h-2 w-2 rotate-45 bg-neutral-800" />
                                                        </div>

                                                        {/* Actual Bar */}
                                                        <div
                                                            className="relative w-full cursor-pointer rounded-t-lg bg-[linear-gradient(to_top,#0a6c32,#4CAF50)] shadow-2xs transition-all duration-300 group-hover:shadow-md sm:w-10"
                                                            style={{
                                                                height: `${Math.max(heightPercent, 3)}%`,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 rounded-t-lg bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>

                                    {/* X-Axis Labels */}
                                    <div className="mt-3 flex justify-between border-t border-neutral-100 px-2 pt-2">
                                        {(analytics?.chart_data || []).map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-1 flex-col items-center text-center select-none"
                                                >
                                                    <span className="text-[10px] font-extrabold text-neutral-700 uppercase">
                                                        {item.hari}
                                                    </span>
                                                    <span className="mt-0.5 text-[8px] font-semibold text-neutral-400">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metric Cards (Side column) */}
                        <div className="flex flex-col justify-between gap-4">
                            {/* Today's visits */}
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all hover:shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Kunjungan Hari Ini
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                            {analytics?.today || 0}
                                        </p>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold',
                                                (analytics?.change_percentage ||
                                                    0) >= 0
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-700',
                                            )}
                                        >
                                            {(analytics?.change_percentage ||
                                                0) >= 0
                                                ? '+'
                                                : ''}
                                            {analytics?.change_percentage || 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Users className="size-5" />
                                </div>
                            </div>

                            {/* Yesterday's visits */}
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all hover:shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Kunjungan Kemarin
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                        {analytics?.yesterday || 0}
                                    </p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Calendar className="size-5" />
                                </div>
                            </div>

                            {/* This week's visits */}
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all hover:shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Minggu Ini
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                        {analytics?.week || 0}
                                    </p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                    <TrendingUp className="size-5" />
                                </div>
                            </div>

                            {/* This month's visits */}
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all hover:shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Bulan Ini
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-neutral-800">
                                        {analytics?.month || 0}
                                    </p>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Activity className="size-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aktivitas Terbaru & Informasi Tambahan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Log Aktivitas */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8 lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-800">
                                <Activity className="size-5 animate-pulse text-emerald-600" />
                                Aktivitas Terbaru
                            </h2>
                            {isSuperAdmin ? (
                                <Link
                                    href="/admin/logs"
                                    className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                                >
                                    Lihat Detail Log &rarr;
                                </Link>
                            ) : (
                                <span className="text-sm font-bold tracking-wider text-neutral-400 uppercase">
                                    Log Keamanan
                                </span>
                            )}
                        </div>

                        {isSuperAdmin ? (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {activities.map((activity, idx) => {
                                        const getIconInfo = (type: string) => {
                                            switch (type) {
                                                case 'create':
                                                    return {
                                                        icon: PlusCircle,
                                                        bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                                    };
                                                case 'update':
                                                    return {
                                                        icon: Edit2,
                                                        bg: 'bg-blue-50 text-blue-600 border-blue-100',
                                                    };
                                                case 'delete':
                                                    return {
                                                        icon: Trash2,
                                                        bg: 'bg-red-50 text-red-600 border-red-100',
                                                    };
                                                case 'user':
                                                    return {
                                                        icon: UserPlus,
                                                        bg: 'bg-purple-50 text-purple-600 border-purple-100',
                                                    };
                                                default:
                                                    return {
                                                        icon: Settings,
                                                        bg: 'bg-amber-50 text-amber-600 border-amber-100',
                                                    };
                                            }
                                        };
                                        const { icon: Icon, bg } = getIconInfo(
                                            activity.type,
                                        );

                                        return (
                                            <li key={activity.id}>
                                                <div className="relative pb-8">
                                                    {idx !==
                                                    activities.length - 1 ? (
                                                        <span
                                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-100"
                                                            aria-hidden="true"
                                                        />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span
                                                                className={cn(
                                                                    'flex h-8.5 w-8.5 items-center justify-center rounded-xl border',
                                                                    bg,
                                                                )}
                                                            >
                                                                <Icon className="size-4" />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                                                            <div>
                                                                <p className="text-sm leading-relaxed font-light text-neutral-600">
                                                                    <strong className="font-semibold text-neutral-800">
                                                                        {
                                                                            activity.user
                                                                        }
                                                                    </strong>{' '}
                                                                    <span className="mr-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-500 uppercase select-none">
                                                                        {
                                                                            activity.role
                                                                        }
                                                                    </span>{' '}
                                                                    {
                                                                        activity.action
                                                                    }{' '}
                                                                    <strong className="font-bold break-all text-emerald-800">
                                                                        "
                                                                        {
                                                                            activity.target
                                                                        }
                                                                        "
                                                                    </strong>
                                                                </p>
                                                            </div>
                                                            <div className="shrink-0 pt-0.5 text-right text-xs font-bold whitespace-nowrap text-neutral-400">
                                                                {formatRelativeDate(
                                                                    activity.time,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-12 text-center">
                                <Shield className="mx-auto mb-3 size-10 text-neutral-300" />
                                <h3 className="text-sm font-semibold text-neutral-700">
                                    Akses Terbatas
                                </h3>
                                <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-400">
                                    Log aktivitas sistem yang sensitif hanya
                                    dapat diakses dan diawasi oleh Super Admin.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Informasi Hak Akses & Tautan Cepat / Sidebar Info */}
                    <div className="space-y-6">
                        {/* Tautan Cepat / Quick Actions */}
                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-800">
                                <PlusCircle className="size-5 text-emerald-600" />
                                Tindakan Cepat
                            </h2>
                            <div className="grid grid-cols-1 gap-2.5">
                                <Link
                                    href="/admin/beranda"
                                    className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition-all duration-200 hover:border-emerald-100 hover:bg-emerald-50/40 hover:text-emerald-900"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                            <Home className="size-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700 transition-colors group-hover:text-emerald-900">
                                            Kelola Beranda
                                        </span>
                                    </div>
                                    <ArrowRight className="size-3.5 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                                </Link>

                                <Link
                                    href="/admin/berita"
                                    className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition-all duration-200 hover:border-emerald-100 hover:bg-emerald-50/40 hover:text-emerald-900"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                            <FileText className="size-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700 transition-colors group-hover:text-emerald-900">
                                            Tulis Berita Baru
                                        </span>
                                    </div>
                                    <ArrowRight className="size-3.5 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                                </Link>

                                <Link
                                    href="/admin/pengumuman"
                                    className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition-all duration-200 hover:border-emerald-100 hover:bg-emerald-50/40 hover:text-emerald-900"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                            <Megaphone className="size-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700 transition-colors group-hover:text-emerald-900">
                                            Buat Pengumuman
                                        </span>
                                    </div>
                                    <ArrowRight className="size-3.5 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                                </Link>
                            </div>
                        </div>

                        {/* Informasi Hak Akses / Sidebar Info */}
                        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                            <div>
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-800">
                                    <Shield className="size-5 text-emerald-600" />
                                    Hak Akses Peran
                                </h2>
                                <p className="mb-4 text-sm leading-relaxed font-light text-neutral-600">
                                    Anda sedang terhubung sebagai pengelola
                                    sistem. Seluruh aktivitas yang Anda lakukan
                                    akan diawasi demi keamanan dan akuntabilitas
                                    sistem.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                        <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-neutral-800">
                                                Status Akun
                                            </p>
                                            <p className="text-neutral-500">
                                                Aktif & Terverifikasi
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                        <div className="size-2 rounded-full bg-amber-500" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-neutral-800">
                                                Tingkat Hak Akses
                                            </p>
                                            <p className="text-neutral-500">
                                                {isSuperAdmin
                                                    ? 'Akses Penuh (Super)'
                                                    : 'Akses Konten'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Super Admin Quick Warning */}
                {isSuperAdmin && (
                    <div className="flex items-start gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                        <Shield className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-amber-900">
                                Konsol Pengawasan Super Admin
                            </h3>
                            <p className="text-sm leading-relaxed font-light text-amber-700">
                                Sebagai Super Admin, Anda memiliki hak penuh
                                untuk mengkonfigurasi sistem informasi, membuat
                                serta memoderasi akun pengguna/admin biasa, dan
                                mengakses log analitik sistem yang dilindungi.
                                Gunakan wewenang ini dengan penuh tanggung
                                jawab.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
