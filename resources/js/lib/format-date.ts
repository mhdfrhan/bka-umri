export function formatDate(dateString: string | Date): string {
    if (!dateString) {
        return "-";
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return String(dateString);
        }
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return String(dateString);
    }
}

export function formatRelativeDate(dateString: string | Date): string {
    if (!dateString) {
return "-";
}

    const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
    const date = new Date(dateString);
    const now = new Date();
    
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    
    // If older than a week, show actual date
    if (Math.abs(diffInDays) > 7) {
        return formatDate(date);
    }
    
    if (Math.abs(diffInDays) > 0) {
        return rtf.format(diffInDays, 'day');
    }
    
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

    if (Math.abs(diffInHours) > 0) {
        return rtf.format(diffInHours, 'hour');
    }
    
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));

    return rtf.format(diffInMinutes, 'minute');
}
