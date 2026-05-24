import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format-date';
import { logActivity } from '@/lib/logger';

interface CMSUser {
    id: string | number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at: string;
}

const INITIAL_USERS: CMSUser[] = [
    {
        id: 'usr-1',
        name: 'Super Admin',
        email: 'admin@bka.umri.ac.id',
        role: 'super_admin',
        is_active: true,
        created_at: '2026-05-01T08:00:00.000Z',
    },
    {
        id: 'usr-2',
        name: 'Admin BKA',
        email: 'staff@bka.umri.ac.id',
        role: 'admin',
        is_active: true,
        created_at: '2026-05-10T09:30:00.000Z',
    },
    {
        id: 'usr-3',
        name: 'Admin Keuangan',
        email: 'keuangan@bka.umri.ac.id',
        role: 'admin',
        is_active: true,
        created_at: '2026-05-15T14:20:00.000Z',
    }
];

export default function UsersIndex() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth.user;
    const isSuperAdmin = currentUser?.roles?.includes('super_admin');

    const [users, setUsers] = useState<CMSUser[]>([]);
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

    // Load users from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bka_users');
            if (saved) {
                try {
                    setUsers(JSON.parse(saved));
                } catch {
                    setUsers(INITIAL_USERS);
                    localStorage.setItem('bka_users', JSON.stringify(INITIAL_USERS));
                }
            } else {
                setUsers(INITIAL_USERS);
                localStorage.setItem('bka_users', JSON.stringify(INITIAL_USERS));
            }
        }
    }, []);

    const saveUsersToLocalStorage = (updatedUsers: CMSUser[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('bka_users', JSON.stringify(updatedUsers));
    };

    // Calculate active users
    const activeUsersCount = users.filter(u => u.is_active).length;
    const isLimitReached = activeUsersCount >= 10;

    // Filtered users
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggle Active status validation
    const handleToggleStatusClick = (userToToggle: CMSUser) => {
        // Safe lock: Cannot deactivate currently logged in user
        if (userToToggle.email === currentUser?.email) {
            toast.error('Operasi Ditolak: Anda tidak dapat menonaktifkan akun Anda sendiri.');
            return;
        }

        // Safe lock: Prevent deactivating the last active super admin
        if (userToToggle.role === 'super_admin' && userToToggle.is_active) {
            const activeSuperAdmins = users.filter(u => u.role === 'super_admin' && u.is_active);
            if (activeSuperAdmins.length <= 1) {
                toast.error(
                    'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).'
                );
                return;
            }
        }

        // Active limit check: Cannot activate if count >= 10 and trying to activate
        if (!userToToggle.is_active && isLimitReached) {
            toast.error('Batas Akun Aktif Terpenuhi: Maksimal 10 akun administrator dapat aktif secara bersamaan.');
            return;
        }

        setStatusConfirm({
            isOpen: true,
            user: userToToggle,
        });
    };

    const confirmToggleStatus = () => {
        if (!statusConfirm.user) return;
        const target = statusConfirm.user;
        const newStatus = !target.is_active;

        const updated = users.map(u => {
            if (u.id === target.id) {
                return { ...u, is_active: newStatus };
            }
            return u;
        });

        saveUsersToLocalStorage(updated);
        setStatusConfirm({ isOpen: false, user: null });
        
        const actionText = newStatus ? 'Mengaktifkan akun pengguna' : 'Menonaktifkan akun pengguna';
        logActivity(actionText, `${target.name} (${target.email})`, 'user');
        
        toast.success(`Akun ${target.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
    };

    // Delete User validation
    const handleDeleteClick = (userToDelete: CMSUser) => {
        // Safe lock: Cannot delete currently logged in user
        if (userToDelete.email === currentUser?.email) {
            toast.error('Operasi Ditolak: Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        // Safe lock: Prevent deleting the last active super admin
        if (userToDelete.role === 'super_admin' && userToDelete.is_active) {
            const activeSuperAdmins = users.filter(u => u.role === 'super_admin' && u.is_active);
            if (activeSuperAdmins.length <= 1) {
                toast.error(
                    'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).'
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
        if (!deleteConfirm.user) return;
        const target = deleteConfirm.user;

        const updated = users.filter(u => u.id !== target.id);
        saveUsersToLocalStorage(updated);
        setDeleteConfirm({ isOpen: false, user: null });

        logActivity('Menghapus akun pengguna', `${target.name} (${target.email})`, 'delete');
        toast.success(`Akun ${target.name} berhasil dihapus permanen.`);
    };

    // If NOT Super Admin, render beautiful forbidden panel
    if (!isSuperAdmin) {
        return (
            <>
                <Head title="Akses Ditolak - Manajemen Pengguna" />
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
                        <p className="text-sm font-light leading-relaxed text-neutral-500">
                            Kelola hak akses administrator portal BKA UMRI, termasuk pembatasan kuota aktif dan perlindungan sistem.
                        </p>
                    </div>

                    <div className="relative group">
                        {isLimitReached ? (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold tracking-wide whitespace-nowrap z-20 shadow-md">
                                <AlertCircle size={10} className="inline mr-1 text-amber-400" />
                                Batas Maksimum 10 Administrator Aktif Tercapai
                            </div>
                        ) : null}
                        
                        <a
                            href={isLimitReached ? undefined : '/admin/users/create'}
                            className={cn(
                                "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold py-3 px-5 transition-all shadow-xs",
                                isLimitReached
                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                                    : "bg-[#1B5E20] hover:bg-[#145218] text-white"
                            )}
                        >
                            <UserPlus size={15} />
                            <span>Tambah Administrator</span>
                            {isLimitReached && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600 text-[9px] font-extrabold uppercase">
                                    Penuh
                                </span>
                            )}
                        </a>
                    </div>
                </div>

                {/* Dashboard Limit & Info Alert */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Limit Indicator Panel */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Kapasitas Administrator Aktif
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-3xl font-extrabold tracking-tight",
                                    activeUsersCount >= 8 ? "text-amber-600" : "text-neutral-800"
                                )}>
                                    {activeUsersCount}
                                </span>
                                <span className="text-sm font-semibold text-neutral-400">
                                    / 10 Akun
                                </span>
                            </div>
                        </div>
                        <div className="size-11 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100">
                            <ShieldCheck className={cn(
                                "size-5",
                                isLimitReached ? "text-red-500" : "text-emerald-600"
                            )} />
                        </div>
                    </div>

                    {/* Safe-Lock Indicator Panel */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between col-span-2">
                        <div className="space-y-1 max-w-md">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Fitur Proteksi Sistem Keamanan
                            </span>
                            <p className="text-xs leading-relaxed font-light text-neutral-500">
                                Sistem menerapkan <strong className="font-semibold text-emerald-800">Safe-Lock</strong> otomatis yang melarang penonaktifan/penghapusan akun Super Admin terakhir yang aktif untuk mencegah kegagalan login administrator global.
                            </p>
                        </div>
                        <div className="size-11 rounded-xl bg-emerald-50/50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-700">
                            <Lock className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email administrator..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none font-medium bg-neutral-50/30"
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
                                    <th className="px-5 py-4">Tanggal Dibuat</th>
                                    <th className="px-5 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((item) => {
                                        const isCurrentUser = item.email === currentUser?.email;
                                        return (
                                            <tr key={item.id} className="hover:bg-neutral-50/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-full bg-[#1B5E20]/5 border border-[#1B5E20]/10 flex items-center justify-center text-[#1B5E20] font-bold text-xs shrink-0 select-none">
                                                            {item.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                                                                <span>{item.name}</span>
                                                                {isCurrentUser && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] text-[#1B5E20] font-extrabold uppercase">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                                        item.role === 'super_admin'
                                                            ? "bg-purple-50 text-purple-700 border-purple-100"
                                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                                    )}>
                                                        <Shield className="size-3" />
                                                        <span>{item.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatusClick(item)}
                                                        className="group flex items-center gap-2 hover:opacity-85 transition-opacity"
                                                        title="Klik untuk mengubah status"
                                                    >
                                                        {item.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                                                                <CheckCircle className="size-4" />
                                                                <span>Aktif</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-neutral-400 font-bold text-xs">
                                                                <XCircle className="size-4" />
                                                                <span>Nonaktif</span>
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-neutral-400">
                                                    {formatDate(item.created_at)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={`/admin/users/${item.id}/edit`}
                                                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Edit data administrator"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                                        <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 font-medium bg-neutral-50/10">
                                            <Users size={32} className="mx-auto text-neutral-300 mb-2.5" />
                                            <p className="text-sm font-semibold text-neutral-700">Administrator Tidak Ditemukan</p>
                                            <p className="text-xs text-neutral-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all animate-in fade-in select-none">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 text-center duration-200">
                        <div className="mx-auto h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-100">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-1">
                            {statusConfirm.user.is_active ? 'Nonaktifkan Akun Administrator?' : 'Aktifkan Akun Administrator?'}
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-500 mb-6 px-2 font-light">
                            Apakah Anda yakin ingin {statusConfirm.user.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun administrator untuk "<strong>{statusConfirm.user.name}</strong>"?
                            {statusConfirm.user.is_active ? ' Pengguna tidak akan dapat mengakses konsol manajemen administrasi portal hingga diaktifkan kembali.' : ' Pengguna akan langsung mendapatkan kembali wewenang untuk login dan mengelola website.'}
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setStatusConfirm({ isOpen: false, user: null })}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className={cn(
                                    "rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none",
                                    statusConfirm.user.is_active
                                        ? "bg-amber-600 hover:bg-amber-700"
                                        : "bg-[#1B5E20] hover:bg-[#145218]"
                                )}
                            >
                                {statusConfirm.user.is_active ? 'Ya, Menonaktifkan' : 'Ya, Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DELETE CONFIRMATION */}
            {deleteConfirm.isOpen && deleteConfirm.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all animate-in fade-in select-none">
                    <div className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xl animate-in zoom-in-95 text-center duration-200">
                        <div className="mx-auto h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100 animate-pulse">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-1">
                            Hapus Administrator?
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-500 mb-6 px-2 font-light">
                            Apakah Anda yakin ingin menghapus akun administrator "<strong>{deleteConfirm.user.name}</strong>" secara permanen?
                            <br />
                            <span className="text-red-600 font-semibold">Tindakan ini tidak dapat dibatalkan</span> dan seluruh akses masuk untuk pengguna ini akan segera dihapus selamanya.
                        </p>
                        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 pt-4">
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, user: null })}
                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors outline-none"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all outline-none"
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
