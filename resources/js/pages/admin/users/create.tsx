import { Head, usePage, useForm } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Shield,
    ShieldAlert,
    ArrowLeft,
    Check,
    X,
    Eye,
    EyeOff,
    Info,
    AlertCircle,
    Save,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { logActivity } from '@/lib/logger';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

export default function UserCreate({ activeCount }: { activeCount: number }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'admin' as 'super_admin' | 'admin',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password criteria check
    const criteria = {
        length: data.password.length >= 8,
        hasUpper: /[A-Z]/.test(data.password),
        hasLower: /[a-z]/.test(data.password),
        hasNumber: /[0-9]/.test(data.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
    };

    // Calculate score
    const score = Object.values(criteria).filter(Boolean).length;

    // Get strength label & colors
    const getStrengthInfo = () => {
        if (data.password.length === 0) {
            return {
                label: 'Kosong',
                color: 'bg-neutral-200',
                text: 'text-neutral-400',
                width: 'w-0',
            };
        }

        if (score <= 2) {
            return {
                label: 'Lemah',
                color: 'bg-red-500',
                text: 'text-red-500',
                width: 'w-1/3',
            };
        }

        if (score <= 4) {
            return {
                label: 'Sedang',
                color: 'bg-amber-500',
                text: 'text-amber-500',
                width: 'w-2/3',
            };
        }

        return {
            label: 'Kuat',
            color: 'bg-emerald-500',
            text: 'text-emerald-500',
            width: 'w-full',
        };
    };

    const strength = getStrengthInfo();

    const isLimitReached = activeCount >= 10;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isLimitReached) {
            toast.error(
                'Batas Akun Aktif Terpenuhi: Tidak dapat menambah administrator baru karena kuota 10 akun aktif telah penuh.',
            );

            return;
        }

        if (!data.name.trim()) {
            toast.error('Nama lengkap wajib diisi!');

            return;
        }

        if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) {
            toast.error('Format email tidak valid!');

            return;
        }

        if (score < 5) {
            toast.error(
                'Kata sandi harus memenuhi seluruh kriteria keamanan yang ditetapkan!',
            );

            return;
        }

        if (data.password !== data.password_confirmation) {
            toast.error('Konfirmasi kata sandi tidak cocok!');

            return;
        }

        post('/admin/users', {
            onSuccess: () => {
                logActivity(
                    'Membuat akun pengguna',
                    `${data.name.trim()} (${data.email.trim().toLowerCase()}) - Peran: ${data.role === 'super_admin' ? 'Super Admin' : 'Admin'}`,
                    'user',
                );
                toast.success(
                    `Akun administrator "${data.name.trim()}" berhasil dibuat!`,
                );
            },
            onError: (errors) => {
                const message =
                    Object.values(errors)[0] ||
                    'Gagal menyimpan data administrator.';
                toast.error(message);
            },
        });
    };

    // If NOT Super Admin, render beautiful forbidden panel
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Tambah Pengguna" />
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
                                    Halaman Manajemen Pengguna dan Administrator
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
            <Head title="Tambah Administrator Baru" />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Back Link */}
                <div>
                    <a
                        href="/admin/users"
                        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke Daftar Pengguna</span>
                    </a>
                </div>

                {/* Header Title */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <UserPlus className="size-5" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                            Tambah Administrator Baru
                        </h1>
                    </div>
                    <p className="text-sm leading-relaxed font-light text-neutral-500">
                        Buat kredensial masuk baru untuk pengelola BKA.
                        Kredensial akan langsung aktif setelah disimpan.
                    </p>
                </div>

                {/* Main Form container */}
                <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-8 md:grid-cols-12"
                    >
                        {/* Left Column: Core Fields */}
                        <div className="space-y-5 md:col-span-7">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap staff..."
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    required
                                    disabled={processing}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Alamat Email *
                                </label>
                                <input
                                    type="email"
                                    placeholder="contoh: staff@bka.umri.ac.id"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    required
                                    disabled={processing}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                                <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                    Disarankan menggunakan domain email resmi
                                    instansi (@bka.umri.ac.id).
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Tingkat Hak Akses / Peran *
                                </label>
                                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100/50 px-4 py-3 text-xs font-medium text-neutral-500">
                                    <Shield
                                        size={14}
                                        className="text-emerald-600"
                                    />
                                    <span>
                                        Admin Konten Biasa (Mengelola Berita,
                                        Bidang & Lampiran)
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                    Peran Super Admin tidak dapat dibuat melalui
                                    UI demi alasan keamanan (hanya via
                                    CLI/seeder).
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Kata Sandi (Password) *
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Masukkan kata sandi aman..."
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 py-3 pr-10 pl-4 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        required
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 outline-none hover:text-neutral-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Konfirmasi Kata Sandi *
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        placeholder="Ulangi kata sandi di atas..."
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 py-3 pr-10 pl-4 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        required
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 outline-none hover:text-neutral-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Password Strength Indicator Checklist */}
                        <div className="space-y-5 md:col-span-5 md:border-l md:border-neutral-100 md:pl-8">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-neutral-800">
                                    Kekuatan Kata Sandi
                                </h3>
                                <p className="text-xs leading-normal font-light text-neutral-500">
                                    Demi standar keamanan audit portal, sandi
                                    wajib memenuhi seluruh kriteria berikut:
                                </p>
                            </div>

                            {/* Indicator Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                                    <span className="text-neutral-400">
                                        Tingkat Sandi
                                    </span>
                                    <span className={strength.text}>
                                        {strength.label}
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-300',
                                            strength.color,
                                            strength.width,
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Criteria Checklist */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            criteria.length
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-300',
                                        )}
                                    >
                                        {criteria.length ? (
                                            <Check size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            criteria.length &&
                                                'font-semibold text-neutral-800',
                                        )}
                                    >
                                        Minimal 8 Karakter
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            criteria.hasUpper
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-300',
                                        )}
                                    >
                                        {criteria.hasUpper ? (
                                            <Check size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            criteria.hasUpper &&
                                                'font-semibold text-neutral-800',
                                        )}
                                    >
                                        Huruf Besar (A-Z)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            criteria.hasLower
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-300',
                                        )}
                                    >
                                        {criteria.hasLower ? (
                                            <Check size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            criteria.hasLower &&
                                                'font-semibold text-neutral-800',
                                        )}
                                    >
                                        Huruf Kecil (a-z)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            criteria.hasNumber
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-300',
                                        )}
                                    >
                                        {criteria.hasNumber ? (
                                            <Check size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            criteria.hasNumber &&
                                                'font-semibold text-neutral-800',
                                        )}
                                    >
                                        Angka Numerik (0-9)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            criteria.hasSpecial
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                                : 'border-neutral-100 bg-neutral-50 text-neutral-300',
                                        )}
                                    >
                                        {criteria.hasSpecial ? (
                                            <Check size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            criteria.hasSpecial &&
                                                'font-semibold text-neutral-800',
                                        )}
                                    >
                                        Karakter Khusus (!@#$%)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Submission Actions */}
                        <div className="col-span-12 mt-6 flex items-center justify-end gap-3.5 border-t border-neutral-100 pt-6">
                            <a
                                href="/admin/users"
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={processing || isLimitReached}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-sm transition-all outline-none',
                                    processing || isLimitReached
                                        ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                                        : 'bg-[#1B5E20] hover:bg-[#145218]',
                                )}
                            >
                                <Save size={14} />
                                <span>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Kredensial'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

UserCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Pengguna',
            href: '/admin/users',
        },
        {
            title: 'Tambah Pengguna',
            href: '/admin/users/create',
        },
    ],
};
