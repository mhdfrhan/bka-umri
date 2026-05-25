import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes/public';
import type { AuthLayoutProps } from '@/types';
import { ShieldCheck, Database, Award } from 'lucide-react';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center bg-neutral-50 px-4 font-sans selection:bg-emerald-500 selection:text-white sm:px-8 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between overflow-hidden border-r border-neutral-200/10 p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#0f766e_0%,#064e3b_100%)]" />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />

                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-teal-400/15 blur-[150px]" />

                <div className="relative z-20 flex items-center">
                    <Link href={home()} className="flex items-center">
                        <img
                            src="/assets/logo-bka.png"
                            alt="Logo BKA UMRI"
                            className="object-contain"
                            style={{
                                height: '48px',
                                width: 'auto',
                                filter: 'brightness(0) invert(1)',
                                opacity: 0.9,
                            }}
                        />
                    </Link>
                </div>

                <div className="relative z-20 my-auto max-w-lg space-y-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                            <ShieldCheck className="size-3.5" />
                            Portal Internal Resmi
                        </span>
                        <h2 className="bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-4xl leading-tight font-extrabold tracking-tight text-transparent">
                            Kelola Aset & Keuangan Kampus Lebih Profesional
                        </h2>
                        <p className="text-base leading-relaxed font-light text-neutral-300/90">
                            Selamat datang di Portal Administrasi Biro Keuangan
                            dan Aset (BKA) Universitas Muhammadiyah Riau. Portal
                            amanah, transparan, dan akuntabel.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition-transform group-hover:scale-110">
                                <Database className="size-5" />
                            </div>
                            <h3 className="mb-1 text-sm font-semibold text-white">
                                Aset Terintegrasi
                            </h3>
                            <p className="text-xs font-light text-neutral-300">
                                Pendataan & monitoring seluruh aset kampus
                                secara real-time.
                            </p>
                        </div>
                        <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 transition-transform group-hover:scale-110">
                                <Award className="size-5" />
                            </div>
                            <h3 className="mb-1 text-sm font-semibold text-white">
                                Akuntabilitas Tinggi
                            </h3>
                            <p className="text-xs font-light text-neutral-300">
                                Pelaporan finansial terstandarisasi untuk
                                mendukung akreditasi unggul.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 flex items-center justify-between text-xs text-neutral-400/80">
                    <p>
                        © {new Date().getFullYear()} Universitas Muhammadiyah
                        Riau.
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        <span>Sistem Keuangan Aktif</span>
                    </div>
                </div>
            </div>

            <div className="relative flex h-full items-center justify-center overflow-y-auto py-12 lg:p-8">
                <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/5 blur-[80px]" />

                <div className="relative z-20 mx-auto flex w-full max-w-lg flex-col justify-center space-y-8 px-4 sm:px-6">
                    <div className="flex flex-col items-center gap-3 lg:hidden">
                        <Link
                            href={home()}
                            className="group flex items-center justify-center"
                        >
                            <img
                                src="/assets/logo-bka.png"
                                alt="Logo BKA UMRI"
                                className="h-12 w-auto object-contain transition-transform group-hover:scale-101"
                            />
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-sm">
                        <div className="mb-6 flex flex-col space-y-2">
                            <h1 className="text-2xl leading-none font-extrabold tracking-tight text-neutral-900">
                                {title}
                            </h1>
                            <p className="text-sm leading-relaxed font-light text-neutral-500">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
