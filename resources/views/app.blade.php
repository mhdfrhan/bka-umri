<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="google-site-verification" content="LycMvXlDim8qVZVoOoPHboh9422HCSQOBIGuULYjp7s" />

        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RCY4QQZ9J8"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-RCY4QQZ9J8');
        </script>


        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @php
            $siteName = \App\Models\Pengaturan::getValue('nama_website') ?: 'Biro Keuangan & Aset UMRI';
            $siteDesc = \App\Models\Pengaturan::getValue('deskripsi_seo') ?: 'Portal resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau (UMRI).';
            
            // For Open Graph image, fallback to apple-touch-icon.png which is a good size, 
            // or use logo base64 if available (though base64 isn't ideal for OG, it's a fallback)
            $logoBase64 = \App\Models\Pengaturan::getValue('logo_base64');
            $ogImage = $logoBase64 ? $logoBase64 : url('/apple-touch-icon.png');
            
            // Setup dynamic SEO from Inertia props for crawlers (WhatsApp, Facebook, Twitter, etc.)
            $metaTitle = $siteName;
            $metaDesc = $siteDesc;
            $metaImage = $ogImage;
            $metaType = 'website';
            
            if (isset($page['props']['berita'])) {
                $b = $page['props']['berita'];
                if (isset($b['title'])) {
                    $metaTitle = $b['title'] . ' - ' . $siteName;
                    $cleanContent = trim(substr(strip_tags($b['content'] ?? ''), 0, 160));
                    $metaDesc = $cleanContent ?: $siteDesc;
                    
                    if (!empty($b['thumbnail'])) {
                        $metaImage = str_starts_with($b['thumbnail'], 'http') ? $b['thumbnail'] : url($b['thumbnail']);
                    }
                    $metaType = 'article';
                }
            } elseif (isset($page['props']['announcement'])) {
                $a = $page['props']['announcement'];
                if (isset($a['title'])) {
                    $metaTitle = $a['title'] . ' - ' . $siteName;
                    $cleanContent = trim(substr(strip_tags($a['content'] ?? ''), 0, 160));
                    $metaDesc = $cleanContent ?: $siteDesc;
                    
                    if (!empty($a['thumbnail'])) {
                        $metaImage = str_starts_with($a['thumbnail'], 'http') ? $a['thumbnail'] : url($a['thumbnail']);
                    }
                    $metaType = 'article';
                }
            }
        @endphp

        <meta name="description" content="{{ $metaDesc }}">
        <meta property="og:type" content="{{ $metaType }}">
        <meta property="og:title" content="{{ $metaTitle }}">
        <meta property="og:description" content="{{ $metaDesc }}">
        <meta property="og:image" content="{{ $metaImage }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $metaTitle }}">
        <meta name="twitter:description" content="{{ $metaDesc }}">
        <meta name="twitter:image" content="{{ $metaImage }}">

        <link rel="icon" href="{{ asset('assets/favicon.ico') }}" sizes="any">
        <link rel="icon" href="{{ asset('assets/favicon.png') }}" type="image/png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap">

        @if(isset($first_banner_image) && $first_banner_image)
            <link rel="preload" as="image" href="{{ $first_banner_image }}" fetchpriority="high">
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased overflow-x-hidden">
        <x-inertia::app />
    </body>
</html>
