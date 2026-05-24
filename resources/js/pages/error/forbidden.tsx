import { Head, Link, usePage } from '@inertiajs/react';
import { Home, LogIn } from 'lucide-react';
import type { Auth } from '@/types';

export default function Forbidden() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    return (
        <>
            <Head title="Akses Ditolak / Terbatas - BKA UMRI" />

            <div className="relative min-h-[70vh] flex items-center justify-center p-6 md:p-12 overflow-hidden bg-neutral-50/30">
                {/* Modern subtle grids & gradients background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute -top-40 -left-40 size-96 rounded-full bg-red-500/5 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/5 blur-[120px]" />

                <div className="relative z-10 w-full max-w-xl text-center space-y-6 md:space-y-8 select-none">
                    {/* Massive Elegant 403 Text */}
                    <div className="relative flex justify-center items-center">
                        <span className="text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-300/80 to-neutral-100/10 select-none">
                            403
                        </span>
                    </div>

                    {/* Error Content */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                            Akses Ditolak / Terbatas
                        </h1>
                        <p className="text-sm font-light leading-relaxed text-neutral-500 max-w-lg mx-auto md:text-base">
                            Anda tidak memiliki kredensial wewenang atau hak akses yang sah untuk membuka halaman administrasi ini. Silakan hubungi Admin jika hal ini merupakan kekeliruan.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        {user ? (
                            <>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-3.5 px-6 transition-all cursor-pointer"
                                >
                                    <Home size={14} />
                                    <span>Kembali ke Beranda</span>
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-3.5 px-6 transition-all cursor-pointer"
                                >
                                    <span>Keluar dari Akun</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold text-xs py-3.5 px-6 transition-all cursor-pointer"
                                >
                                    <Home size={14} />
                                    <span>Kembali ke Beranda</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-[#1B5E20] hover:bg-[#145218] text-white font-bold text-xs py-3.5 px-6 transition-all shadow-md shadow-emerald-800/10 cursor-pointer"
                                >
                                    <LogIn size={14} />
                                    <span>Masuk Administrator</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
