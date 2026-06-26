<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - BKA UMRI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
        body { font-family: 'Instrument Sans', sans-serif; }
    </style>
</head>
<body class="antialiased text-neutral-900 bg-white">
    <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50/30 p-6 md:p-12">
        <!-- Modern subtle grids & gradients background -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <!-- Theme Orbs -->
        @if(trim($__env->yieldContent('code')) == '404')
            <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]"></div>
            <div class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[#0a6c32]/5 blur-[120px]"></div>
        @elseif(trim($__env->yieldContent('code')) == '503')
            <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]"></div>
            <div class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[#0a6c32]/5 blur-[120px]"></div>
        @else
            <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-500/5 blur-[120px]"></div>
            <div class="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]"></div>
        @endif

        <div class="relative z-10 w-full max-w-xl space-y-6 text-center select-none md:space-y-8">
            <!-- Massive status code -->
            <div class="relative flex items-center justify-center">
                <span class="bg-gradient-to-b from-neutral-300/80 to-neutral-100/10 bg-clip-text text-[10rem] leading-none font-black tracking-tighter text-transparent select-none sm:text-[14rem] md:text-[18rem] lg:text-[22rem] px-6">
                    @yield('code')
                </span>
            </div>

            <!-- Error Content -->
            <div class="space-y-3">
                <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                    @yield('message')
                </h1>
                <p class="mx-auto max-w-lg text-sm leading-relaxed font-light text-neutral-500 md:text-base">
                    @yield('description')
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                @if(trim($__env->yieldContent('code')) != '503')
                <a href="/" class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0a6c32] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-800/10 transition-all hover:bg-[#085627] sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Kembali ke Beranda</span>
                </a>
                @endif
                <button onclick="window.location.reload()" class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-bold text-neutral-600 transition-all hover:bg-neutral-50 sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    <span>Muat Ulang Halaman</span>
                </button>
            </div>
        </div>
    </div>
</body>
</html>
