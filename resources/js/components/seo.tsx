import { Head, usePage } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    type?: string;
    author?: string;
    publishedTime?: string;
    keywords?: string;
}

export function Seo({ 
    title, 
    description, 
    image, 
    type = 'website',
    author,
    publishedTime,
    keywords 
}: SeoProps) {
    const { props, url } = usePage<any>();
    const siteName = (props.pengaturan?.nama_website) || 'BKA UMRI';
    const siteDescription = (props.pengaturan?.deskripsi_seo) || 'Sistem Informasi Biro Keuangan dan Aset Universitas Muhammadiyah Riau';
    
    // Automatically construct absolute URL
    const appUrl = (typeof window !== 'undefined' ? window.location.origin : '') || '';
    const canonicalUrl = `${appUrl}${url.split('?')[0]}`;
    
    // Default image if none provided
    const defaultImage = props.pengaturan?.logo_base64 || `${appUrl}/assets/logo-bka.png`;
    const finalImage = image || defaultImage;
    
    const finalTitle = title.includes(siteName) ? title : `${title} - ${siteName}`;
    const finalDesc = description || siteDescription;
    const finalKeywords = keywords || `BKA UMRI, Biro Keuangan Aset UMRI, Universitas Muhammadiyah Riau, Keuangan Kampus, ${title}`;
    
    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="title" content={finalTitle} />
            <meta name="description" content={finalDesc} />
            <meta name="keywords" content={finalKeywords} />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <link rel="canonical" href={canonicalUrl} />
            {author && <meta name="author" content={author} />}
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content={siteName} />
            
            {/* Article Specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={finalImage} />
        </Head>
    );
}
