export function truncateText(text: string, length: number): string {
    if (!text) {
return '';
}

    if (text.length <= length) {
return text;
}
    
    // Attempt to not break words
    const truncated = text.substring(0, length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
        return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
}
