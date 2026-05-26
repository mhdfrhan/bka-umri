<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-superadmin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Super Admin user in the system';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Enforce maximum 2 Super Admins limit
        $superAdminCount = User::role('super_admin')->count();
        if ($superAdminCount >= 2) {
            $this->error('Batas Maksimum Terpenuhi: Sistem dibatasi maksimal memiliki 2 akun Super Admin.');
            return self::FAILURE;
        }

        $name = $this->ask('Masukkan Nama Lengkap');
        if (empty($name)) {
            $this->error('Nama tidak boleh kosong.');
            return self::FAILURE;
        }

        $email = $this->ask('Masukkan Alamat Email');
        $emailValidator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($emailValidator->fails()) {
            $this->error('Email tidak valid atau sudah digunakan: ' . $emailValidator->errors()->first('email'));
            return self::FAILURE;
        }

        $password = $this->secret('Masukkan Kata Sandi (Password)');
        $passwordConfirmation = $this->secret('Konfirmasi Kata Sandi');

        if ($password !== $passwordConfirmation) {
            $this->error('Konfirmasi kata sandi tidak cocok.');
            return self::FAILURE;
        }

        $passwordValidator = Validator::make(['password' => $password], [
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ]);

        if ($passwordValidator->fails()) {
            $this->error('Kata sandi tidak memenuhi kriteria keamanan: ' . $passwordValidator->errors()->first('password'));
            return self::FAILURE;
        }

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => strtolower($email),
            'password' => Hash::make($password),
            'is_active' => true,
        ]);

        $user->assignRole('super_admin');

        $this->info("Akun Super Admin '{$name}' ({$email}) berhasil dibuat.");

        // Record activity log
        activity('user')
            ->causedBy($user)
            ->log("Super Admin baru '{$name}' dibuat via CLI");

        return self::SUCCESS;
    }
}
