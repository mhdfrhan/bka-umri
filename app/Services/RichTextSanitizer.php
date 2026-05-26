<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class RichTextSanitizer
{
    /**
     * Sanitize rich text HTML content using HTMLPurifier.
     *
     * @param string $html
     * @return string
     */
    public static function sanitize(string $html): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,br,strong,em,u,s,h2,h3,ul,ol,li,blockquote,a[href|target],img[src|alt],hr');
        $config->set('HTML.TargetBlank', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'data' => true]);

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($html);
    }
}
