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
        $config->set('HTML.Allowed', 'p[style],br,strong,em,u,s,h1[style],h2[style],h3[style],h4[style],ul,ol,li,blockquote,a[href|target],img[src|alt],hr');
        $config->set('CSS.AllowedProperties', 'text-align');
        $config->set('HTML.TargetBlank', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'data' => true]);

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($html);
    }
}
