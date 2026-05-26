import { Head, usePage, router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Shield,
    ShieldAlert,
    UserCheck,
    UserX,
    Lock,
    Search,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Info,
    AlertCircle,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format-date';
import { logActivity } from '@/lib/logger';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

interface CMSUser {
    id: string | number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at: string;
}

export default function UsersIndex({ users }: { users: CMSUser[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusConfirm, setStatusConfirm] = useState<{
        isOpen: boolean;
        user: CMSUser | null;
    }>({
        isOpen: false,
        user: null,
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        user: CMSUser | null;
    }>({
        isOpen: false,
        user: null,
    });

    // Calculate active users
    const activeUsersCount = users.filter((u) => u.is_active).length;
    const isLimitReached = activeUsersCount >= 10;

    // Filtered users
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Toggle Active status validation
    const handleToggleStatusClick = (userToToggle: CMSUser) => {
        // Safe lock: Cannot deactivate currently logged in user
        if (userToToggle.email === currentUser?.email) {
            toast.error(
                'Operasi Ditolak: Anda tidak dapat menonaktifkan akun Anda sendiri.',
            );

            return;
        }

        // Safe lock: Prevent deactivating the last active super admin
        if (userToToggle.role === 'super_admin' && userToToggle.is_active) {
            const activeSuperAdmins = users.filter(
                (u) => u.role === 'super_admin' && u.is_active,
            );

            if (activeSuperAdmins.length <= 1) {
                toast.error(
                    'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).',
                );

                return;
            }
        }

        // Active limit check: Cannot activate if count >= 10 and trying to activate
        if (!userToToggle.is_active && isLimitReached) {
            toast.error(
                'Batas Akun Aktif Terpenuhi: Maksimal 10 akun administrator dapat aktif secara bersamaan.',
            );

            return;
        }

        setStatusConfirm({
            isOpen: true,
            user: userToToggle,
        });
    };

    const confirmToggleStatus = () => {
        if (!statusConfirm.user) {
            return;
        }

        const target = statusConfirm.user;
        const newStatus = !target.is_active;

        router.put(
            `/admin/users/${target.id}`,
            {
                name: target.name,
                email: target.email,
                role: target.role,
                is_active: newStatus,
            },
            {
                onSuccess: () => {
                    setStatusConfirm({ isOpen: false, user: null });
                    const actionText = newStatus
                        ? 'Mengaktifkan akun pengguna'
                        : 'Menonaktifkan akun pengguna';
                    logActivity(
                        actionText,
                        `${target.name} (${target.email})`,
                        'user',
                    );
                    toast.success(
                        `Akun ${target.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
                    );
                },
                onError: (errors) => {
                    const message =
                        Object.values(errors)[0] ||
                        'Gagal mengubah status akun.';
                    toast.error(message);
                },
            },
        );
    };

    // Delete User validation
    const handleDeleteClick = (userToDelete: CMSUser) => {
        // Safe lock: Cannot delete currently logged in user
        if (userToDelete.email === currentUser?.email) {
            toast.error(
                'Operasi Ditolak: Anda tidak dapat menghapus akun Anda sendiri.',
            );

            return;
        }

        // Safe lock: Prevent deleting the last active super admin
        if (userToDelete.role === 'super_admin' && userToDelete.is_active) {
            const activeSuperAdmins = users.filter(
                (u) => u.role === 'super_admin' && u.is_active,
            );

            if (activeSuperAdmins.length <= 1) {
                toast.error(
                    'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).',
                );

                return;
            }
        }

        setDeleteConfirm({
            isOpen: true,
            user: userToDelete,
        });
    };

    const confirmDeleteUser = () => {
        if (!deleteConfirm.user) {
            return;
        }

        const target = deleteConfirm.user;

        router.delete(`/admin/users/${target.id}`, {
            onSuccess: () => {
                setDeleteConfirm({ isOpen: false, user: null });
                logActivity(
                    'Menghapus akun pengguna',
                    `${target.name} (${target.email})`,
                    'delete',
                );
                toast.success(`Akun ${target.name} berhasil dihapus permanen.`);
            },
            onError: (errors) => {
                const message =
                    Object.values(errors)[0] || 'Gagal menghapus akun.';
                toast.error(message);
            },
        });
    };

    // If NOT Super Admin, render beautiful forbidden panel
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Manajemen Pengguna" />
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
            <Head title="Manajemen Pengguna" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Users className="size-5" />
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 md:text-3xl">
                                Manajemen Pengguna
                            </h1>
                        </div>
                        <p className="text-sm leading-relaxed font-light text-neutral-500">
                            Kelola hak akses administrator portal BKA UMRI,
                            termasuk pembatasan kuota aktif dan perlindungan
                            sistem.
                        </p>
                    </div>

                    <div className="group relative">
                        {isLimitReached ? (
                            <div className="absolute -top-10 left-1/2 z-20 hidden -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-1.5 text-[10px] font-bold tracking-wide whitespace-nowrap text-white shadow-md group-hover:block">
                                <AlertCircle
                                    size={10}
                                    className="mr-1 inline text-amber-400"
                                />
                                Batas Maksimum 10 Administrator Aktif Tercapai
                            </div>
                        ) : null}

                        <a
                            href={
                                isLimitReached
                                    ? undefined
                                    : '/admin/users/create'
                            }
                            className={cn(
                                'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold shadow-xs transition-all',
                                isLimitReached
                                    ? 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
                                    : 'bg-[#1B5E20] text-white hover:bg-[#145218]',
                            )}
                        >
                            <UserPlus size={15} />
                            <span>Tambah Administrator</span>
                            {isLimitReached && (
                                <span className="ml-1 rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-extrabold text-neutral-600 uppercase">
                                    Penuh
                                </span>
                            )}
                        </a>
                    </div>
                </div>

                {/* Dashboard Limit & Info Alert */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Limit Indicator Panel */}
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Kapasitas Administrator Aktif
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span
                                    className={cn(
                                        'text-3xl font-extrabold tracking-tight',
                                        activeUsersCount >= 8
                                            ? 'text-amber-600'
                                            : 'text-neutral-800',
                                    )}
                                >
                                    {activeUsersCount}
                                </span>
                                <span className="text-sm font-semibold text-neutral-400">
                                    / 10 Akun
                                </span>
                            </div>
                        </div>
                        <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50">
                            <ShieldCheck
                                className={cn(
                                    'size-5',
                                    isLimitReached
                                        ? 'text-red-500'
                                        : 'text-emerald-600',
                                )}
                            />
                        </div>
                    </div>

                    {/* Safe-Lock Indicator Panel */}
                    <div className="col-span-2 flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <div className="max-w-md space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                Fitur Proteksi Sistem Keamanan
                            </span>
                            <p className="text-xs leading-relaxed font-light text-neutral-500">
                                Sistem menerapkan{' '}
                                <strong className="font-semibold text-emerald-800">
                                    Safe-Lock
                                </strong>{' '}
                                otomatis yang melarang penonaktifan/penghapusan
                                akun Super Admin terakhir yang aktif untuk
                                mencegah kegagalan login administrator global.
                            </p>
                        </div>
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/50 text-emerald-700">
                            <Lock className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email administrator..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/30 py-2.5 pr-4 pl-10 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                        </div>

                        <div className="shrink-0 text-xs font-bold text-neutral-400">
                            Menampilkan {filteredUsers.length} Pengguna
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-xl border border-neutral-100">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs font-bold text-neutral-400 uppercase select-none">
                                    <th className="px-5 py-4">Administrator</th>
                                    <th className="px-5 py-4">Tingkat Peran</th>
                                    <th className="px-5 py-4">Status Akun</th>
                                    <th className="px-5 py-4">
                                        Tanggal Dibuat
                                    </th>
                                    <th className="px-5 py-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((item) => {
                                        const isCurrentUser =
                                            item.email === currentUser?.email;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="transition-colors hover:bg-neutral-50/30"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#1B5E20]/10 bg-[#1B5E20]/5 text-xs font-bold text-[#1B5E20] select-none">
                                                            {item.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="flex items-center gap-1.5 font-bold text-neutral-800">
                                                                <span>
                                                                    {item.name}
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-[#1B5E20] uppercase">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="mt-0.5 truncate text-[10px] text-neutral-400">
                                                                {item.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase',
                                                            item.role ===
                                                                'super_admin'
                                                                ? 'border-purple-100 bg-purple-50 text-purple-700'
                                                                : 'border-blue-100 bg-blue-50 text-blue-700',
                                                        )}
                                                    >
                                                        <Shield className="size-3" />
                                                        <span>
                                                            {item.role ===
                                                            'super_admin'
                                                                ? 'Super Admin'
                                                                : 'Admin'}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatusClick(
                                                                item,
                                                            )
                                                        }
                                                        className="group flex items-center gap-2 transition-opacity hover:opacity-85"
                                                        title="Klik untuk mengubah status"
                                                    >
                                                        {item.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                                                <CheckCircle className="size-4" />
                                                                <span>
                                                                    Aktif
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                                                                <XCircle className="size-4" />
                                                                <span>
                                                                    Nonaktif
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-neutral-400">
                                                    {formatDate(
                                                        item.created_at,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={`/admin/users/${item.id}/edit`}
                                                            className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                                                            title="Edit data administrator"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    item,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600"
                                                            title="Hapus administrator secara permanen"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="bg-neutral-50/10 px-5 py-12 text-center font-medium text-neutral-400"
                                        >
                                            <Users
                                                size={32}
                                                className="mx-auto mb-2.5 text-neutral-300"
                                            />
                                            <p className="text-sm font-semibold text-neutral-700">
                                                Administrator Tidak Ditemukan
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-400">
                                                Coba sesuaikan kata kunci
                                                pencarian Anda.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL: TOGGLE STATUS CONFIRMATION */}
            {statusConfirm.isOpen && statusConfirm.user && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                    <div className="w-full max-w-sm animate-in rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-neutral-950">
                            {statusConfirm.user.is_active
                                ? 'Nonaktifkan Akun Administrator?'
                                : 'Aktifkan Akun Administrator?'}
                        </h3>
                        <p className="mb-6 px-2 text-xs leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin{' '}
                            {statusConfirm.user.is_active
                                ? 'menonaktifkan'
                                : 'mengaktifkan'}{' '}
                            akun administrator untuk "
                            <strong>{statusConfirm.user.name}</strong>"?
                            {statusConfirm.user.is_active
                                ? ' Pengguna tidak akan dapat mengakses konsol manajemen administrasi portal hingga diaktifkan kembali.'
                                : ' Pengguna akan langsung mendapatkan kembali wewenang untuk login dan mengelola website.'}
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() =>
                                    setStatusConfirm({
                                        isOpen: false,
                                        user: null,
                                    })
                                }
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className={cn(
                                    'rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none',
                                    statusConfirm.user.is_active
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-[#1B5E20] hover:bg-[#145218]',
                                )}
                            >
                                {statusConfirm.user.is_active
                                    ? 'Ya, Menonaktifkan'
                                    : 'Ya, Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE CONFIRMATION */}
            {deleteConfirm.isOpen && deleteConfirm.user && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                    <div className="w-full max-w-sm animate-in rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-2xl duration-200 zoom-in-95">
                        <div className="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-neutral-950">
                            Hapus Administrator?
                        </h3>
                        <p className="mb-6 px-2 text-xs leading-relaxed font-light text-neutral-500">
                            Apakah Anda yakin ingin menghapus akun administrator
                            "<strong>{deleteConfirm.user.name}</strong>" secara
                            permanen?
                            <br />
                            <span className="font-semibold text-red-600">
                                Tindakan ini tidak dapat dibatalkan
                            </span>{' '}
                            dan seluruh akses masuk untuk pengguna ini akan
                            segera dihapus selamanya.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() =>
                                    setDeleteConfirm({
                                        isOpen: false,
                                        user: null,
                                    })
                                }
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none hover:bg-red-700"
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

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Pengguna',
            href: '/admin/users',
        },
    ],
};
