<?php

namespace App\Models;

use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Media extends BaseMedia
{
    /**
     * Get the URL of the media file.
     *
     * @param string $conversionName
     * @return string
     */
    public function getUrl(string $conversionName = ''): string
    {
        if ($this->hasCustomProperty('original_url')) {
            return $this->getCustomProperty('original_url');
        }

        return parent::getUrl($conversionName);
    }

    /**
     * Get the full path of the media file.
     *
     * @param string $conversionName
     * @return string
     */
    public function getPath(string $conversionName = ''): string
    {
        if ($this->hasCustomProperty('original_url')) {
            $url = $this->getCustomProperty('original_url');
            $storagePos = strpos($url, '/storage/');
            if ($storagePos !== false) {
                $relativePath = substr($url, $storagePos + strlen('/storage/'));
                if (($qPos = strpos($relativePath, '?')) !== false) {
                    $relativePath = substr($relativePath, 0, $qPos);
                }
                $potentialPath = storage_path('app/public/' . urldecode($relativePath));
                if (file_exists($potentialPath) && is_file($potentialPath)) {
                    return $potentialPath;
                }
            }
        }

        return parent::getPath($conversionName);
    }
}
