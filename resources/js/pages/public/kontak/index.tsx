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
    Compass,
    Layers,
    Navigation,
    Maximize2,
    Copy,
    Check,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHero } from '@/components/layout/page-hero';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';
import 'maplibre-gl/dist/maplibre-gl.css';

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
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4167965592992!2d101.41546138047615!3d0.49870495320004715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a940e01df989%3A0xdc96c279c6f07bc3!2sUniversitas%20Muhammadiyah%20Riau!5e0!3m2!1sid!2sid!4v1779673086975!5m2!1sid!2sid',
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
    const [localKontak, setLocalKontak] = useState<KontakDetail | null>(null);

    // Initial Hydration from local storage
    useEffect(() => {
        const savedSettings = localStorage.getItem('bka_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setLocalKontak({
                    alamat: parsed.alamat,
                    telepon: parsed.telepon,
                    email: parsed.email,
                    jam_operasional: parsed.jam_operasional,
                    google_maps_embed: parsed.google_maps_embed,
                    mediaSosial: parsed.mediaSosial
                });
            } catch {}
        }
    }, []);

    // Safe fallback handling for dynamic vs mock data
    const resolvedKontak = localKontak || kontak || dummyKontak;

    // ─── MAPLIBRE GL INTERACTIVE MAP ENGINE STATES & REFS ───
    const MAP_STYLES = [
        { id: 'voyager', label: 'Voyager (Warna)', url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
        { id: 'positron', label: 'Positron (Terang)', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
        { id: 'dark-matter', label: 'Dark Matter (Gelap)', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
    ];

    const CAMPUS_POIS = [
        {
            id: 'bka',
            label: 'Kantor BKA (Rektorat)',
            coords: [101.415461, 0.498705] as [number, number],
            zoom: 17.6,
            pitch: 62,
            bearing: 30,
            desc: 'Pusat layanan administrasi keuangan & aset di Gedung Rektorat Utama.'
        },
        {
            id: 'gerbang',
            label: 'Gerbang Utama Kampus',
            coords: [101.416800, 0.499000] as [number, number],
            zoom: 16.8,
            pitch: 45,
            bearing: -45,
            desc: 'Akses masuk gerbang depan Universitas Muhammadiyah Riau.'
        },
        {
            id: 'dahlan',
            label: 'Gedung KH Ahmad Dahlan',
            coords: [101.414700, 0.498200] as [number, number],
            zoom: 17.0,
            pitch: 52,
            bearing: 60,
            desc: 'Gedung perkuliahan utama & ruang dekanat fakultas terintegrasi.'
        }
    ];

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const orbitFrameRef = useRef<number | null>(null);
    
    const [activeStyleId, setActiveStyleId] = useState('voyager');
    const [is3DMode, setIs3DMode] = useState(false);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [centerCoords, setCenterCoords] = useState({ lat: 0.498705, lng: 101.415461 });
    const [copied, setCopied] = useState(false);

    // Initializing MapLibre GL dynamically to prevent SSR global evaluation issues
    useEffect(() => {
        if (typeof window === 'undefined' || !mapContainerRef.current) return;

        let map: any;

        import('maplibre-gl').then((maplibreglModule) => {
            const maplibregl = maplibreglModule.default;

            // Smart Night-mode Auto-switcher: default to dark-matter style if local time is night
            const currentHour = new Date().getHours();
            const isNightTime = currentHour >= 18 || currentHour < 6;
            const initialStyleUrl = isNightTime ? MAP_STYLES[2].url : MAP_STYLES[0].url;
            setActiveStyleId(isNightTime ? 'dark-matter' : 'voyager');

            map = new maplibregl.Map({
                container: mapContainerRef.current!,
                style: initialStyleUrl,
                center: [101.415461, 0.498705], // Lng, Lat
                zoom: 16,
                pitch: isNightTime ? 45 : 0,
                bearing: isNightTime ? -15 : 0,
                dragRotate: true,
            });

            if (isNightTime) {
                setIs3DMode(true);
            }

            mapInstanceRef.current = map;

            // Wait for style to load then add custom Forrest Green markers for all POIs
            map.on('load', () => {
                CAMPUS_POIS.forEach(poi => {
                    const isBka = poi.id === 'bka';
                    
                    // Create custom pulsed marker DOM element
                    const el = document.createElement('div');
                    el.className = 'custom-marker cursor-pointer';
                    el.innerHTML = `
                        <div class="relative flex items-center justify-center group/marker">
                            <div class="animate-ping absolute inline-flex h-7 w-7 rounded-full ${isBka ? 'bg-[#1B5E20]' : 'bg-[#C8A000]'} opacity-75"></div>
                            <div class="relative flex items-center justify-center rounded-full bg-white border-2 ${isBka ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-[#C8A000] text-[#C8A000]'} p-1.5 shadow-md hover:scale-110 transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    `;

                    // Add popup
                    const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
                        <div class="p-2 text-center select-none font-sans max-w-[180px]">
                            <p class="font-extrabold text-[#1A1A1A] text-xs">${poi.label}</p>
                            <p class="text-[9px] text-neutral-500 font-light mt-0.5">${poi.desc}</p>
                        </div>
                    `);

                    // Create and add marker
                    new maplibregl.Marker({ element: el })
                        .setLngLat(poi.coords)
                        .setPopup(popup)
                        .addTo(map);
                });
            });

            // Track coordinate moves
            map.on('move', () => {
                const center = map.getCenter();
                setCenterCoords({ lat: center.lat, lng: center.lng });
            });

            // Interruption handlers: stop orbiting if the user manually drags/pans/manipulates the map
            map.on('dragstart', () => stopOrbitSilently());
            map.on('zoomstart', () => stopOrbitSilently());
            map.on('rotatestart', () => stopOrbitSilently());
        });

        // Cleanup map instance on unmount
        return () => {
            if (orbitFrameRef.current) {
                cancelAnimationFrame(orbitFrameRef.current);
            }
            if (map) {
                map.remove();
            }
        };
    }, []);

    // ─── MAP CONTROL ACTIONS ───
    const handleStyleChange = (url: string, id: string) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setStyle(url);
            setActiveStyleId(id);
            toast.success(`Gaya peta berhasil diubah ke ${id.toUpperCase()}`);
        }
    };

    const handleRecenter = () => {
        stopOrbitSilently();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.easeTo({
                center: [101.415461, 0.498705],
                zoom: 16.2,
                pitch: is3DMode ? 45 : 0,
                bearing: 0,
                duration: 1500
            });
            toast.success('Peta dikembalikan ke lokasi kampus utama.');
        }
    };

    const handleToggle3D = () => {
        const nextMode = !is3DMode;
        setIs3DMode(nextMode);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.easeTo({
                pitch: nextMode ? 45 : 0,
                bearing: nextMode ? -20 : 0,
                duration: 1200
            });
            toast.success(nextMode ? 'Mode kemiringan 3D diaktifkan' : 'Mode 2D diaktifkan');
        }
    };

    const handleCopyCoords = () => {
        navigator.clipboard.writeText('0.498705, 101.415461');
        setCopied(true);
        toast.success('Koordinat Rektorat UMRI disalin ke papan klip!');
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── CINEMATIC 3D ORBIT & POI TOUR ENGINE ───
    const handleFlyToPOI = (poi: typeof CAMPUS_POIS[0]) => {
        stopOrbitSilently();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
                center: poi.coords,
                zoom: poi.zoom,
                pitch: poi.pitch,
                bearing: poi.bearing,
                speed: 0.7,
                curve: 1.35,
                essential: true,
                duration: 2500
            });
            toast.info(`Terbang menuju: ${poi.label}`);
        }
    };

    const startOrbit = () => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Fly to campus center and set beautiful 3D view
        map.flyTo({
            center: [101.415461, 0.498705],
            zoom: 17.4,
            pitch: 62,
            bearing: 0,
            essential: true,
            duration: 2500
        });

        setTimeout(() => {
            setIsOrbiting(true);
            setIs3DMode(true);
            let bearing = 0;
            const orbitLoop = () => {
                if (!mapInstanceRef.current) return;
                bearing = (bearing + 0.12) % 360;
                mapInstanceRef.current.setBearing(bearing);
                orbitFrameRef.current = requestAnimationFrame(orbitLoop);
            };
            orbitFrameRef.current = requestAnimationFrame(orbitLoop);
            toast.success("Mode Tour Orbit 3D Aktif. Geser peta untuk menghentikan putaran.");
        }, 2700);
    };

    const stopOrbit = () => {
        setIsOrbiting(false);
        if (orbitFrameRef.current) {
            cancelAnimationFrame(orbitFrameRef.current);
            orbitFrameRef.current = null;
            toast.info("Mode Tour Orbit 3D Dihentikan.");
        }
    };

    const stopOrbitSilently = () => {
        setIsOrbiting(false);
        if (orbitFrameRef.current) {
            cancelAnimationFrame(orbitFrameRef.current);
            orbitFrameRef.current = null;
        }
    };

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
            // Push message to local storage array for dynamic Inbox dashboard
            try {
                let currentMessages = [];
                const savedInbox = localStorage.getItem('bka_pesan');
                if (savedInbox) {
                    try { currentMessages = JSON.parse(savedInbox); } catch {}
                }
                const newMsg = {
                    id: 'msg-' + Date.now(),
                    nama: formData.nama.trim(),
                    email: formData.email.trim(),
                    subjek: formData.subjek.trim(),
                    pesan: formData.pesan.trim(),
                    tanggal: new Date().toISOString(),
                    dibaca: false
                };
                const updatedInbox = [newMsg, ...currentMessages];
                localStorage.setItem('bka_pesan', JSON.stringify(updatedInbox));
            } catch (err) {
                console.error('Failed to save message to local storage inbox', err);
            }

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

                            {/* Maps placeholder removed in favor of full-width interactive section below */}
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

            {/* FULL WIDTH INTERACTIVE MAPLIBRE MAP SECTION */}
            <section className="relative w-full border-t border-[#DDE5DD] bg-white">
                {/* Visual Section Intro Header */}
                <div className="bka-container pt-12 pb-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5E20]">Lokasi Kampus Utama</span>
                        <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Peta Interaktif Kampus Universitas Muhammadiyah Riau</h2>
                        <p className="text-xs text-[#5C6B73] font-light max-w-2xl">
                            Eksplorasi wilayah kampus UMRI secara interaktif menggunakan rendering vektor 3D 60FPS. Anda dapat menggeser, melakukan zoom, memutar orientasi peta, dan mengganti gaya visual peta.
                        </p>
                    </div>
                </div>

                {/* Maplibre container */}
                <div className="relative w-full h-[480px] md:h-[580px] bg-slate-100 group select-none">
                    <div ref={mapContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

                    {/* Floating Controls Overlay - Top Left: Styles, Tour & POIs Panel */}
                    <div className="absolute top-4 left-4 z-10 w-64 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#DDE5DD] shadow-sm flex flex-col gap-3.5 transition-all select-none">
                        {/* Style Selection header */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 px-1 pb-1 border-b border-[#F1F3F1] text-[9px] font-extrabold uppercase tracking-wide text-neutral-400">
                                <Layers size={10} className="text-[#1B5E20]" />
                                <span>Gaya Visual Peta</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {MAP_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => handleStyleChange(style.url, style.id)}
                                        className={cn(
                                            "text-[9px] font-extrabold py-1.5 px-1 rounded-lg transition-all text-center outline-none cursor-pointer border",
                                            activeStyleId === style.id
                                                ? "bg-[#1B5E20] border-[#1B5E20] text-white shadow-2xs"
                                                : "bg-white hover:bg-[#E8F5E9] border-neutral-200 text-neutral-600"
                                        )}
                                    >
                                        <span>{style.id === 'voyager' ? 'Voyager' : style.id === 'positron' ? 'Terang' : 'Gelap'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3D Cinematic Tour Block */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between px-1 pb-1 border-b border-[#F1F3F1] text-[9px] font-extrabold uppercase tracking-wide text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <Compass size={10} className="text-[#1B5E20]" />
                                    <span>Cinematic Tour 3D</span>
                                </span>
                                <span className={cn("h-1.5 w-1.5 rounded-full", isOrbiting ? "bg-emerald-500 animate-ping" : "bg-neutral-300")} />
                            </div>
                            
                            <button
                                type="button"
                                onClick={isOrbiting ? stopOrbit : startOrbit}
                                className={cn(
                                    "w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all outline-none cursor-pointer border",
                                    isOrbiting
                                        ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100/50"
                                        : "bg-emerald-50/70 border-emerald-200 text-[#1B5E20] hover:bg-[#1B5E20]/15"
                                )}
                            >
                                <Compass size={12} className={cn(isOrbiting && "animate-spin-slow")} />
                                <span>{isOrbiting ? 'Matikan Orbit' : 'Mulai Orbit 3D'}</span>
                            </button>
                        </div>

                        {/* POIs List Block */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 px-1 pb-1 border-b border-[#F1F3F1] text-[9px] font-extrabold uppercase tracking-wide text-neutral-400">
                                <MapPin size={10} className="text-[#1B5E20]" />
                                <span>Kawasan Kampus (POIs)</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {CAMPUS_POIS.map(poi => (
                                    <button
                                        key={poi.id}
                                        type="button"
                                        onClick={() => handleFlyToPOI(poi)}
                                        className="w-full flex items-center gap-2 text-left py-1.5 px-2.5 rounded-lg bg-neutral-50/50 hover:bg-[#E8F5E9]/50 border border-neutral-100 hover:border-[#1B5E20]/20 text-[10px] text-neutral-700 font-bold transition-all outline-none cursor-pointer"
                                    >
                                        <div className={cn("size-2 rounded-full shrink-0", poi.id === 'bka' ? "bg-[#1B5E20]" : "bg-[#C8A000]")} />
                                        <span className="truncate flex-1">{poi.label}</span>
                                        <Maximize2 size={9} className="opacity-40" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating Controls Overlay - Top Right: Quick Navigation Tools */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        {/* Re-center Button */}
                        <button
                            type="button"
                            onClick={handleRecenter}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-md border border-[#DDE5DD] hover:bg-white text-[#1B5E20] shadow-sm transition-all hover:scale-105 outline-none cursor-pointer"
                            title="Kembali ke UMRI"
                        >
                            <Navigation size={16} />
                        </button>
                        
                        {/* Tilt / 3D Mode Toggle */}
                        <button
                            type="button"
                            onClick={handleToggle3D}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-md border shadow-sm transition-all hover:scale-105 outline-none cursor-pointer",
                                is3DMode
                                    ? "border-[#1B5E20]/40 text-[#1B5E20] bg-emerald-50/50"
                                    : "border-[#DDE5DD] text-neutral-500 hover:bg-white"
                            )}
                            title="Aktifkan Mode 3D / Kemiringan"
                        >
                            <Compass size={16} className={cn(is3DMode && "animate-pulse")} />
                        </button>
                    </div>

                    {/* Floating Info Overlay - Bottom Left: Coordinates Tracker */}
                    <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#DDE5DD] shadow-xs text-[10px] font-semibold text-neutral-500">
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>Koordinat Peta:</span>
                        </div>
                        <div className="font-mono">
                            <span>Lat: </span>
                            <span className="text-neutral-800 font-bold select-all">{centerCoords.lat.toFixed(6)}</span>
                        </div>
                        <div className="font-mono">
                            <span>Lng: </span>
                            <span className="text-neutral-800 font-bold select-all">{centerCoords.lng.toFixed(6)}</span>
                        </div>
                    </div>

                    {/* Floating Info Overlay - Bottom Right: Interactive Contact Details Glassmorphism Card */}
                    <div className="absolute bottom-4 right-4 z-10 w-72 bg-white/80 backdrop-blur-lg border border-[#DDE5DD]/80 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] shrink-0">
                                <MapPin size={12} />
                            </div>
                            <span className="text-xs font-bold text-[#1A1A1A]">Rektorat UMRI Pekanbaru</span>
                        </div>
                        <p className="text-[10px] text-[#5C6B73] leading-relaxed font-light">
                            Jl. T. Tambusai, Delima, Kec. Tampan, Kota Pekanbaru, Riau 28290. Gedung Rektorat Utama, Ruang BKA.
                        </p>
                        
                        <div className="flex gap-1.5 mt-1 border-t border-[#F1F3F1] pt-2.5 select-none">
                            <button
                                type="button"
                                onClick={handleCopyCoords}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-[10px] font-bold text-neutral-600 transition-colors cursor-pointer outline-none"
                            >
                                {copied ? (
                                    <>
                                        <Check size={11} className="text-[#1B5E20]" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={11} />
                                        <span>Salin Lat Lng</span>
                                    </>
                                )}
                            </button>
                            <a
                                href="https://maps.google.com/?q=Universitas+Muhammadiyah+Riau"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1B5E20] hover:bg-[#145218] text-white text-[10px] font-bold transition-all hover:scale-[1.02] shadow-xs text-center"
                            >
                                <Maximize2 size={11} />
                                <span>Buka Google Maps</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
