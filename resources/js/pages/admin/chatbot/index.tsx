import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Bot,
    Settings,
    Cpu,
    Shield,
    Save,
    Sparkles,
    Activity,
    Info,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Lock,
    Sliders,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatbotSettings {
    chatbot_enabled: string;
    primary_provider: string;
    primary_base_url: string;
    primary_api_key: string;
    primary_model: string;
    fallback_enabled: string;
    fallback_provider: string;
    fallback_base_url: string;
    fallback_api_key: string;
    fallback_model: string;
    temperature: string;
    top_p: string;
    max_tokens: string;
    rate_limit: string;
    context_max_messages: string;
    max_input_length: string;
    greeting_message: string;
    system_prompt: string;
}

export default function ChatbotSettingsPage({
    settings: initialSettings,
}: {
    settings: ChatbotSettings;
}) {
    const [settings, setSettings] = useState<ChatbotSettings>(initialSettings);
    const [activeTab, setActiveTab] = useState<'umum' | 'provider' | 'keamanan'>('umum');
    const [isSaving, setIsSaving] = useState(false);
    const [showPrimaryApiKey, setShowPrimaryApiKey] = useState(false);
    const [showFallbackApiKey, setShowFallbackApiKey] = useState(false);

    // Connection testing states
    const [testLoading, setTestLoading] = useState<{ primary: boolean; fallback: boolean }>({
        primary: false,
        fallback: false,
    });
    const [testResult, setTestResult] = useState<{
        primary: { success: boolean; message: string } | null;
        fallback: { success: boolean; message: string } | null;
    }>({
        primary: null,
        fallback: null,
    });

    const handleInputChange = (key: keyof ChatbotSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        router.post(
            '/admin/chatbot/settings',
            settings as any,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pengaturan Chatbot AI berhasil disimpan!');
                    setIsSaving(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Gagal menyimpan pengaturan.');
                    setIsSaving(false);
                },
            }
        );
    };

    const testConnection = async (type: 'primary' | 'fallback') => {
        const isPrimary = type === 'primary';
        setTestLoading((prev) => ({ ...prev, [type]: true }));
        setTestResult((prev) => ({ ...prev, [type]: null }));

        const baseUrl = isPrimary ? settings.primary_base_url : settings.fallback_base_url;
        const apiKey = isPrimary ? settings.primary_api_key : settings.fallback_api_key;
        const model = isPrimary ? settings.primary_model : settings.fallback_model;

        if (!apiKey) {
            toast.error(`API Key untuk ${isPrimary ? 'Model Utama' : 'Model Cadangan'} belum diisi!`);
            setTestLoading((prev) => ({ ...prev, [type]: false }));
            return;
        }

        try {
            const response = await fetch('/admin/chatbot/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    base_url: baseUrl,
                    api_key: apiKey,
                    model: model,
                    type: type,
                }),
            });

            const data = await response.json();

            setTestResult((prev) => ({
                ...prev,
                [type]: {
                    success: data.success,
                    message: data.message,
                },
            }));

            if (data.success) {
                toast.success(`Koneksi ${isPrimary ? 'Model Utama' : 'Model Cadangan'} berhasil!`);
            } else {
                toast.error(`Koneksi ${isPrimary ? 'Model Utama' : 'Model Cadangan'} gagal.`);
            }
        } catch (error) {
            setTestResult((prev) => ({
                ...prev,
                [type]: {
                    success: false,
                    message: 'Gagal menghubungi server penguji koneksi.',
                },
            }));
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setTestLoading((prev) => ({ ...prev, [type]: false }));
        }
    };

    return (
        <>
            <Head title="Pengaturan Chatbot AI - Admin BKA" />

            <div className="flex flex-col gap-6 mx-auto w-full max-w-7xl space-y-6 p-6 md:space-y-8 md:p-8">
                <div className="flex flex-col gap-2 border-b border-neutral-100 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
                            <Bot className="text-[#0a6c32]" size={28} />
                            Pengaturan Chatbot AI
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Konfigurasi kecerdasan buatan, provider LLM, instruksi filter (system prompt), dan model fallback asisten BKA.
                        </p>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex border-b border-neutral-200">
                    <Link
                        href="/admin/chatbot"
                        className="border-b-2 border-[#0a6c32] px-4 py-2 text-sm font-bold text-[#0a6c32] transition-all"
                    >
                        Pengaturan Model
                    </Link>
                    <Link
                        href="/admin/chatbot/faqs"
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-[#0a6c32] transition-all"
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

                {/* Main Tabs Layout */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Sidebar Tabs */}
                    <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                        <button
                            onClick={() => setActiveTab('umum')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'umum'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Sliders size={16} />
                            <span>Pengaturan Umum & LLM</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('provider')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'provider'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Cpu size={16} />
                            <span>Provider & Rantai Fallback</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('keamanan')}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4.5 text-left text-xs font-bold transition-all ${
                                activeTab === 'keamanan'
                                    ? 'border-[#0a6c32] bg-emerald-50/20 text-[#0a6c32] shadow-xs'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <Shield size={16} />
                            <span>Keamanan & Guardrails</span>
                        </button>
                    </div>

                    {/* Right Panel Card */}
                    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            {/* TAB 1: PENGATURAN UMUM */}
                            {activeTab === 'umum' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-base font-bold text-neutral-900">Pengaturan Umum & Parameter</h2>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Aktifkan chatbot dan atur sapaan pembuka serta kecerdasan umum model asisten.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {/* Status Chatbot */}
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-xs font-bold text-neutral-800">Status Chatbot AI</label>
                                            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4">
                                                <input
                                                    type="checkbox"
                                                    id="chatbot_enabled"
                                                    checked={settings.chatbot_enabled === '1'}
                                                    onChange={(e) => handleInputChange('chatbot_enabled', e.target.checked ? '1' : '0')}
                                                    className="h-4.5 w-4.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <label htmlFor="chatbot_enabled" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                                                    Aktifkan widget Chatbot AI di halaman publik website
                                                </label>
                                            </div>
                                        </div>

                                        {/* Greeting Message */}
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-xs font-bold text-neutral-800">Greeting Message (Sapaan Pembuka)</label>
                                            <textarea
                                                value={settings.greeting_message}
                                                onChange={(e) => handleInputChange('greeting_message', e.target.value)}
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                        </div>

                                        {/* System Prompt */}
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-neutral-800">Instruksi Tambahan System Prompt</label>
                                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                    <Sparkles size={11} /> Kustomisasi Aturan AI
                                                </span>
                                            </div>
                                            <textarea
                                                value={settings.system_prompt}
                                                onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                                                placeholder="Contoh: Selalu ingatkan mahasiswa untuk membayar cicilan tepat waktu. Berikan rekomendasi ramah."
                                                rows={4}
                                                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                            />
                                            <p className="text-[10px] text-neutral-400">
                                                Instruksi ini akan digabung dengan sistem guardrails resmi untuk memandu gaya bicara chatbot.
                                            </p>
                                        </div>

                                        {/* Temperature */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">Temperature (Tingkat Kreativitas: 0.0 - 1.0)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                value={settings.temperature}
                                                onChange={(e) => handleInputChange('temperature', e.target.value)}
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                            <p className="text-[10px] text-neutral-400">Nilai rendah (misal 0.2) membuat jawaban lebih konsisten dan berbasis fakta.</p>
                                        </div>

                                        {/* Max Tokens */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">Max Tokens Per Respons</label>
                                            <input
                                                type="number"
                                                min="100"
                                                max="4096"
                                                value={settings.max_tokens}
                                                onChange={(e) => handleInputChange('max_tokens', e.target.value)}
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                            <p className="text-[10px] text-neutral-400">Batas panjang karakter teks respons yang dihasilkan model (1 token ≈ 4 karakter).</p>
                                        </div>

                                        {/* Context Max Messages */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">Jumlah Riwayat Chat Terakhir (Memory Context)</label>
                                            <input
                                                type="number"
                                                min="2"
                                                max="50"
                                                value={settings.context_max_messages}
                                                onChange={(e) => handleInputChange('context_max_messages', e.target.value)}
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                            <p className="text-[10px] text-neutral-400">Berapa banyak pesan ke belakang yang diingat chatbot selama sesi obrolan.</p>
                                        </div>

                                        {/* Rate Limit */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">Batas Pesan Per Menit Per User (IP Address)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={settings.rate_limit}
                                                onChange={(e) => handleInputChange('rate_limit', e.target.value)}
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                            <p className="text-[10px] text-neutral-400">Mencegah spamming API. Nilai default yang disarankan adalah 10 pesan.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: PROVIDER & MODEL */}
                            {activeTab === 'provider' && (
                                <div className="flex flex-col gap-8">
                                    {/* Primary Model Section */}
                                    <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6">
                                        <div>
                                            <h2 className="text-base font-bold text-neutral-900">1. Konfigurasi Model Utama (Primary Model)</h2>
                                            <p className="mt-1 text-xs text-neutral-500">
                                                Konfigurasi server model AI utama yang menangani percakapan chatbot.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-neutral-800">Provider Utama</label>
                                                <select
                                                    value={settings.primary_provider}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(prev => {
                                                            const next = { ...prev, primary_provider: val };
                                                            if (val === 'nvidia') {
                                                                next.primary_base_url = 'https://integrate.api.nvidia.com/v1';
                                                                next.primary_model = 'openai/gpt-oss-120b';
                                                            } else if (val === 'groq') {
                                                                next.primary_base_url = 'https://api.groq.com/openai/v1';
                                                                next.primary_model = 'llama-3.3-70b-versatile';
                                                            } else if (val === 'openai') {
                                                                next.primary_base_url = 'https://api.openai.com/v1';
                                                                next.primary_model = 'gpt-4o-mini';
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-bold bg-white outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                >
                                                    <option value="nvidia">NVIDIA NIM API</option>
                                                    <option value="openai">OpenAI</option>
                                                    <option value="groq">Groq</option>
                                                    <option value="custom">Custom (OpenAI Compatible)</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-neutral-800">Nama Model Utama</label>
                                                <input
                                                    type="text"
                                                    value={settings.primary_model}
                                                    placeholder="Contoh: openai/gpt-oss-120b"
                                                    onChange={(e) => handleInputChange('primary_model', e.target.value)}
                                                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                                <label className="text-xs font-bold text-neutral-800">Base URL Endpoint API</label>
                                                <input
                                                    type="text"
                                                    value={settings.primary_base_url}
                                                    onChange={(e) => handleInputChange('primary_base_url', e.target.value)}
                                                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 font-mono text-[11px] outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                                    <Lock size={12} className="text-neutral-400" /> API Authorization Token (Key)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPrimaryApiKey ? "text" : "password"}
                                                        value={settings.primary_api_key}
                                                        placeholder="Masukkan token baru atau biarkan berisi dot jika tidak ingin mengubah..."
                                                        onChange={(e) => handleInputChange('primary_api_key', e.target.value)}
                                                        className="w-full rounded-xl border border-neutral-200 pl-4 pr-11 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPrimaryApiKey(!showPrimaryApiKey)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center"
                                                    >
                                                        {showPrimaryApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex flex-col gap-3">
                                            <button
                                                type="button"
                                                disabled={testLoading.primary}
                                                onClick={() => testConnection('primary')}
                                                className="inline-flex max-w-fit items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 shadow-3xs transition-all hover:bg-neutral-100"
                                            >
                                                {testLoading.primary ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin text-neutral-500" />
                                                ) : (
                                                    <Activity className="h-3 w-3 text-emerald-600" />
                                                )}
                                                <span>Test Koneksi Model Utama</span>
                                            </button>

                                            {testResult.primary && (
                                                <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
                                                    testResult.primary.success
                                                        ? 'border-emerald-250 bg-emerald-50/30 text-emerald-850'
                                                        : 'border-red-200 bg-red-50/30 text-red-800'
                                                }`}>
                                                    {testResult.primary.success ? (
                                                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                                                    ) : (
                                                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                                    )}
                                                    <span>{testResult.primary.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fallback Model Section */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h2 className="text-base font-bold text-neutral-900">2. Rantai Model Cadangan (Fallback Model)</h2>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Chatbot akan beralih secara otomatis ke model ini jika server utama mengalami downtime.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="fallback_enabled"
                                                    checked={settings.fallback_enabled === '1'}
                                                    onChange={(e) => handleInputChange('fallback_enabled', e.target.checked ? '1' : '0')}
                                                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <label htmlFor="fallback_enabled" className="text-xs font-bold text-neutral-700 cursor-pointer">
                                                    Aktifkan Fallback
                                                </label>
                                            </div>
                                        </div>

                                        {settings.fallback_enabled === '1' && (
                                            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/20 p-4">
                                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-neutral-800">Provider Cadangan</label>
                                                        <select
                                                            value={settings.fallback_provider}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSettings(prev => {
                                                                    const next = { ...prev, fallback_provider: val };
                                                                    if (val === 'nvidia') {
                                                                        next.fallback_base_url = 'https://integrate.api.nvidia.com/v1';
                                                                        next.fallback_model = 'nvidia/nemotron-3-super-120b-a12b';
                                                                    } else if (val === 'groq') {
                                                                        next.fallback_base_url = 'https://api.groq.com/openai/v1';
                                                                        next.fallback_model = 'llama-3.3-70b-versatile';
                                                                    } else if (val === 'openai') {
                                                                        next.fallback_base_url = 'https://api.openai.com/v1';
                                                                        next.fallback_model = 'gpt-4o-mini';
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-bold bg-white outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                        >
                                                            <option value="nvidia">NVIDIA NIM API</option>
                                                            <option value="openai">OpenAI</option>
                                                            <option value="groq">Groq</option>
                                                            <option value="custom">Custom (OpenAI Compatible)</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-neutral-800">Nama Model Fallback (Pilihan Wajib)</label>
                                                        <input
                                                            type="text"
                                                            list="fallback-models-list"
                                                            value={settings.fallback_model}
                                                            onChange={(e) => handleInputChange('fallback_model', e.target.value)}
                                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                            placeholder="Pilih atau masukkan nama model fallback..."
                                                            required
                                                        />
                                                        <datalist id="fallback-models-list">
                                                            <option value="nvidia/nemotron-3-super-120b-a12b" />
                                                            <option value="openai/gpt-oss-120b" />
                                                            <option value="z-ai/glm-5.1" />
                                                            <option value="llama-3.3-70b-versatile" />
                                                            <option value="llama-3.1-8b-instant" />
                                                            <option value="llama3-70b-8192" />
                                                            <option value="mixtral-8x7b-32768" />
                                                        </datalist>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                                        <label className="text-xs font-bold text-neutral-800">Base URL Endpoint Fallback</label>
                                                        <input
                                                            type="text"
                                                            value={settings.fallback_base_url}
                                                            onChange={(e) => handleInputChange('fallback_base_url', e.target.value)}
                                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 font-mono text-[11px] outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                                            <Lock size={12} className="text-neutral-400" /> API Authorization Token Fallback
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type={showFallbackApiKey ? "text" : "password"}
                                                                value={settings.fallback_api_key}
                                                                placeholder="Masukkan token baru atau biarkan berisi dot jika tidak ingin mengubah..."
                                                                onChange={(e) => handleInputChange('fallback_api_key', e.target.value)}
                                                                className="w-full rounded-xl border border-neutral-200 pl-4 pr-11 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowFallbackApiKey(!showFallbackApiKey)}
                                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center"
                                                            >
                                                                {showFallbackApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-col gap-3">
                                                    <button
                                                        type="button"
                                                        disabled={testLoading.fallback}
                                                        onClick={() => testConnection('fallback')}
                                                        className="inline-flex max-w-fit items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 shadow-3xs transition-all hover:bg-neutral-100"
                                                    >
                                                        {testLoading.fallback ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin text-neutral-500" />
                                                        ) : (
                                                            <Activity className="h-3 w-3 text-amber-600" />
                                                        )}
                                                        <span>Test Koneksi Model Cadangan</span>
                                                    </button>

                                                    {testResult.fallback && (
                                                        <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
                                                            testResult.fallback.success
                                                                ? 'border-emerald-250 bg-emerald-50/30 text-emerald-850'
                                                                : 'border-red-200 bg-red-50/30 text-red-800'
                                                        }`}>
                                                            {testResult.fallback.success ? (
                                                                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                                                            ) : (
                                                                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                                            )}
                                                            <span>{testResult.fallback.message}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: KEAMANAN & GUARDRAILS */}
                            {activeTab === 'keamanan' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-base font-bold text-neutral-900">Keamanan Konten & Guardrails</h2>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Konfigurasi pencegahan prompt injection, sensor kata kunci off-topic, dan pembatasan input user.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5">
                                        {/* Max Input Length */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-neutral-800">Panjang Maksimal Karakter Pertanyaan User</label>
                                            <input
                                                type="number"
                                                min="50"
                                                max="2000"
                                                value={settings.max_input_length}
                                                onChange={(e) => handleInputChange('max_input_length', e.target.value)}
                                                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-xs font-medium outline-none focus:border-[#0a6c32] focus:ring-1 focus:ring-[#0a6c32]"
                                                required
                                            />
                                            <p className="text-[10px] text-neutral-400">Pertanyaan yang melebihi batas ini akan ditolak langsung di sisi client/server.</p>
                                        </div>

                                        {/* Info Box Guardrail */}
                                        <div className="flex items-start gap-3 rounded-2xl border border-blue-150 bg-blue-50/20 p-4 text-xs text-neutral-600">
                                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-neutral-800">Sistem Keamanan Bawaan (Default Guardrails):</p>
                                                <ul className="mt-1.5 list-disc pl-4 space-y-1 font-light text-neutral-500">
                                                    <li>Penyaringan otomatis bypass peran (seperti: "ignore previous instructions").</li>
                                                    <li>Penolakan topik yang tidak berkaitan dengan lingkup Biro Keuangan & Aset UMRI.</li>
                                                    <li>Sanitasi otomatis elemen HTML/script tag jahat untuk mencegah injeksi XSS.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Submit */}
                            <div className="mt-6 flex items-center justify-end border-t border-neutral-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a6c32] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#085627] disabled:bg-neutral-300 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    <span>Simpan Pengaturan Chatbot</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
