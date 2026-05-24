import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface MediaSosialItem {
    platform: string;
    url: string;
}

interface KontakDetail {
    alamat: string;
    telepon: string;
    email: string;
    jam_operasional: string;
    google_maps_embed: string;
    mediaSosial?: MediaSosialItem[];
}

interface KontakProps {
    kontak?: KontakDetail;
}

// ─── Detailed Mock Data for Fallback & Local Evaluator ───
const dummyKontak: KontakDetail = {
    alamat: "Ruang Biro Keuangan dan Aset, Gedung Rektorat Universitas Muhammadiyah Riau\nJl. T. Tambusai, Kota Pekanbaru",
    telepon: '+62 761 35008 / +62 811-7676-000',
    email: 'bka@umri.ac.id',
    jam_operasional:
        "Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB",
    google_maps_embed:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.6892305886367!2d101.41584367501061!3d0.48514986377759885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a9477e68dbb5%3A0xe5a1b32d0c268800!2sUniversitas%20Muhammadiyah%20Riau!5e0!3m2!1sid!2sid!4v1716500000000!5m2!1sid!2sid',
    mediaSosial: [
        { platform: 'Facebook', url: 'https://facebook.com/umri.official' },
        { platform: 'Instagram', url: 'https://instagram.com/umri.official' },
        { platform: 'YouTube', url: 'https://youtube.com' },
        { platform: 'Twitter', url: 'https://twitter.com' },
    ],
};

