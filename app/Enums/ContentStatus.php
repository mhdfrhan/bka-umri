<?php

namespace App\Enums;

enum ContentStatus: string
{
    case DRAF = 'draf';
    case TERPUBLIKASI = 'terpublikasi';
    case DIARSIPKAN = 'diarsipkan';

    public function label(): string
    {
        return match ($this) {
            self::DRAF => 'Draf',
            self::TERPUBLIKASI => 'Terpublikasi',
            self::DIARSIPKAN => 'Diarsipkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAF => 'neutral',
            self::TERPUBLIKASI => 'success',
            self::DIARSIPKAN => 'warning',
        };
    }
}
