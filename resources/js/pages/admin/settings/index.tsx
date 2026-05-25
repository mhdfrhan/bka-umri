import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Settings2,
    Mail,
    Share2,
    Info,
    Save,
    Plus,
    Trash2,
    ShieldAlert,
    MailOpen,
    Search,
    Globe,
    MapPin,
    Phone,
    Clock,
    Sparkles,
    CheckCircle,
    User,
    Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format-date';

interface MediaSosialItem {
    platform: string;
    url: string;
}

interface WebSettings {
    alamat: string;
    telepon: string;
    email: string;
    jam_operasional: string;
    google_maps_embed: string;
    mediaSosial: MediaSosialItem[];
    nama_website: string;
    deskripsi_seo: string;
    logo_base64?: string;
    favicon_base64?: string;
}

interface InboxMessage {
    id: string;
    nama: string;
    email: string;
    subjek: string;
    pesan: string;
    tanggal: string;
    dibaca: boolean;
}

const DEFAULT_SETTINGS: WebSettings = {
    alamat: 'Ruang Biro Keuangan dan Aset, Gedung Rektorat Universitas Muhammadiyah Riau\nJl. T. Tambusai, Kota Pekanbaru',
    telepon: '+62 761 35008 / +62 811-7676-000',
    email: 'bka@umri.ac.id',
    jam_operasional: 'Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB',
    google_maps_embed:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4167965592992!2d101.41546138047615!3d0.49870495320004715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a940e01df989%3A0xdc96c279c6f07bc3!2sUniversitas%20Muhammadiyah%20Riau!5e0!3m2!1sid!2sid!4v1779673086975!5m2!1sid!2sid',
    mediaSosial: [
        { platform: 'Facebook', url: 'https://facebook.com/umri.official' },
        { platform: 'Instagram', url: 'https://instagram.com/umri.official' },
        { platform: 'YouTube', url: 'https://youtube.com' },
        { platform: 'Twitter', url: 'https://twitter.com' },
    ],
    nama_website: 'Biro Keuangan & Aset UMRI',
    deskripsi_seo:
        'Portal Resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau - Pelayanan SPP Online, Surat Dispensasi, SOP, dan Informasi Keuangan Kampus.',
};

const INITIAL_MESSAGES: InboxMessage[] = [
    {
        id: 'msg-1',
        nama: 'Fahri Al-Hafizh',
        email: 'fahri.hafizh@student.umri.ac.id',
        subjek: 'Pertanyaan Pembayaran SPP Cicilan Kedua',
        pesan: 'Assalamualaikum wr. wb., admin saya ingin menanyakan mengenai batas akhir pelunasan angsuran cicilan kedua SPP semester genap. Apakah ada dispensasi tambahan waktu untuk mahasiswa semester akhir? Terima kasih.',
        tanggal: '2026-05-24T14:30:00Z',
        dibaca: false,
    },
    {
        id: 'msg-2',
        nama: 'Lutfi Hakim',
        email: 'lutfi.hakim@gmail.com',
        subjek: 'Saran Sistem Pengajuan Dispensasi Online',
        pesan: 'Sistem pengajuan dispensasi online sangat membantu kami yang bekerja sehingga tidak perlu bolak-balik antre berkas fisik di loket. Terima kasih BKA UMRI atas inovasinya, semoga performa server semakin stabil ke depannya.',
        tanggal: '2026-05-23T09:15:00Z',
        dibaca: true,
    },
    {
        id: 'msg-3',
        nama: 'Siti Rahmawati',
        email: 'siti.rahma@partner.umri.ac.id',
        subjek: 'Konfirmasi MoU Kerja Sama Pembayaran Kemitraan',
        pesan: 'Selamat pagi admin BKA, kami dari perwakilan Bank Syariah ingin menanyakan tindak lanjut draf dokumen kerja sama virtual account penerimaan mahasiswa baru yang kami serahkan minggu lalu. Terima kasih.',
        tanggal: '2026-05-21T11:45:00Z',
        dibaca: true,
    },
];

