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
            description: 'Mohon maaf, sistem mendeteksi adanya gangguan teknis di server internal kami. Tim pengelola sedang meninjau dan memperbaiki kendala ini secepatnya.',
            icon: AlertTriangle,
            iconBg: 'bg-red-50 text-red-600 border-red-100',
        },
        503: {
            title: 'Pemeliharaan Sistem berkala',
            description: 'Kami sedang melakukan pembaruan infrastruktur and pemeliharaan terjadwal untuk meningkatkan kecepatan dan keandalan sistem portal BKA UMRI. Kami akan segera kembali!',
            icon: Wrench,
            iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        },
        fallback: {
            title: 'Terjadi Kesalahan Sistem',
            description: `Terdapat gangguan sistem yang tidak terduga dalam memproses permintaan Anda. Silakan coba kembali beberapa saat lagi (Kode HTTP: ${status}).`,
            icon: AlertTriangle,
            iconBg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
        }
    };

    const currentError = isMaintenance 
        ? errorDetails[503] 
        : (status === 500 ? errorDetails[500] : errorDetails.fallback);

    return (
        <>
            <Head title={`${currentError.title} - BKA UMRI`} />

            <div className="relative min-h-[70vh] flex items-center justify-center p-6 md:p-12 overflow-hidden bg-neutral-50/30">
                {/* Modern subtle grids & gradients background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute -top-40 -left-40 size-96 rounded-full bg-amber-500/5 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-red-500/5 blur-[120px]" />

                <div className="relative z-10 w-full max-w-xl text-center space-y-6 md:space-y-8 select-none">
                    {/* Massive status code */}
                    <div className="relative flex justify-center items-center">
                        <span className="text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-300/80 to-neutral-100/10 select-none">
                            {status}
                        </span>
                    </div>

                    {/* Error Content */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                            {currentError.title}
                        </h1>
                        <p className="text-sm font-light leading-relaxed text-neutral-500 max-w-lg mx-auto md:text-base">
                            {currentError.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        {!isMaintenance && (
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-[#1B5E20] hover:bg-[#145218] text-white font-bold text-xs py-3.5 px-6 transition-all shadow-md shadow-emerald-800/10 cursor-pointer"
                            >
                                <Home size={14} />
                                <span>Kembali ke Beranda</span>
                            </Link>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold text-xs py-3.5 px-6 transition-all cursor-pointer"
                        >
                            <RefreshCw size={14} className="animate-spin-slow" />
                            <span>Muat Ulang Halaman</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
