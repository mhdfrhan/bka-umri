import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Home, RefreshCw, Wrench } from 'lucide-react';

interface Props {
    status: number;
}

export default function GenericError({ status }: Props) {
    const isMaintenance = status === 503;

    const errorDetails = {
        500: {
            title: 'Kesalahan Server Internal',
            description:
                'Mohon maaf, sistem mendeteksi adanya gangguan teknis di server internal kami. Tim pengelola sedang meninjau dan memperbaiki kendala ini secepatnya.',
            icon: AlertTriangle,
            iconBg: 'bg-red-50 text-red-600 border-red-100',
        },
        503: {
            title: 'Pemeliharaan Sistem berkala',
            description:
                'Kami sedang melakukan pembaruan infrastruktur and pemeliharaan terjadwal untuk meningkatkan kecepatan dan keandalan sistem portal BKA UMRI. Kami akan segera kembali!',
            icon: Wrench,
            iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        },
        fallback: {
            title: 'Terjadi Kesalahan Sistem',
            description: `Terdapat gangguan sistem yang tidak terduga dalam memproses permintaan Anda. Silakan coba kembali beberapa saat lagi (Kode HTTP: ${status}).`,
            icon: AlertTriangle,
            iconBg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
        },
    };

    const currentError = isMaintenance
        ? errorDetails[503]
        : status === 500
          ? errorDetails[500]
          : errorDetails.fallback;

    return (
        <>
            <Head title={`${currentError.title} - BKA UMRI`} />

            <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-neutral-50/30 p-6 md:p-12">
                {/* Modern subtle grids & gradients background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute -top-40 -left-40 size-96 rounded-full bg-amber-500/5 blur-[120px]" />
                <div className="absolute -right-40 -bottom-40 size-96 rounded-full bg-red-500/5 blur-[120px]" />

                <div className="relative z-10 w-full max-w-xl space-y-6 text-center select-none md:space-y-8">
                    {/* Massive status code */}
                    <div className="relative flex items-center justify-center">
                        <span className="bg-gradient-to-b from-neutral-300/80 to-neutral-100/10 bg-clip-text text-[10rem] leading-none font-black tracking-tighter text-transparent select-none sm:text-[14rem] md:text-[18rem] lg:text-[22rem]">
                            {status}
                        </span>
                    </div>

                    {/* Error Content */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                            {currentError.title}
                        </h1>
                        <p className="mx-auto max-w-lg text-sm leading-relaxed font-light text-neutral-500 md:text-base">
                            {currentError.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                        {!isMaintenance && (
                            <Link
                                href="/"
                                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0a6c32] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-800/10 transition-all hover:bg-[#085627] sm:w-auto"
                            >
                                <Home size={14} />
                                <span>Kembali ke Beranda</span>
                            </Link>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-bold text-neutral-600 transition-all hover:bg-neutral-50 sm:w-auto"
                        >
                            <RefreshCw
                                size={14}
                                className="animate-spin-slow"
                            />
                            <span>Muat Ulang Halaman</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
