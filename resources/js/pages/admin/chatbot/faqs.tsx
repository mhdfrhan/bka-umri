import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    Activity,
    Bot,
    Settings,
    HelpCircle,
    ArrowUp,
    ArrowDown,
    Save,
    RotateCcw,
    X,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatbotFaq {
    id: number;
    label: string;
    question: string;
    answer: string;
    is_popular: boolean;
    urutan: number;
}

export default function ChatbotFaqPage({
    faqs,
}: {
    faqs: ChatbotFaq[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<ChatbotFaq | null>(null);
    const [formData, setFormData] = useState({
        label: '',
        question: '',
        answer: '',
        is_popular: true,
        urutan: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    const openCreateModal = () => {
        setEditingFaq(null);
        setFormData({
            label: '',
            question: '',
            answer: '',
            is_popular: true,
            urutan: faqs.length + 1,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (faq: ChatbotFaq) => {
        setEditingFaq(faq);
        setFormData({
            label: faq.label,
            question: faq.question,
            answer: faq.answer,
            is_popular: faq.is_popular,
            urutan: faq.urutan,
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const url = editingFaq 
            ? `/admin/chatbot/faqs/${editingFaq.id}` 
            : '/admin/chatbot/faqs';

        const method = editingFaq ? 'put' : 'post';

        router[method](url, formData as any, {
            onSuccess: () => {
                toast.success(editingFaq ? 'FAQ berhasil diperbarui!' : 'FAQ baru berhasil ditambahkan!');
                setIsModalOpen(false);
                setIsSaving(false);
            },
            onError: (err) => {
                const firstError = Object.values(err)[0] as string;
                toast.error(firstError || 'Terjadi kesalahan sistem.');
                setIsSaving(false);
            }
        });
    };

    const handleDelete = (faq: ChatbotFaq) => {
        if (confirm(`Apakah Anda yakin ingin menghapus FAQ "${faq.label}"?`)) {
            router.delete(`/admin/chatbot/faqs/${faq.id}`, {
                onSuccess: () => {
                    toast.success('FAQ berhasil dihapus!');
                }
            });
        }
    };

    const handleMove = (id: number, direction: 'up' | 'down') => {
        router.post(`/admin/chatbot/faqs/${id}/reorder`, { direction }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Urutan FAQ berhasil diselaraskan!');
            }
        });
    };

    return (
        <>
            <Head title="Kelola FAQ Chatbot - Admin BKA" />

            <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <HelpCircle className="text-[#0a6c32]" size={28} />
                            Kelola FAQ Chatbot AI
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Kelola daftar pertanyaan populer (FAQ) yang muncul di widget chatbot dan ajarkan asisten untuk menjawab secara otomatis dengan presisi.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex max-sm:w-full justify-center items-center gap-1.5 rounded-xl bg-[#0a6c32] hover:bg-[#085627] text-white px-4 py-2.5 text-xs font-bold shadow-3xs transition-all duration-200 active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Tambah FAQ Baru</span>
                    </button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex border-b border-neutral-200">
                    <Link
                        href="/admin/chatbot"
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-[#0a6c32] transition-all"
                    >
                        Pengaturan Model
                    </Link>
                    <Link
                        href="/admin/chatbot/faqs"
                        className="border-b-2 border-[#0a6c32] px-4 py-2 text-sm font-bold text-[#0a6c32] transition-all"
                    >
                        Daftar Tanya-Jawab (FAQ)
                    </Link>
                    <Link
                        href="/admin/chatbot/monitoring"
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-[#0a6c32] transition-all"
                    >
                        Monitoring & Logs
                    </Link>
                </div>

                {/* FAQ List Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-450 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                    <th className="py-3 px-4 w-48">Label Widget</th>
                                    <th className="py-3 px-4">Pertanyaan Pengguna</th>
                                    <th className="py-3 px-4 w-96">Jawaban Chatbot (Markdown)</th>
                                    <th className="py-3 px-4 text-center w-24">Status</th>
                                    <th className="py-3 px-4 text-right w-36">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
                                {faqs.length > 0 ? (
                                    faqs.map((faq, index) => (
                                        <tr key={faq.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-bold text-neutral-800">{faq.urutan}</span>
                                                    <div className="flex gap-0.5">
                                                        <button
                                                            onClick={() => handleMove(faq.id, 'up')}
                                                            disabled={index === 0}
                                                            className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none"
                                                            title="Naikkan Urutan"
                                                        >
                                                            <ArrowUp size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMove(faq.id, 'down')}
                                                            disabled={index === faqs.length - 1}
                                                            className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none"
                                                            title="Turunkan Urutan"
                                                        >
                                                            <ArrowDown size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-neutral-900">{faq.label}</td>
                                            <td className="py-3.5 px-4 text-neutral-700 leading-normal">{faq.question}</td>
                                            <td className="py-3.5 px-4 text-neutral-500 leading-relaxed font-normal whitespace-pre-line max-w-sm truncate" title={faq.answer}>
                                                {faq.answer}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {faq.is_popular ? (
                                                    <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                                        Populer
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-md bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500 uppercase">
                                                        Arsip
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(faq)}
                                                        className="inline-flex items-center gap-1 hover:text-[#0a6c32] text-neutral-400 font-bold transition-all"
                                                    >
                                                        <Edit2 size={13} />
                                                        <span>Ubah</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(faq)}
                                                        className="inline-flex items-center gap-1 hover:text-red-600 text-neutral-400 font-bold transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-neutral-400">
                                            Tidak ada FAQ chatbot yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CREATE / EDIT DIALOG MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <HelpCircle className="text-[#0a6c32]" size={18} />
                                {editingFaq ? 'Ubah FAQ Chatbot' : 'Tambah FAQ Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                                    Label Widget (Tombol Populer)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.label}
                                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                    placeholder="Contoh: Cara Bayar UKT"
                                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                                    Pertanyaan Pengguna
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="Contoh: Bagaimana cara melakukan pembayaran UKT?"
                                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                                    Jawaban Chatbot (Mendukung Link & Markdown)
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.answer}
                                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                    placeholder="Tuliskan jawaban lengkap dengan standard markdown/link..."
                                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-normal focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] outline-none leading-relaxed"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                                        Urutan Tampilan
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.urutan}
                                        onChange={(e) => setFormData(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] outline-none"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                                        Tampilkan di Widget?
                                    </label>
                                    <select
                                        value={formData.is_popular ? '1' : '0'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.value === '1' }))}
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32] outline-none"
                                    >
                                        <option value="1">Ya (Muncul sebagai Populer)</option>
                                        <option value="0">Tidak (Arsip)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] hover:bg-[#085627] text-white px-4 py-2.5 text-xs font-bold disabled:bg-neutral-350"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
