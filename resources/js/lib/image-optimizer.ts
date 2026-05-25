export interface OptimizedFileResult {
    base64: string;
    size: number;
    originalSize: number;
    name: string;
    type: 'image' | 'file';
    extension: string;
}

/**
 * Optimizes an uploaded file. If it is a standard image (jpg, png, webp), it resizes
 * it using canvas and converts it to a compressed WebP Base64 string.
 * Other files (documents, PDFs, etc.) are converted to direct Base64 strings.
 */
export function optimizeFile(
    file: File,
    maxWidth = 800,
    quality = 0.7,
): Promise<OptimizedFileResult> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);

    if (isImage && extension !== 'gif') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Clamping size
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas 2D context not available'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Output to WebP
                    const base64 = canvas.toDataURL('image/webp', quality);
                    const padding = base64.endsWith('==')
                        ? 2
                        : base64.endsWith('=')
                          ? 1
                          : 0;
                    const size = Math.round((base64.length * 3) / 4 - padding);

                    resolve({
                        base64,
                        size,
                        originalSize: file.size,
                        name: file.name,
                        type: 'image',
                        extension: 'webp',
                    });
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    } else {
        // Direct Base64 conversion for attachments
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                resolve({
                    base64,
                    size: file.size,
                    originalSize: file.size,
                    name: file.name,
                    type: 'file',
                    extension,
                });
            };
            reader.onerror = (err) => reject(err);
        });
    }
}
