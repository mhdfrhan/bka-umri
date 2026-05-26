<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed admin user accounts.
     *
     * Password for all accounts: "password"
     */
    public function run(): void
    {
        // Super Admin — akses penuh, termasuk kelola pengguna dan pengaturan sistem
        $superAdmin = User::updateOrCreate(
            ['email' => env('DEFAULT_ADMIN_EMAIL', 'admin@bka.umri.ac.id')],
            [
                'name' => 'Super Admin',
                'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Admin 1 — staf BKA yang mengelola konten website sehari-hari
        $admin1 = User::updateOrCreate(
            ['email' => 'staff@bka.umri.ac.id'],
            [
                'name' => 'Admin BKA',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $admin1->assignRole('admin');

        // Admin 2 — staf keuangan
        $admin2 = User::updateOrCreate(
            ['email' => 'keuangan@bka.umri.ac.id'],
            [
                'name' => 'Admin Keuangan',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $admin2->assignRole('admin');

        // Admin 3 — staf aset
        $admin3 = User::updateOrCreate(
            ['email' => 'aset@bka.umri.ac.id'],
            [
                'name' => 'Admin Aset',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        $admin3->assignRole('admin');
    }
}
