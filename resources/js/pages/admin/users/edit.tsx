import { Head, usePage, useForm } from '@inertiajs/react';
import {
    Users,
    Edit2,
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

interface CMSUser {
    id: string | number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at?: string;
}

interface UserEditProps {
    user: CMSUser;
    isLastActiveSuperAdmin: boolean;
    activeCount: number;
}

export default function UserEdit({
    user,
    isLastActiveSuperAdmin,
    activeCount,
}: UserEditProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
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

    // Safe lock checks
    const isEditingSelf =
        user.email.toLowerCase() === currentUser?.email?.toLowerCase();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.name.trim()) {
            toast.error('Nama lengkap wajib diisi!');

            return;
        }

        if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) {
            toast.error('Format email tidak valid!');

            return;
        }

        // If trying to change role or active status for self
        if (isEditingSelf) {
            if (data.role !== 'super_admin') {
                toast.error(
                    'Operasi Ditolak: Anda tidak dapat menurunkan tingkat peran (demote) akun Anda sendiri.',
                );

                return;
            }

            if (!data.is_active) {
                toast.error(
                    'Operasi Ditolak: Anda tidak dapat menonaktifkan akun Anda sendiri.',
                );

                return;
            }
        }

        // If trying to demote or deactivate the last active super admin
        if (isLastActiveSuperAdmin) {
            // Check if they changed role to admin or set is_active to false
            if (data.role !== 'super_admin' || !data.is_active) {
                toast.error(
                    'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).',
                );

                return;
            }
        }

        // If capacity check is reached when activating
        if (data.is_active && !user.is_active && activeCount >= 10) {
            toast.error(
                'Batas Akun Aktif Terpenuhi: Maksimal 10 akun administrator dapat aktif secara bersamaan.',
            );

            return;
        }

        // If changing password, validate password criteria
        if (data.password.length > 0) {
            if (score < 5) {
                toast.error(
                    'Kata sandi baru harus memenuhi seluruh kriteria keamanan yang ditetapkan!',
                );

                return;
            }

            if (data.password !== data.password_confirmation) {
                toast.error('Konfirmasi kata sandi baru tidak cocok!');

                return;
            }
        }

        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                let logMessage = `Mengubah data administrator ${data.name.trim()} (${data.email.trim()})`;

                if (data.password.length > 0) {
                    logMessage += ' dan melakukan pembaruan kata sandi';
                }

                logActivity(
                    logMessage,
                    `Peran: ${data.role === 'super_admin' ? 'Super Admin' : 'Admin'}, Status: ${data.is_active ? 'Aktif' : 'Nonaktif'}`,
                    'update',
                );

                toast.success(
                    `Data administrator "${data.name}" berhasil diperbarui!`,
                );
            },
            onError: (errors) => {
                const message =
                    Object.values(errors)[0] ||
                    'Gagal memperbarui data administrator.';
                toast.error(message);
            },
        });
    };

    // If NOT Super Admin, render beautiful forbidden panel
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Edit Pengguna" />
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
            <Head title={`Edit Administrator: ${data.name}`} />

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
                            <Edit2 className="size-5" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                            Edit Administrator
                        </h1>
                    </div>
                    <p className="text-sm leading-relaxed font-light text-neutral-500">
                        Sesuaikan detail informasi administrator, peran akses,
                        status akun, atau perbarui kata sandi keamanan.
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
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Tingkat Hak Akses / Peran *
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData(
                                            'role',
                                            e.target.value as
                                                | 'super_admin'
                                                | 'admin',
                                        )
                                    }
                                    className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100/50 px-4 py-3 text-xs font-medium opacity-80 outline-none"
                                    disabled={true}
                                >
                                    <option value="admin">
                                        Admin Konten Biasa (Mengelola Berita &
                                        Bidang)
                                    </option>
                                    <option value="super_admin">
                                        Super Admin (Akses Penuh Pengaturan &
                                        Pengguna)
                                    </option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                                {isEditingSelf ? (
                                    <p className="mt-1 text-[10px] font-bold text-amber-600">
                                        * Anda tidak dapat menurunkan peran
                                        tingkat akses (demote) akun Anda
                                        sendiri.
                                    </p>
                                ) : (
                                    <p className="mt-1 text-[10px] text-neutral-400">
                                        * Peran administrator bersifat readonly
                                        setelah akun dibuat.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Status Akun Administrator *
                                </label>
                                <select
                                    value={
                                        data.is_active ? 'aktif' : 'nonaktif'
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'is_active',
                                            e.target.value === 'aktif',
                                        )
                                    }
                                    className={cn(
                                        'w-full rounded-xl border border-neutral-200 bg-neutral-50/10 px-4 py-3 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600',
                                        isEditingSelf &&
                                            'cursor-not-allowed bg-neutral-100/50 opacity-80',
                                    )}
                                    disabled={processing || isEditingSelf}
                                >
                                    <option value="aktif">
                                        Aktif & Berwenang Login
                                    </option>
                                    <option value="nonaktif">
                                        Nonaktif (Akses Diblokir)
                                    </option>
                                </select>
                                {errors.is_active && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {errors.is_active}
                                    </p>
                                )}
                                {isEditingSelf && (
                                    <p className="mt-1 text-[10px] font-bold text-amber-600">
                                        * Anda tidak dapat menonaktifkan akun
                                        yang saat ini sedang Anda gunakan.
                                    </p>
                                )}
                            </div>

                            {/* Separator */}
                            <div className="my-6 h-px bg-neutral-100" />

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-neutral-800">
                                    Keamanan & Kredensial Baru
                                </h3>
                                <p className="text-xs leading-normal font-light text-neutral-500">
                                    Isi bagian ini hanya jika Anda ingin merubah
                                    sandi login untuk administrator ini.
                                    Kosongkan jika ingin tetap menggunakan sandi
                                    lama.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">
                                    Kata Sandi Baru (Opsional)
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Masukkan kata sandi baru..."
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 py-3 pr-10 pl-4 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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

                            {data.password.length > 0 && (
                                <div className="slide-in-from-top-1.5 animate-in space-y-1.5 duration-200">
                                    <label className="text-sm font-bold text-neutral-700">
                                        Konfirmasi Kata Sandi Baru *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Ulangi kata sandi baru..."
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/10 py-3 pr-10 pl-4 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            required={data.password.length > 0}
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
                            )}
                        </div>

                        {/* Right Column: Password Strength Indicator Checklist */}
                        <div className="space-y-5 md:col-span-5 md:border-l md:border-neutral-100 md:pl-8">
                            {data.password.length > 0 ? (
                                <div className="animate-in space-y-5 duration-200 fade-in">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-neutral-800">
                                            Kekuatan Kata Sandi Baru
                                        </h3>
                                        <p className="text-xs leading-normal font-light text-neutral-500">
                                            Sandi baru wajib memenuhi standar
                                            kriteria di bawah ini:
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
                                                Angka (0-9)
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
                            ) : (
                                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-100 bg-neutral-50/30 p-6 text-center">
                                    <Info className="mb-2 size-6 text-neutral-300" />
                                    <h4 className="text-xs font-bold text-neutral-600">
                                        Kata Sandi Tidak Diubah
                                    </h4>
                                    <p className="mt-1 max-w-[200px] text-[10px] leading-normal font-light text-neutral-400">
                                        Ketikkan sesuatu pada isian Kata Sandi
                                        Baru untuk mengaktifkan indikator
                                        kepatuhan audit keamanan.
                                    </p>
                                </div>
                            )}
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
                                disabled={processing}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-sm transition-all outline-none',
                                    processing
                                        ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                                        : 'bg-[#0a6c32] hover:bg-[#085627]',
                                )}
                            >
                                <Save size={14} />
                                <span>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

UserEdit.layout = {
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
            title: 'Edit Pengguna',
            href: '/admin/users/:id/edit',
        },
    ],
};
