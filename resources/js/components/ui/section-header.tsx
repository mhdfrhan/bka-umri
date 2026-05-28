interface SectionHeaderProps {
    label?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}

export default function SectionHeader({ label, title, description, align = 'left' }: SectionHeaderProps) {
    const isCenter = align === 'center';

    return (
        <div className={isCenter ? 'mb-10 text-center' : 'mb-10 text-left'}>
            {label && (
                <span className="mb-3 inline-block rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0a6c32]">
                    {label}
                </span>
            )}
            <h2 className="text-[clamp(24px,4vw,30px)] font-semibold leading-[1.2] text-[#1A1A1A]">
                {title}
            </h2>
            {description && (
                <>
                    <span className="bka-gold-line mt-4 mb-3" style={isCenter ? { marginLeft: 'auto', marginRight: 'auto' } : undefined} />
                    <p
                        className="text-base leading-relaxed text-[#5C6B73]"
                        style={{ maxWidth: isCenter ? '560px' : '640px', margin: isCenter ? '0 auto' : undefined }}
                    >
                        {description}
                    </p>
                </>
            )}
        </div>
    );
}