export default function KontakIndex({ kontak }: KontakProps) {
    const heroRef = useScrollReveal<HTMLDivElement>();
    const leftRef = useScrollReveal<HTMLDivElement>();
    const rightRef = useScrollReveal<HTMLDivElement>();

    // Safe fallback handling for dynamic vs mock data
    const resolvedKontak = kontak || dummyKontak;

    // Form inputs state
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        subjek: '',
        pesan: '',
    });

    // Form validation errors state
    const [errors, setErrors] = useState({
        nama: '',
        email: '',
        subjek: '',
        pesan: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [messageCount, setMessageCount] = useState(0);

    // Dynamic input change handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Real-time validation clearance
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Client-side validation logic
    const validateForm = () => {
        let isValid = true;
        const newErrors = { nama: '', email: '', subjek: '', pesan: '' };

        if (!formData.nama.trim()) {
            newErrors.nama = 'Nama lengkap wajib diisi';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            newErrors.email = 'Alamat email wajib diisi';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Format alamat email tidak valid';
            isValid = false;
        }

        if (!formData.subjek.trim()) {
            newErrors.subjek = 'Subjek pesan wajib diisi';
            isValid = false;
        }

        if (!formData.pesan.trim()) {
            newErrors.pesan = 'Isi pesan wajib diisi';
            isValid = false;
        } else if (formData.pesan.trim().length < 20) {
            newErrors.pesan = 'Pesan minimal berisi 20 karakter';
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Perform validation checks
        if (!validateForm()) {
            return;
        }

        // 2. Perform Mock Rate Limiting check (max 3 messages in current session)
        if (messageCount >= 3) {
            toast.error('Terlalu banyak pesan. Silakan coba lagi nanti.');

            return;
        }

        setSubmitting(true);

        // 3. Simulate backend submission delay (1.5 seconds)
        setTimeout(() => {
            setSubmitting(false);
            setMessageCount((prev) => prev + 1);

            // Success Feedback
            toast.success('Pesan berhasil dikirim!');

            // Form Reset
            setFormData({
                nama: '',
                email: '',
                subjek: '',
                pesan: '',
            });
        }, 1500);
    };

    const breadcrumbItems = [
        { title: 'Beranda', href: '/' },
        { title: 'Hubungi Kami', href: '/kontak' },
    ];

    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'facebook':
                return <Facebook size={16} />;
            case 'instagram':
                return <Instagram size={16} />;
            case 'youtube':
                return <Youtube size={16} />;
            case 'twitter':
            case 'x':
                return <Twitter size={16} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Hubungi Kami - BKA UMRI">
                <meta
                    name="description"
                    content="Kirim pesan langsung, kritik, saran, atau pertanyaan mengenai layanan administrasi keuangan dan pengelolaan aset di Universitas Muhammadiyah Riau."
                />
            </Head>

            {/* Page Hero */}
            <PageHero
                title="Hubungi Kami"
                description="Kami siap membantu Anda. Silakan hubungi kontak resmi kami atau kirimkan pesan melalui formulir di bawah ini."
            >
                <div ref={heroRef} className="bka-reveal">
                    <Breadcrumbs breadcrumbs={breadcrumbItems} />
                </div>
            </PageHero>

            {/* Main Interactive Contact Body */}
            <section className="bg-[#F7F9F7] py-12 md:py-20">
                <div className="bka-container">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
                        {/* LEFT COLUMN: Contact info & Maps Embed (5/12 cols) */}
                        <div
                            ref={leftRef}
                            className="bka-reveal flex flex-col gap-8 lg:col-span-5"
                        >
                            {/* Contact Info Card */}
                            <div className="rounded-2xl border border-[#DDE5DD] bg-white p-6 shadow-sm md:p-8">
                                <h2 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                                    Kantor Biro Keuangan dan Aset
                                </h2>
                                <p className="text-[13px] leading-relaxed text-[#5C6B73] mb-6 border-b border-[#F1F3F1] pb-4">
                                    Jangan ragu untuk menemui kami terkait keuangan dan aset Universitas Muhammadiyah Riau
                                </p>

                                <div className="flex flex-col gap-6">
                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-xs font-bold text-[#5C6B73]">
                                                Alamat Kantor Biro
                                            </span>
                                            <p className="text-[14px] leading-relaxed break-words text-[#1A1A1A] whitespace-pre-line">
                                                {resolvedKontak.alamat}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Telephone */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                                            <Phone size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-xs font-bold text-[#5C6B73]">
                                                Telepon / Hotline
                                            </span>
                                            <p className="text-[14px] leading-normal font-semibold text-[#1A1A1A]">
                                                {resolvedKontak.telepon}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                                            <Mail size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-xs font-bold text-[#5C6B73]">
                                                Email Resmi
                                            </span>
                                            <a
                                                href={`mailto:${resolvedKontak.email}`}
                                                className="text-[14px] leading-normal font-bold text-[#1B5E20] hover:text-[#145218] hover:underline"
                                            >
                                                {resolvedKontak.email}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                                            <Clock size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="mb-1 text-xs font-bold text-[#5C6B73]">
                                                Jam Operasional
                                            </span>
                                            <p className="text-[14px] leading-relaxed text-[#1A1A1A] whitespace-pre-line">
                                                {resolvedKontak.jam_operasional}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                {resolvedKontak.mediaSosial &&
                                    resolvedKontak.mediaSosial.length > 0 && (
                                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F3F1] pt-6">
                                            <span className="text-xs font-bold text-[#5C6B73]">
                                                Media Sosial Resmi BKA:
                                            </span>
                                            <div className="flex gap-2">
                                                {resolvedKontak.mediaSosial.map(
                                                    (med, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={med.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`Official ${med.platform} Page`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F9F7] text-[#5C6B73] transition-all duration-200 hover:bg-[#1B5E20] hover:text-white"
                                                        >
                                                            {getSocialIcon(
                                                                med.platform,
                                                            )}
                                                        </a>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* Responsive Interactive Google Maps Card */}
                            <div className="overflow-hidden rounded-2xl border border-[#DDE5DD] bg-white p-3 shadow-sm">
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                                    <iframe
                                        src={resolvedKontak.google_maps_embed}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Maps Lokasi Universitas Muhammadiyah Riau"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Contact Form (7/12 cols) */}
                        <div
                            ref={rightRef}
                            className="bka-reveal lg:col-span-7"
                        >
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-2xl border border-[#DDE5DD] bg-white p-6 shadow-sm md:p-10"
                            >
                                <h2 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                                    Kirimkan Pesan Anda
                                </h2>
                                <p className="mb-8 text-xs text-[#5C6B73]">
                                    Punya pertanyaan, keluhan, saran, atau
                                    masukan? Silakan isi data di bawah.
                                </p>

                                <div className="flex flex-col gap-5">
                                    {/* Name Input */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="nama"
                                            className="text-xs font-bold text-[#1A1A1A]"
                                        >
                                            Nama Lengkap{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            id="nama"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap Anda..."
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-[#1A1A1A] transition-colors focus:ring-1 focus:outline-none ${
                                                errors.nama
                                                    ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#DDE5DD] focus:border-[#1B5E20] focus:ring-[#1B5E20]'
                                            }`}
                                        />
                                        {errors.nama && (
                                            <span className="text-xs font-semibold text-rose-600">
                                                {errors.nama}
                                            </span>
                                        )}
                                    </div>

                                    {/* Email Input */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-bold text-[#1A1A1A]"
                                        >
                                            Alamat Email{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Masukkan alamat email aktif..."
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-[#1A1A1A] transition-colors focus:ring-1 focus:outline-none ${
                                                errors.email
                                                    ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#DDE5DD] focus:border-[#1B5E20] focus:ring-[#1B5E20]'
                                            }`}
                                        />
                                        {errors.email && (
                                            <span className="text-xs font-semibold text-rose-600">
                                                {errors.email}
                                            </span>
                                        )}
                                    </div>

                                    {/* Subject Input */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="subjek"
                                            className="text-xs font-bold text-[#1A1A1A]"
                                        >
                                            Subjek Pesan{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            id="subjek"
                                            name="subjek"
                                            value={formData.subjek}
                                            onChange={handleChange}
                                            placeholder="Perihal yang ingin dibahas..."
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-[#1A1A1A] transition-colors focus:ring-1 focus:outline-none ${
                                                errors.subjek
                                                    ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#DDE5DD] focus:border-[#1B5E20] focus:ring-[#1B5E20]'
                                            }`}
                                        />
                                        {errors.subjek && (
                                            <span className="text-xs font-semibold text-rose-600">
                                                {errors.subjek}
                                            </span>
                                        )}
                                    </div>

                                    {/* Message TextArea */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="pesan"
                                            className="text-xs font-bold text-[#1A1A1A]"
                                        >
                                            Isi Pesan Lengkap{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            id="pesan"
                                            name="pesan"
                                            value={formData.pesan}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tuliskan detail pertanyaan atau keluhan Anda di sini (minimal 20 karakter)..."
                                            className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-[14px] text-[#1A1A1A] transition-colors focus:ring-1 focus:outline-none ${
                                                errors.pesan
                                                    ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#DDE5DD] focus:border-[#1B5E20] focus:ring-[#1B5E20]'
                                            }`}
                                        />
                                        {errors.pesan ? (
                                            <span className="text-xs font-semibold text-rose-600">
                                                {errors.pesan}
                                            </span>
                                        ) : (
                                            <div className="flex items-center justify-between text-[11px] font-medium text-[#9EAAB2]">
                                                <span>
                                                    Panjang isi pesan:{' '}
                                                    {
                                                        formData.pesan.trim()
                                                            .length
                                                    }{' '}
                                                    karakter
                                                </span>
                                                <span>
                                                    Minimum: 20 karakter
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1B5E20] text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#145218] disabled:cursor-not-allowed disabled:bg-[#1B5E20]/75"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                    <span>
                                                        Sedang Mengirim...
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={14} />
                                                    <span>
                                                        Kirim Pesan Sekarang
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
