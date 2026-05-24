import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
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
    Save
} from 'lucide-react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/logger';

interface CMSUser {
    id: string | number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at: string;
}

export default function UserCreate() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'super_admin' | 'admin'>('admin');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Password criteria check
    const criteria = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Calculate score
    const score = Object.values(criteria).filter(Boolean).length;

    // Get strength label & colors
    const getStrengthInfo = () => {
        if (password.length === 0) return { label: 'Kosong', color: 'bg-neutral-200', text: 'text-neutral-400', width: 'w-0' };
        if (score <= 2) return { label: 'Lemah', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/3' };
        if (score <= 4) return { label: 'Sedang', color: 'bg-amber-500', text: 'text-amber-500', width: 'w-2/3' };
        return { label: 'Kuat', color: 'bg-emerald-500', text: 'text-emerald-500', width: 'w-full' };
    };

    const strength = getStrengthInfo();

    // Check capacity limit
    const [isLimitReached, setIsLimitReached] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bka_users');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const activeCount = parsed.filter((u: CMSUser) => u.is_active).length;
                    if (activeCount >= 10) {
                        setIsLimitReached(true);
                    }
                } catch {}
            }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isLimitReached) {
            toast.error('Batas Akun Aktif Terpenuhi: Tidak dapat menambah administrator baru karena kuota 10 akun aktif telah penuh.');
            return;
        }

        if (!name.trim()) {
            toast.error('Nama lengkap wajib diisi!');
            return;
        }

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            toast.error('Format email tidak valid!');
            return;
        }

        if (score < 5) {
            toast.error('Kata sandi harus memenuhi seluruh kriteria keamanan yang ditetapkan!');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Konfirmasi kata sandi tidak cocok!');
            return;
        }

        setIsSaving(true);

        try {
            const saved = localStorage.getItem('bka_users');
            const list = saved ? JSON.parse(saved) : [];

            // Check if email already exists
            if (list.some((u: CMSUser) => u.email.toLowerCase() === email.toLowerCase())) {
                toast.error('Email sudah terdaftar! Gunakan email lain.');
                setIsSaving(false);
                return;
            }

            const newUser: CMSUser = {
                id: 'usr-' + Date.now(),
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role,
                is_active: true, // defaults to active
                created_at: new Date().toISOString()
            };

            const updatedList = [...list, newUser];
            localStorage.setItem('bka_users', JSON.stringify(updatedList));

            logActivity('Membuat akun pengguna', `${newUser.name} (${newUser.email}) - Peran: ${newUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}`, 'user');

            toast.success(`Akun administrator "${newUser.name}" berhasil dibuat!`);
            router.visit('/admin/users');
        } catch {
            toast.error('Gagal menyimpan data administrator.');
            setIsSaving(false);
        }
    };

    // If NOT Super Admin, render beautiful forbidden panel
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Tambah Pengguna" />
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
                                    Halaman Manajemen Pengguna dan Administrator portal BKA hanya dapat diakses oleh akun dengan tingkat wewenang <strong className="font-semibold text-red-700">Super Admin</strong>.
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
            <Head title="Tambah Administrator Baru" />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Back Link */}
                <div>
                    <a
                        href="/admin/users"
                        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
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
                    <p className="text-sm font-light leading-relaxed text-neutral-500">
                        Buat kredensial masuk baru untuk pengelola BKA. Kredensial akan langsung aktif setelah disimpan.
                    </p>
                </div>

                {/* Main Form container */}
                <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 md:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column: Core Fields */}
                        <div className="space-y-5 md:col-span-7">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap staff..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/10"
                                    required
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">Alamat Email *</label>
                                <input
                                    type="email"
                                    placeholder="contoh: staff@bka.umri.ac.id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/10"
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-[10px] text-neutral-400 mt-0.5 leading-normal">
                                    Disarankan menggunakan domain email resmi instansi (@bka.umri.ac.id).
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">Tingkat Hak Akses / Peran *</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'super_admin' | 'admin')}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/10"
                                    disabled={isSaving}
                                >
                                    <option value="admin">Admin Konten Biasa (Mengelola Berita & Bidang)</option>
                                    <option value="super_admin">Super Admin (Akses Penuh Pengaturan & Pengguna)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">Kata Sandi (Password) *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan kata sandi aman..."
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-neutral-200 rounded-xl pl-4 pr-10 py-3 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/10"
                                        required
                                        disabled={isSaving}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 outline-none"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700">Konfirmasi Kata Sandi *</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Ulangi kata sandi di atas..."
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border border-neutral-200 rounded-xl pl-4 pr-10 py-3 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/10"
                                        required
                                        disabled={isSaving}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Password Strength Indicator Checklist */}
                        <div className="space-y-5 md:col-span-5 md:border-l md:border-neutral-100 md:pl-8">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-neutral-800">Kekuatan Kata Sandi</h3>
                                <p className="text-xs font-light text-neutral-500 leading-normal">
                                    Demi standar keamanan audit portal, sandi wajib memenuhi seluruh kriteria berikut:
                                </p>
                            </div>

                            {/* Indicator Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                                    <span className="text-neutral-400">Tingkat Sandi</span>
                                    <span className={strength.text}>{strength.label}</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full transition-all duration-300 rounded-full", strength.color, strength.width)} />
                                </div>
                            </div>

                            {/* Criteria Checklist */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                                        criteria.length
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                    )}>
                                        {criteria.length ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <span className={cn(criteria.length && "text-neutral-800 font-semibold")}>
                                        Minimal 8 Karakter
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                                        criteria.hasUpper
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                    )}>
                                        {criteria.hasUpper ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <span className={cn(criteria.hasUpper && "text-neutral-800 font-semibold")}>
                                        Huruf Besar (A-Z)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                                        criteria.hasLower
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                    )}>
                                        {criteria.hasLower ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <span className={cn(criteria.hasLower && "text-neutral-800 font-semibold")}>
                                        Huruf Kecil (a-z)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                                        criteria.hasNumber
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                    )}>
                                        {criteria.hasNumber ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <span className={cn(criteria.hasNumber && "text-neutral-800 font-semibold")}>
                                        Angka Numerik (0-9)
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-600">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                                        criteria.hasSpecial
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                    )}>
                                        {criteria.hasSpecial ? <Check size={12} /> : <X size={12} />}
                                    </div>
                                    <span className={cn(criteria.hasSpecial && "text-neutral-800 font-semibold")}>
                                        Karakter Khusus (!@#$%)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Submission Actions */}
                        <div className="col-span-12 mt-6 pt-6 border-t border-neutral-100 flex items-center justify-end gap-3.5">
                            <a
                                href="/admin/users"
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={isSaving || isLimitReached}
                                className={cn(
                                    "rounded-xl px-5 py-3 text-xs font-bold text-white shadow-sm transition-all outline-none flex items-center gap-2",
                                    isSaving || isLimitReached
                                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                        : "bg-[#1B5E20] hover:bg-[#145218]"
                                )}
                            >
                                <Save size={14} />
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Kredensial'}</span>
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
