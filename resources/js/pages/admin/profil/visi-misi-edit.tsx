import { Head, useForm } from '@inertiajs/react';
import {
    Compass,
    Target,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Save,
    ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface MisiItem {
    id: number;
    isi: string;
    urutan: number;
}

const DEFAULT_VISI =
    'Menjadi penyelenggara administrasi keuangan dan pengelolaan aset yang unggul, terpercaya, transparan, dan akuntabel berbasis digitalisasi layanan demi mendukung Universitas Muhammadiyah Riau yang cerdas, inovatif, dan berkemajuan pada tahun 2028.';

const DEFAULT_MISI: MisiItem[] = [
    {
        id: 1,
        isi: 'Menyelenggarakan sistem perencanaan, penganggaran, dan pengendalian keuangan yang efisien, transparan, dan akuntabel.',
        urutan: 1,
    },
    {
        id: 2,
        isi: 'Mengembangkan digitalisasi administrasi layanan keuangan terintegrasi guna memberikan kemudahan pelayanan terbaik bagi seluruh mahasiswa dan civitas akademika.',
        urutan: 2,
    },
    {
        id: 3,
        isi: 'Melaksanakan penataan, pembukuan, dan pelaporan sarana, prasarana, serta aset fisik universitas secara profesional dan akurat.',
        urutan: 3,
    },
    {
        id: 4,
        isi: 'Mengoptimalkan pemanfaatan dan produktivitas aset fisik maupun finansial kampus untuk keberlangsungan finansial universitas yang mandiri.',
        urutan: 4,
    },
    {
        id: 5,
        isi: 'Membina kualitas sumber daya manusia pengelola keuangan dan logistik yang berintegritas tinggi, kompeten, dan memegang teguh nilai-nilai Al-Islam Kemuhammadiyahan.',
        urutan: 5,
    },
];

interface Props {
    visi: string | null;
    misiList: MisiItem[];
}

export default function EditVisiMisi({ visi, misiList }: Props) {
    const { data, setData, put, processing } = useForm({
        visi: visi || DEFAULT_VISI,
        misiItems: misiList && misiList.length > 0 ? misiList : DEFAULT_MISI,
    });

    // Handle add mission
    const handleAddMisi = () => {
        if (data.misiItems.length >= 10) {
            toast.warning('Maksimum 10 poin misi diperbolehkan!');
            return;
        }

        const maxId = data.misiItems.reduce(
            (max, m) => (m.id > max ? m.id : max),
            0,
        );
        const newMisi: MisiItem = {
            id: maxId + 1,
            isi: '',
            urutan: data.misiItems.length + 1,
        };
        setData('misiItems', [...data.misiItems, newMisi]);
    };

    // Handle remove mission
    const handleRemoveMisi = (id: number) => {
        if (data.misiItems.length <= 1) {
            toast.warning('Minimal harus terdapat 1 poin misi!');
            return;
        }

        const updated = data.misiItems
            .filter((m) => m.id !== id)
            .map((m, idx) => ({
                ...m,
                urutan: idx + 1,
            }));
        setData('misiItems', updated);
    };

    // Handle change text mission
    const handleChangeMisi = (id: number, text: string) => {
        const updated = data.misiItems.map((m) =>
            m.id === id ? { ...m, isi: text } : m,
        );
        setData('misiItems', updated);
    };

    // Reorder actions
    const handleMoveUp = (index: number) => {
        if (index === 0) {
            return;
        }

        const items = [...data.misiItems];
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;

        const updated = items.map((m, idx) => ({ ...m, urutan: idx + 1 }));
        setData('misiItems', updated);
    };

    const handleMoveDown = (index: number) => {
        if (index === data.misiItems.length - 1) {
            return;
        }

        const items = [...data.misiItems];
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;

        const updated = items.map((m, idx) => ({ ...m, urutan: idx + 1 }));
        setData('misiItems', updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!data.visi.trim()) {
            toast.error('Visi organisasi tidak boleh kosong!');
            return;
        }

        const hasEmptyMisi = data.misiItems.some((m) => !m.isi.trim());
        if (hasEmptyMisi) {
            toast.error(
                'Terdapat poin misi yang masih kosong! Harap isi atau hapus poin tersebut.',
            );
            return;
        }

        put('/admin/profil/visi-misi', {
            onSuccess: () => {
                toast.success('Visi & Misi BKA berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal menyimpan data.');
            },
        });
    };

    return (
        <>
            <Head title="Edit Visi & Misi - BKA UMRI" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-800">
                            <Compass className="size-6 text-emerald-600" />
                            Kelola Visi & Misi Organisasi
                        </h1>
                        <p className="mt-1 text-sm leading-relaxed font-normal text-neutral-500">
                            Rumuskan visi jangka panjang dan misi strategis
                            penunjang pelayanan administrasi keuangan serta
                            sarana prasarana.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/profil/visi-misi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-950"
                        >
                            <ExternalLink className="size-4" />
                            Lihat Halaman
                        </a>
                    </div>
                </div>

                {/* Form Shell with CSS Grid for perfect layout alignment */}
                <form
                    onSubmit={handleSave}
                    className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[28%_1fr]"
                >
                    {/* Left Column Information */}
                    <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6">
                        <h2 className="text-sm font-bold tracking-wider text-emerald-800 uppercase">
                            Panduan Rumusan
                        </h2>

                        <div className="space-y-3.5 text-xs leading-relaxed text-neutral-600">
                            <div className="flex gap-2">
                                <span className="font-bold text-emerald-600">
                                    1.
                                </span>
                                <span>
                                    <strong>Visi:</strong> Harus
                                    merepresentasikan cita-cita besar BKA UMRI
                                    hingga target tahun pencapaian tertentu
                                    (e.g. 2028).
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold text-emerald-600">
                                    2.
                                </span>
                                <span>
                                    <strong>Misi:</strong> Terdiri atas 1–10
                                    langkah konkret. Disusun terurut sesuai
                                    skala implementasi pengerjaan.
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold text-emerald-600">
                                    3.
                                </span>
                                <span>
                                    Gunakan tombol panah (
                                    <ArrowUp className="inline size-3" /> /{' '}
                                    <ArrowDown className="inline size-3" />)
                                    untuk merubah prioritas urutan misi dengan
                                    mudah.
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                            >
                                <Save className="size-4.5" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column Form Inputs */}
                    <div className="space-y-6">
                        {/* Visi Card */}
                        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                                <Compass className="size-5 text-emerald-600" />
                                <h3 className="text-base font-bold tracking-tight text-neutral-800">
                                    Pernyataan Visi BKA
                                </h3>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-neutral-700">
                                        Teks Visi Utama
                                    </label>
                                    <span
                                        className={`text-xs ${data.visi.length > 1800 ? 'font-semibold text-red-500' : 'text-neutral-400'}`}
                                    >
                                        {data.visi.length} / 2000 karakter
                                    </span>
                                </div>
                                <RichTextEditor
                                    value={data.visi}
                                    onChange={(val) => setData('visi', val)}
                                    className="border-neutral-200 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
                                />
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] md:p-8">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="size-5 text-emerald-600" />
                                    <h3 className="text-base font-bold tracking-tight text-neutral-800">
                                        Daftar Poin Misi BKA (
                                        {data.misiItems.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddMisi}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Poin
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.misiItems
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((misi, index) => (
                                        <div
                                            key={misi.id}
                                            className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-3 transition-all hover:bg-neutral-50"
                                        >
                                            {/* Order indicator */}
                                            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100/70 text-sm font-extrabold text-emerald-800">
                                                {index + 1}
                                            </span>

                                            {/* Mission input */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    maxLength={200}
                                                    value={misi.isi}
                                                    onChange={(e) =>
                                                        handleChangeMisi(
                                                            misi.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Tulis poin pernyataan misi..."
                                                    className="w-full border-none bg-transparent py-1 text-sm font-medium text-neutral-800 focus:ring-0 focus:outline-none"
                                                />
                                            </div>

                                            {/* Sorting & Deleting controls */}
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() =>
                                                        handleMoveUp(index)
                                                    }
                                                    className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan ke atas"
                                                >
                                                    <ArrowUp className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        index ===
                                                        data.misiItems.length -
                                                            1
                                                    }
                                                    onClick={() =>
                                                        handleMoveDown(index)
                                                    }
                                                    className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Pindahkan ke bawah"
                                                >
                                                    <ArrowDown className="size-4" />
                                                </button>
                                                <div className="mx-0.5 h-4 w-[1px] bg-neutral-200" />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveMisi(
                                                            misi.id,
                                                        )
                                                    }
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                {data.misiItems.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
                                        <Target className="mx-auto mb-2 size-8 animate-pulse text-neutral-300" />
                                        <p className="text-sm font-semibold text-neutral-600">
                                            Poin Misi Kosong
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleAddMisi}
                                            className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                        >
                                            Tambah misi pertama
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

EditVisiMisi.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin',
        },
        {
            title: 'Profil Organisasi',
            href: '#',
        },
        {
            title: 'Visi & Misi',
            href: '/admin/profil/visi-misi',
        },
    ],
};
