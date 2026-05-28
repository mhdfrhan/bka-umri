<?php

namespace App\Services;

use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;

class MediaUploadHelper
{
    /**
     * Generate a proper filename from a base64 data URI.
     *
     * @param string $base64Data The base64 data URI (e.g., data:image/png;base64,...)
     * @param string $prefix Optional prefix for the filename
     * @return string Generated filename with proper extension
     */
    public static function filenameFromBase64(string $base64Data, string $prefix = 'upload'): string
    {
        $extension = 'bin';

        if (preg_match('/^data:([^;]+);base64/', $base64Data, $matches)) {
            $mime = $matches[1];
            $map = [
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'image/svg+xml' => 'svg',
                'application/pdf' => 'pdf',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
                'application/vnd.ms-excel' => 'xls',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
                'application/vnd.ms-powerpoint' => 'ppt',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            ];
            $extension = $map[$mime] ?? explode('/', $mime)[1] ?? 'bin';
        }

        return Str::slug($prefix) . '_' . time() . '_' . Str::random(6) . '.' . $extension;
    }

    /**
     * Add media from base64 data URI with a proper filename.
     *
     * @param HasMedia $model The model to add media to
     * @param string $base64Data The base64 data URI
     * @param string $collection The media collection name
     * @param string $prefix Optional prefix for the filename
     * @return void
     */
    public static function addFromBase64(HasMedia $model, string $base64Data, string $collection, string $prefix = 'upload'): void
    {
        $filename = static::filenameFromBase64($base64Data, $prefix);

        $model->addMediaFromBase64($base64Data)
            ->usingFileName($filename)
            ->toMediaCollection($collection);
    }

    /**
     * Add media from URL with error handling.
     *
     * @param HasMedia $model The model to add media to
     * @param string $url The remote URL
     * @param string $collection The media collection name
     * @return void
     */
    public static function addFromUrl(HasMedia $model, string $url, string $collection): void
    {
        try {
            $model->addMediaFromUrl($url)->toMediaCollection($collection);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to download media from URL: {$url}", [
                'error' => $e->getMessage(),
                'model' => get_class($model),
                'model_id' => $model->getKey(),
            ]);
        }
    }

    /**
     * Add media from either base64 or URL depending on the data format.
     * Returns false if the data didn't match any uploadable format.
     *
     * @param HasMedia $model The model to add media to
     * @param string $data The base64 data URI or remote URL
     * @param string $collection The media collection name
     * @param string $prefix Optional prefix for the filename
     * @return bool Whether media was successfully added
     */
    public static function addFromDataOrUrl(HasMedia $model, string $data, string $collection, string $prefix = 'upload'): bool
    {
        if (str_starts_with($data, 'data:')) {
            static::addFromBase64($model, $data, $collection, $prefix);
            return true;
        }

        if (str_starts_with($data, 'http') || str_starts_with($data, '/storage/')) {
            // Check if it's a local storage URL/path
            $localPath = null;
            $storagePos = strpos($data, '/storage/');
            if ($storagePos !== false) {
                $relativePath = substr($data, $storagePos + strlen('/storage/'));
                // Strip query string if any
                if (($qPos = strpos($relativePath, '?')) !== false) {
                    $relativePath = substr($relativePath, 0, $qPos);
                }
                $potentialPath = storage_path('app/public/' . urldecode($relativePath));
                if (file_exists($potentialPath) && is_file($potentialPath)) {
                    $localPath = $potentialPath;
                }
            }

            if ($localPath) {
                try {
                    $model->addMedia($localPath)
                        ->preservingOriginal()
                        ->toMediaCollection($collection);
                    return true;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Failed to link local media: {$localPath}", [
                        'error' => $e->getMessage(),
                        'model' => get_class($model),
                    ]);
                }
            }

            if (str_starts_with($data, 'http')) {
                static::addFromUrl($model, $data, $collection);
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the provided data is a new upload (not an existing media URL from current host).
     *
     * @param string $data The data to check
     * @param string|null $currentMediaUrl The current media URL (if any)
     * @return bool
     */
    public static function isNewUpload(string $data, ?string $currentMediaUrl = null): bool
    {
        // Base64 data is always new
        if (str_starts_with($data, 'data:')) {
            return true;
        }

        // If it's same as current media URL, not new
        if ($currentMediaUrl && $data === $currentMediaUrl) {
            return false;
        }

        // If it's a relative path and matches the path of the current media URL
        if ($currentMediaUrl) {
            $currentPath = parse_url($currentMediaUrl, PHP_URL_PATH);
            $newPath = parse_url($data, PHP_URL_PATH);
            if ($currentPath && $newPath && $currentPath === $newPath) {
                return false;
            }
        }

        // Otherwise, if it starts with http or /storage/, it is a new upload/selection!
        return str_starts_with($data, 'http') || str_starts_with($data, '/storage/');
    }

    /**
     * Extract all image URLs from a block of HTML content.
     *
     * @param string $content
     * @return array
     */
    public static function extractImageUrls(string $content): array
    {
        if (empty($content)) {
            return [];
        }
        
        preg_match_all('/<img[^>]+src="([^">]+)"/i', $content, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Delete an asset / media by its public URL.
     *
     * @param string $url
     * @return void
     */
    public static function deleteMediaByUrl(string $url): void
    {
        // Remove host from URL to get path
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) return;

        // Try to match standard Spatie media path structure: /storage/{id}/{filename} or /storage/media/{id}/{filename}
        if (preg_match('/\/storage\/(?:media\/)?([0-9]+)\//', $path, $matches)) {
            $mediaId = $matches[1];
            $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::find($mediaId);
            if ($media) {
                $model = $media->model;
                
                // Delete Spatie media file and DB record
                $media->delete();
                
                // If parent model is AsetMedia, delete the model instance too
                if ($model instanceof \App\Models\AsetMedia) {
                    $model->delete();
                }
            }
        }
    }

    /**
     * Compare old HTML and new HTML, and delete any local storage images that were removed.
     *
     * @param string|null $oldContent
     * @param string|null $newContent
     * @return void
     */
    public static function cleanupContentImages(?string $oldContent, ?string $newContent): void
    {
        $oldUrls = static::extractImageUrls($oldContent ?? '');
        $newUrls = static::extractImageUrls($newContent ?? '');
        
        // Find URLs that are in oldContent but no longer in newContent
        $removedUrls = array_diff($oldUrls, $newUrls);
        
        foreach ($removedUrls as $url) {
            static::deleteMediaByUrl($url);
        }
    }

    /**
     * Delete all local storage images embedded inside an HTML content block (e.g. when deleting a post).
     *
     * @param string|null $content
     * @return void
     */
    public static function deleteAllContentImages(?string $content): void
    {
        $urls = static::extractImageUrls($content ?? '');
        foreach ($urls as $url) {
            static::deleteMediaByUrl($url);
        }
    }
}

