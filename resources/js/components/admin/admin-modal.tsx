import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    className?: string;
}

export function AdminModal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    maxWidth = 'lg',
    className,
}: AdminModalProps) {
    const [shouldRender, setShouldRender] = React.useState(isOpen);
    const [animate, setAnimate] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setAnimate(true), 10);

            return () => clearTimeout(timer);
        } else {
            setAnimate(false);
            const timer = setTimeout(() => setShouldRender(false), 200);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Listen to Escape key press to close the modal
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) {
        return null;
    }

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 p-4 backdrop-blur-xs transition-all duration-200',
                animate ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200',
                    animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
                    maxWidthClasses[maxWidth],
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                {(title || icon) && (
                    <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-100 pb-3">
                        <h3 className="flex items-center gap-2 text-base font-bold text-neutral-800">
                            {icon}
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-neutral-400 transition-colors outline-none hover:bg-neutral-100 hover:text-neutral-600"
                            aria-label="Tutup"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                )}

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto pr-1">{children}</div>
            </div>
        </div>
    );
}

export default AdminModal;
