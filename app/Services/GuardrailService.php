<?php

namespace App\Services;

class GuardrailService
{
    /**
     * Patterns that indicate prompt injection or jailbreak attempts.
     */
    private static array $blockedPatterns = [
        '/ignore\s*(all|previous|above|prior|system)\s*(instructions|prompt|rules|commands)/i',
        '/pretend\s+(you\s+are|to\s+be|you\'re)/i',
        '/act\s+as\s+(if|a|an|the|my)/i',
        '/jailbreak/i',
        '/\bDAN\s+mode\b/i',
        '/bypass\s*(the|all|your|this|my)?\s*(filter|rule|restriction|instruction|guardrail|safety|system)/i',
        '/\bignore\s+all\b/i',
        '/you\s+are\s+now\s+(a|an|my|the|free)/i',
        '/forget\s+(everything|all|your|previous)/i',
        '/new\s+persona/i',
        '/override\s+(your|the|all|system)/i',
        '/reveal\s+(your|the|system)\s*(prompt|instructions)/i',
        '/what\s+(is|are)\s+your\s*(system)?\s*(prompt|instructions|rules)/i',
        '/\<\s*script/i',
        '/\<\s*iframe/i',
        '/javascript\s*:/i',
        '/on(click|load|error|mouseover)\s*=/i',
        
        // Block programming/coding/scripting language requests
        '/\b(python|golang|rust|kotlin|swift|ruby|php|java|c\+\+|c#|pascal|fortran|cobol)\b/i',
        '/\b(koding|coding|kodingan|source\s*code|sintaks|syntax)\b/i',
        '/\b(kode|code)\s+(program|python|php|javascript|js|java|html|css|c\+\+|go|c#|sql|perulangan|loop)\b/i',
        '/\b(perulangan|looping)\b/i',
        '/\b(mencetak|print)\s+.*(kali)\b/i',
    ];

    /**
     * Validate user input for security issues.
     *
     * @return array{safe: bool, reason: string|null}
     */
    public static function validateInput(string $message, int $maxLength = 500): array
    {
        // 1. Check length
        if (mb_strlen($message) > $maxLength) {
            return [
                'safe' => false,
                'reason' => 'Pesan terlalu panjang. Maksimal ' . $maxLength . ' karakter.',
            ];
        }

        // 2. Check for empty/whitespace-only
        if (trim($message) === '') {
            return [
                'safe' => false,
                'reason' => 'Pesan tidak boleh kosong.',
            ];
        }

        // 3. Check for prompt injection patterns
        foreach (self::$blockedPatterns as $pattern) {
            if (preg_match($pattern, $message)) {
                return [
                    'safe' => false,
                    'reason' => 'blocked_injection',
                ];
            }
        }

        // 4. Strip HTML tags from the message (sanitize, don't block)
        $stripped = strip_tags($message);
        if ($stripped !== $message) {
            // Contains HTML — use the stripped version but don't block
            return [
                'safe' => true,
                'reason' => null,
                'sanitized' => $stripped,
            ];
        }

        return [
            'safe' => true,
            'reason' => null,
        ];
    }

    /**
     * Sanitize the user message for safe processing.
     */
    public static function sanitize(string $message): string
    {
        // Remove HTML tags
        $clean = strip_tags($message);

        // Normalize whitespace
        $clean = preg_replace('/\s+/', ' ', $clean);

        return trim($clean);
    }
}
