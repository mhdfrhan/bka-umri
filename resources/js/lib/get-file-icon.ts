import { 
    FileIcon, 
    FileTextIcon, 
    FileSpreadsheetIcon, 
    FileVideoIcon, 
    FileAudioIcon, 
    FileImageIcon, 
    FileArchiveIcon 
} from "lucide-react";

export function getFileIcon(filename: string | undefined | null) {
    if (!filename) return FileIcon;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'pdf':
            return FileTextIcon;
        case 'doc':
        case 'docx':
        case 'txt':
        case 'rtf':
            return FileTextIcon;
        case 'xls':
        case 'xlsx':
        case 'csv':
            return FileSpreadsheetIcon;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return FileImageIcon;
        case 'mp4':
        case 'avi':
        case 'mov':
            return FileVideoIcon;
        case 'mp3':
        case 'wav':
            return FileAudioIcon;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return FileArchiveIcon;
        default:
            return FileIcon;
    }
}