export default function WebSettingsCMS() {
    const { auth } = usePage().props as any;

    // Auth authorization check: Super Admin check
    const isSuperAdmin =
        auth?.user?.roles?.includes('super_admin') ||
        auth?.user?.role === 'super_admin' ||
        false;

    // Tabs navigation: 'kontak', 'sosmed', 'sistem', 'inbox'
    const [activeTab, setActiveTab] = useState<
        'kontak' | 'sosmed' | 'sistem' | 'inbox'
    >('kontak');

    // States
    const [settings, setSettings] = useState<WebSettings>(DEFAULT_SETTINGS);
    const [inbox, setInbox] = useState<InboxMessage[]>([]);
    const [inboxSearch, setInboxSearch] = useState<string>('');
    const [inboxFilter, setInboxFilter] = useState<'all' | 'unread'>('all');
    const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(
        null,
    );

    // Initial Hydration from local storage
    useEffect(() => {
        const savedSettings = localStorage.getItem('bka_settings');
        const savedInbox = localStorage.getItem('bka_pesan');

        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch {
                setSettings(DEFAULT_SETTINGS);
            }
        } else {
            setSettings(DEFAULT_SETTINGS);
            localStorage.setItem(
                'bka_settings',
                JSON.stringify(DEFAULT_SETTINGS),
            );
        }

        if (savedInbox) {
            try {
                setInbox(JSON.parse(savedInbox));
            } catch {
                setInbox(INITIAL_MESSAGES);
            }
        } else {
            setInbox(INITIAL_MESSAGES);
            localStorage.setItem('bka_pesan', JSON.stringify(INITIAL_MESSAGES));
        }
    }, []);

    // Save settings helper
    const handleSaveSettings = (
        updated: WebSettings,
        message = 'Pengaturan berhasil diperbarui',
    ) => {
        setSettings(updated);
        localStorage.setItem('bka_settings', JSON.stringify(updated));
        toast.success(message);
    };

    // Save inbox helper
    const handleSaveInbox = (updated: InboxMessage[]) => {
        setInbox(updated);
        localStorage.setItem('bka_pesan', JSON.stringify(updated));
    };

    // Tab 1: Save Contact Info
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveSettings(
            settings,
            'Informasi kontak kantor berhasil diperbarui',
        );
    };

    // Tab 2: Sosmed Repeater handlers
    const handleSosmedChange = (
        index: number,
        field: keyof MediaSosialItem,
        value: string,
    ) => {
        const updatedSosmed = [...settings.mediaSosial];
        updatedSosmed[index] = { ...updatedSosmed[index], [field]: value };
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
    };

    const handleAddSosmed = () => {
        const updatedSosmed = [
            ...settings.mediaSosial,
            { platform: 'Instagram', url: '' },
        ];
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
    };

    const handleRemoveSosmed = (index: number) => {
        const updatedSosmed = settings.mediaSosial.filter(
            (_, idx) => idx !== index,
        );
        setSettings((prev) => ({ ...prev, mediaSosial: updatedSosmed }));
        toast.info('Tautan media sosial dihapus dari draf');
    };

    const handleSosmedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveSettings(
            settings,
            'Tautan media sosial resmi berhasil diperbarui',
        );
    };

    // Tab 3: System settings image upload to Base64
    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'logo_base64' | 'favicon_base64',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation limits
        const limitSize = field === 'logo_base64' ? 500 * 1024 : 100 * 1024;
        if (file.size > limitSize) {
            toast.error(
                `Ukuran berkas melebihi batas (${field === 'logo_base64' ? '500 KB' : '100 KB'})`,
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setSettings((prev) => ({ ...prev, [field]: base64 }));
            toast.success('Gambar berhasil dipilih, silakan klik Simpan');
        };
        reader.readAsDataURL(file);
    };

    const handleSystemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            toast.error(
                'Hanya Super Admin yang diizinkan memperbarui pengaturan sistem',
            );
            return;
        }
        handleSaveSettings(
            settings,
            'Konfigurasi identitas sistem & SEO berhasil diperbarui',
        );
    };

    // Tab 4: Inbox handlers
    const handleOpenMessage = (msg: InboxMessage) => {
        setActiveMessage(msg);

        // Mark read automatically
        if (!msg.dibaca) {
            const updated = inbox.map((m) =>
                m.id === msg.id ? { ...m, dibaca: true } : m,
            );
            handleSaveInbox(updated);
        }
    };

    const handleToggleReadStatus = (msgId: string, currentStatus: boolean) => {
        const updated = inbox.map((m) =>
            m.id === msgId ? { ...m, dibaca: !currentStatus } : m,
        );
        handleSaveInbox(updated);
        toast.success(
            currentStatus
                ? 'Pesan ditandai sebagai belum dibaca'
                : 'Pesan ditandai sebagai sudah dibaca',
        );

        if (activeMessage && activeMessage.id === msgId) {
            setActiveMessage((prev) =>
                prev ? { ...prev, dibaca: !currentStatus } : null,
            );
        }
    };

    const handleDeleteMessage = (msgId: string) => {
        const updated = inbox.filter((m) => m.id !== msgId);
        handleSaveInbox(updated);
        toast.success('Pesan berhasil dihapus dari kotak masuk');
        setActiveMessage(null);
    };

    // Filter and search inbox
    const filteredInbox = inbox.filter((msg) => {
        const matchesSearch =
            msg.nama.toLowerCase().includes(inboxSearch.toLowerCase()) ||
            msg.email.toLowerCase().includes(inboxSearch.toLowerCase()) ||
            msg.subjek.toLowerCase().includes(inboxSearch.toLowerCase()) ||
            msg.pesan.toLowerCase().includes(inboxSearch.toLowerCase());

        const matchesFilter = inboxFilter === 'all' ? true : !msg.dibaca;

        return matchesSearch && matchesFilter;
    });

    const unreadCount = inbox.filter((m) => !m.dibaca).length;

    return (
        <>
            <Head title="Pengaturan Web & Inbox - Admin BKA" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header section */}
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <Settings2 className="text-[#1B5E20]" size={28} />
                            Pengaturan Web & Inbox Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Kelola profil kontak kantor BKA, tautan sosial
                            media, sistem SEO, dan kelola pesan kontak masuk
                            (inbox).
                        </p>
                    </div>
                </div>

                {/* Dashboard layout with Glassmorphic Tab Selector & Panel */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left vertical tab selectors (3/12 width equivalent) */}
                    <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                        <button
                            onClick={() => setActiveTab('kontak')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'kontak'
                                    ? 'border-[#1B5E20] bg-emerald-50/20 text-[#1B5E20] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <MapPin size={16} />
                            <span>Informasi Kontak</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sosmed')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'sosmed'
                                    ? 'border-[#1B5E20] bg-emerald-50/20 text-[#1B5E20] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Share2 size={16} />
                            <span>Media Sosial</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sistem')}
                            className={`flex w-full items-center justify-between rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'sistem'
                                    ? 'border-[#1B5E20] bg-emerald-50/20 text-[#1B5E20] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Globe size={16} />
                                <span>Pengaturan Sistem</span>
                            </div>
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 uppercase">
                                Super
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`flex w-full items-center justify-between rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'inbox'
                                    ? 'border-[#1B5E20] bg-emerald-50/20 text-[#1B5E20] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Mail size={16} />
                                <span>Kotak Masuk (Inbox)</span>
                            </div>
                            {unreadCount > 0 && (
                                <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Right panels display box */}
                    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                        {/* PANEL 1: INFORMASI KONTAK */}
                        {activeTab === 'kontak' && (
                            <form
                                onSubmit={handleContactSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900">
                                        Informasi Kontak Biro
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Sesuaikan informasi kontak resmi yang
                                        ditampilkan di halaman publik Hubungi
                                        Kami.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Telepon / Hotline Kantor *
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.telepon}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    telepon: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Email Resmi Kantor *
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Alamat Lengkap Kantor *
                                        </label>
                                        <textarea
                                            value={settings.alamat}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    alamat: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Jam Kerja / Jam Operasional *
                                        </label>
                                        <textarea
                                            value={settings.jam_operasional}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    jam_operasional:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-neutral-800">
                                            URL Google Maps Iframe String *
                                        </label>
                                        <textarea
                                            value={settings.google_maps_embed}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    google_maps_embed:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 font-mono text-[11px] outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                            required
                                        />
                                        <p className="mt-0.5 text-[10px] leading-normal text-neutral-400">
                                            Masukkan link iframe (dari Google
                                            Maps - Bagikan - Sematkan Peta).
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5E20] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#145218]"
                                    >
                                        <Save size={14} />
                                        <span>Simpan Perubahan Kontak</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 2: TAUTAN SOSIAL MEDIA */}
                        {activeTab === 'sosmed' && (
                            <form
                                onSubmit={handleSosmedSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-neutral-900">
                                            Tautan Media Sosial Resmi
                                        </h2>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Atur daftar repeater link tautan
                                            sosial media resmi BKA UMRI.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddSosmed}
                                        className="inline-flex items-center gap-1 rounded-xl bg-[#1B5E20] px-3 py-2 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-[#145218]"
                                    >
                                        <Plus size={13} />
                                        <span>Tambah Tautan</span>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {settings.mediaSosial.length > 0 ? (
                                        settings.mediaSosial.map(
                                            (med, index) => (
                                                <div
                                                    key={index}
                                                    className="border-neutral-150 flex items-center gap-3 rounded-2xl border bg-neutral-50/20 p-3"
                                                >
                                                    <div className="w-1/3 max-w-[160px] min-w-[120px]">
                                                        <select
                                                            value={med.platform}
                                                            onChange={(e) =>
                                                                handleSosmedChange(
                                                                    index,
                                                                    'platform',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                                        >
                                                            <option value="Facebook">
                                                                Facebook
                                                            </option>
                                                            <option value="Instagram">
                                                                Instagram
                                                            </option>
                                                            <option value="YouTube">
                                                                YouTube
                                                            </option>
                                                            <option value="Twitter">
                                                                X / Twitter
                                                            </option>
                                                            <option value="LinkedIn">
                                                                LinkedIn
                                                            </option>
                                                            <option value="TikTok">
                                                                TikTok
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="url"
                                                            placeholder="Masukkan URL profil lengkap..."
                                                            value={med.url}
                                                            onChange={(e) =>
                                                                handleSosmedChange(
                                                                    index,
                                                                    'url',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveSosmed(
                                                                index,
                                                            )
                                                        }
                                                        className="shrink-0 rounded-xl p-2 text-red-500 hover:bg-red-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                                            <Share2
                                                size={40}
                                                className="mb-2 stroke-1 text-neutral-300"
                                            />
                                            <span className="text-xs font-semibold">
                                                Tautan Belum Dikonfigurasi
                                            </span>
                                            <p className="mt-0.5 text-[10px]">
                                                Silakan klik Tambah Tautan untuk
                                                memasukkan akun sosial media
                                                resmi.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5E20] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#145218]"
                                    >
                                        <Save size={14} />
                                        <span>Simpan Perubahan Tautan</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 3: PENGATURAN SISTEM (RESTRICTED TO SUPER ADMIN) */}
                        {activeTab === 'sistem' && (
                            <form
                                onSubmit={handleSystemSubmit}
                                className="flex flex-col gap-6"
                            >
                                <div>
                                    <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900">
                                        Identitas Sistem & Metadata SEO
                                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[8px] font-black text-amber-700 uppercase">
                                            Super Admin Only
                                        </span>
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Konfigurasi branding nama portal website
                                        utama serta deskripsi optimasi search
                                        engine (SEO).
                                    </p>
                                </div>

                                {/* Security Warning Banner for Non-Super Admins */}
                                {!isSuperAdmin && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                                        <ShieldAlert
                                            size={18}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />
                                        <div>
                                            <span className="font-bold">
                                                Mode Baca Saja (Read-Only)
                                            </span>
                                            <p className="mt-0.5 leading-relaxed text-amber-700">
                                                Akun Anda tidak memiliki lisensi
                                                peran **Super Admin**. Anda
                                                diizinkan untuk melihat
                                                konfigurasi, namun tidak dapat
                                                menyimpan perubahan.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Nama Website Utama *
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.nama_website}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    nama_website:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] disabled:bg-neutral-50 disabled:text-neutral-500"
                                            disabled={!isSuperAdmin}
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-neutral-800">
                                            Deskripsi SEO Global (Meta
                                            Description) *
                                        </label>
                                        <textarea
                                            value={settings.deskripsi_seo}
                                            onChange={(e) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    deskripsi_seo:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] disabled:bg-neutral-50 disabled:text-neutral-500"
                                            maxLength={160}
                                            disabled={!isSuperAdmin}
                                            required
                                        />
                                        <div className="mt-0.5 flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                                            <span>
                                                Batas disarankan untuk deskripsi
                                                Google.
                                            </span>
                                            <span>
                                                {settings.deskripsi_seo.length}{' '}
                                                / 160 Karakter
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {/* Logo Branding */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-neutral-800">
                                                Logo Portal Resmi (SVG/PNG)
                                            </span>
                                            <div className="border-neutral-150 flex items-center gap-4 rounded-2xl border bg-neutral-50/30 p-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-2xs">
                                                    {settings.logo_base64 ? (
                                                        <img
                                                            src={
                                                                settings.logo_base64
                                                            }
                                                            alt="Website Logo"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Globe
                                                            className="text-neutral-300"
                                                            size={32}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                    <input
                                                        type="file"
                                                        accept=".png,.svg,.jpg,.jpeg"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                'logo_base64',
                                                            )
                                                        }
                                                        className="hidden"
                                                        id="logo-uploader-btn"
                                                        disabled={!isSuperAdmin}
                                                    />
                                                    <label
                                                        htmlFor="logo-uploader-btn"
                                                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold shadow-2xs transition-all hover:bg-neutral-50 ${
                                                            !isSuperAdmin
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>Unggah Logo</span>
                                                    </label>
                                                    <span className="text-[9px] leading-normal font-semibold text-neutral-400">
                                                        Max 500 KB, format
                                                        resolusi tinggi
                                                        disarankan.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Favicon Branding */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-neutral-800">
                                                Favicon Shortcut Icon
                                                (.ico/.png)
                                            </span>
                                            <div className="border-neutral-150 flex items-center gap-4 rounded-2xl border bg-neutral-50/30 p-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                                                    {settings.favicon_base64 ? (
                                                        <img
                                                            src={
                                                                settings.favicon_base64
                                                            }
                                                            alt="Website Favicon"
                                                            className="h-8 w-8 object-contain"
                                                        />
                                                    ) : (
                                                        <Globe
                                                            className="text-neutral-300"
                                                            size={24}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                    <input
                                                        type="file"
                                                        accept=".ico,.png"
                                                        onChange={(e) =>
                                                            handleImageUpload(
                                                                e,
                                                                'favicon_base64',
                                                            )
                                                        }
                                                        className="hidden"
                                                        id="favicon-uploader-btn"
                                                        disabled={!isSuperAdmin}
                                                    />
                                                    <label
                                                        htmlFor="favicon-uploader-btn"
                                                        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold shadow-2xs transition-all hover:bg-neutral-50 ${
                                                            !isSuperAdmin
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span>
                                                            Unggah Favicon
                                                        </span>
                                                    </label>
                                                    <span className="text-[9px] leading-normal font-semibold text-neutral-400">
                                                        Max 100 KB, rasio kotak
                                                        persegi (e.g. 32x32).
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end border-t border-neutral-100 pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5E20] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#145218] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={!isSuperAdmin}
                                    >
                                        <Save size={14} />
                                        <span>Simpan Pengaturan Sistem</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PANEL 4: PESAN MASUK (INBOX) */}
                        {activeTab === 'inbox' && (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900">
                                        Kotak Pesan Masuk BKA
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Daftar masukan, pertanyaan, saran, dan
                                        keluhan yang dikirimkan oleh pengguna
                                        melalui halaman Kontak.
                                    </p>
                                </div>

                                {/* Inbox Toolbars */}
                                <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative w-full sm:max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Cari nama, email, subjek..."
                                            value={inboxSearch}
                                            onChange={(e) =>
                                                setInboxSearch(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pr-4 pl-9 text-xs outline-none focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20]"
                                        />
                                        <Search
                                            size={14}
                                            className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                                        />
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() =>
                                                setInboxFilter('all')
                                            }
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                                inboxFilter === 'all'
                                                    ? 'bg-[#1B5E20] text-white'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                            }`}
                                        >
                                            Semua Pesan
                                        </button>
                                        <button
                                            onClick={() =>
                                                setInboxFilter('unread')
                                            }
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                                inboxFilter === 'unread'
                                                    ? 'bg-[#1B5E20] text-white'
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                            }`}
                                        >
                                            Belum Dibaca
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Table list */}
                                <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
                                    {filteredInbox.length > 0 ? (
                                        filteredInbox.map((msg) => (
                                            <div
                                                key={msg.id}
                                                onClick={() =>
                                                    handleOpenMessage(msg)
                                                }
                                                className={`group flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                                                    msg.dibaca
                                                        ? 'border-neutral-200 bg-white hover:bg-neutral-50/50'
                                                        : 'border-emerald-200 bg-emerald-50/10 shadow-2xs hover:bg-emerald-50/20'
                                                }`}
                                            >
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${
                                                            msg.dibaca
                                                                ? 'bg-neutral-100 text-neutral-500'
                                                                : 'animate-pulse bg-emerald-100 text-[#1B5E20]'
                                                        }`}
                                                    >
                                                        <MailOpen size={16} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                            <span
                                                                className={`truncate text-xs ${msg.dibaca ? 'font-semibold text-neutral-600' : 'font-bold text-neutral-900'}`}
                                                            >
                                                                {msg.nama}
                                                            </span>
                                                            <span className="text-[10px] font-medium whitespace-nowrap text-neutral-400">
                                                                {formatDate(
                                                                    msg.tanggal,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <h3
                                                            className={`mt-1 truncate text-xs ${msg.dibaca ? 'text-neutral-800' : 'font-bold text-neutral-900'}`}
                                                        >
                                                            {msg.subjek}
                                                        </h3>
                                                        <p className="mt-1 line-clamp-1 text-[11px] text-neutral-500">
                                                            {msg.pesan}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions panel */}
                                                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleReadStatus(
                                                                msg.id,
                                                                msg.dibaca,
                                                            );
                                                        }}
                                                        className={`rounded-lg border border-neutral-200 bg-white p-1.5 text-xs ${
                                                            msg.dibaca
                                                                ? 'text-neutral-500 hover:text-[#1B5E20]'
                                                                : 'text-[#1B5E20] hover:text-neutral-500'
                                                        }`}
                                                        title={
                                                            msg.dibaca
                                                                ? 'Tandai belum dibaca'
                                                                : 'Tandai sudah dibaca'
                                                        }
                                                    >
                                                        <CheckCircle
                                                            size={14}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMessage(
                                                                msg.id,
                                                            );
                                                        }}
                                                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-red-500 hover:bg-red-50"
                                                        title="Hapus Pesan"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
                                            <MailOpen
                                                size={48}
                                                className="mb-3 stroke-1 text-neutral-300"
                                            />
                                            <span className="text-xs font-semibold">
                                                Kotak Masuk Kosong
                                            </span>
                                            <p className="mt-0.5 text-[10px]">
                                                Tidak ada pesan kontak masuk
                                                yang sesuai dengan filter.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL: INBOX MESSAGE DETAIL READER */}
                {activeMessage && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs transition-all select-none fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 zoom-in-95">
                            {/* Header */}
                            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                                <div className="min-w-0 flex-1 pr-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                            activeMessage.dibaca
                                                ? 'bg-neutral-100 text-neutral-500'
                                                : 'bg-emerald-100 text-[#1B5E20]'
                                        }`}
                                    >
                                        <MailOpen size={11} />
                                        <span>
                                            {activeMessage.dibaca
                                                ? 'Sudah Dibaca'
                                                : 'Pesan Baru'}
                                        </span>
                                    </span>
                                    <h3 className="mt-2 truncate text-sm leading-snug font-bold text-neutral-900">
                                        {activeMessage.subjek}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveMessage(null)}
                                    className="p-1 text-sm font-semibold text-neutral-400 outline-none hover:text-neutral-600"
                                >
                                    Tutup
                                </button>
                            </div>

                            {/* Details body */}
                            <div className="flex-1 space-y-4 overflow-y-auto py-2">
                                {/* Sender Info Block */}
                                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[#1B5E20]">
                                            <User size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-neutral-800">
                                                {activeMessage.nama}
                                            </p>
                                            <a
                                                href={`mailto:${activeMessage.email}`}
                                                className="block truncate text-[11px] font-bold text-[#1B5E20] hover:text-[#145218] hover:underline"
                                            >
                                                {activeMessage.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400">
                                        <Calendar size={12} />
                                        <span>
                                            Diterima:{' '}
                                            {formatDate(activeMessage.tanggal)}{' '}
                                            (WIB)
                                        </span>
                                    </div>
                                </div>

                                {/* Message Content body */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Isi Pesan Lengkap
                                    </span>
                                    <p className="text-neutral-750 border-neutral-150 min-h-[140px] rounded-2xl border bg-neutral-50/30 p-4 text-xs leading-relaxed whitespace-pre-wrap">
                                        {activeMessage.pesan}
                                    </p>
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                                <button
                                    onClick={() =>
                                        handleDeleteMessage(activeMessage.id)
                                    }
                                    className="text-red-650 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors hover:bg-red-50/50"
                                >
                                    <Trash2 size={14} />
                                    <span>Hapus Pesan</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleReadStatus(
                                                activeMessage.id,
                                                activeMessage.dibaca,
                                            )
                                        }
                                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 transition-colors outline-none hover:bg-neutral-50"
                                    >
                                        {activeMessage.dibaca
                                            ? 'Tandai Belum Dibaca'
                                            : 'Tandai Sudah Dibaca'}
                                    </button>
                                    <a
                                        href={`mailto:${activeMessage.email}?subject=Balasan BKA UMRI: ${activeMessage.subjek}`}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B5E20] px-4.5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#145218]"
                                    >
                                        <Mail size={14} />
                                        <span>Balas Email</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

WebSettingsCMS.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Pengaturan Web',
            href: '/admin/settings',
        },
    ],
};
