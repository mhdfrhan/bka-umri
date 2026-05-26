<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class UpdateLastLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        $user->last_login_at = now();
        $user->save();

        activity()
            ->causedBy($user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('Berhasil login');
    }
}
