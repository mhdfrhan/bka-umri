import { Head, Link, usePage } from '@inertiajs/react';
import { Home, LogIn } from 'lucide-react';
import type { Auth } from '@/types';

export default function Forbidden() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    return (
        <>
            <Head title="Akses Ditolak / Terbatas - BKA UMRI" />

            <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-neutral-50/30 p-6 md:p-12">
                {/* Modern subtle grids & gradients background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute -top-40 -left-40 size-96 rounded-full bg-red-500/5 blur-[120px]" />
                <div className="absolute -right-40 -bottom-40 size-96 rounded-full bg-amber-500/5 blur-[120px]" />

                <div className="relative z-10 w-full max-w-xl space-y-6 text-center select-none md:space-y-8">
                    {/* Massive Elegant 403 Text */}
                    <div className="relative flex items-center justify-center">
                        <span className="bg-gradient-to-b from-neutral-300/80 to-neutral-100/10 bg-clip-text text-[10rem] leading-none font-black tracking-tighter text-transparent select-none sm:text-[14rem] md:text-[18rem] lg:text-[22rem]">
                            403
                        </span>
                    </div>

                    {/* Error Content */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                            Akses Ditolak / Terbatas
                        </h1>
                        <p className="mx-auto max-w-lg text-sm leading-relaxed font-light text-neutral-500 md:text-base">
                            Anda tidak memiliki kredensial wewenang atau hak
                            akses yang sah untuk membuka halaman administrasi
                            ini. Silakan hubungi Admin jika hal ini merupakan
                            kekeliruan.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                        {user ? (
                            <>
                                <Link
                                    href="/"
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3.5 text-xs font-bold text-white transition-all hover:bg-neutral-800 sm:w-auto"
                                >
                                    <Home size={14} />
                                    <span>Kembali ke Beranda</span>
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-3.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 sm:w-auto"
                                >
                                    <span>Keluar dari Akun</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/"
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-bold text-neutral-600 transition-all hover:bg-neutral-50 sm:w-auto"
                                >
                                    <Home size={14} />
                                    <span>Kembali ke Beranda</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0a6c32] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-800/10 transition-all hover:bg-[#085627] sm:w-auto"
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
