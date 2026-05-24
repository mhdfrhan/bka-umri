<?php

namespace App\Providers;

use App\Models\User;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureAuthentication();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
    }

    /**
     * Configure custom authentication logic.
     *
     * - Reject inactive accounts (is_active = false)
     * - Update last_login_at on successful login
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if (! $user) {
                return null;
            }

            if (! Hash::check($request->password, $user->password)) {
                return null;
            }

            if (! $user->is_active) {
                return null;
            }

            // Update last login timestamp
            $user->update(['last_login_at' => now()]);

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        /* @chisel-email-verification */
        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));
        /* @end-chisel-email-verification */

        /* @chisel-2fa */
        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));
        /* @end-chisel-2fa */

        /* @chisel-password-confirmation */
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
        /* @end-chisel-password-confirmation */
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        /* @chisel-2fa */
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
        /* @end-chisel-2fa */

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username()).'|'.$request->ip()));

            return Limit::perMinute(5)->by($throttleKey);
        });

        /* @chisel-passkeys */
        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
        /* @end-chisel-passkeys */
    }
}
