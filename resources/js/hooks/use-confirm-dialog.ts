import { useState, useCallback } from 'react';

interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm?: () => void;
}

export function useConfirmDialog() {
    const [state, setState] = useState<ConfirmDialogState>({
        isOpen: false,
        title: '',
    });

    const openConfirm = useCallback((options: Omit<ConfirmDialogState, 'isOpen'>) => {
        setState({
            ...options,
            isOpen: true,
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handleConfirm = useCallback(() => {
        if (state.onConfirm) {
            state.onConfirm();
        }

        closeConfirm();
    }, [state, closeConfirm]);

    return {
        isOpen: state.isOpen,
        title: state.title,
        description: state.description,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        danger: state.danger,
        openConfirm,
        closeConfirm,
        handleConfirm,
    };
}
