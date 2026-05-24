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
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@bka.umri.ac.id',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        // Admin 1 — staf BKA yang mengelola konten website sehari-hari
        $admin1 = User::create([
            'name' => 'Admin BKA',
            'email' => 'staff@bka.umri.ac.id',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        $admin1->assignRole('admin');

        // Admin 2 — staf keuangan
        $admin2 = User::create([
            'name' => 'Admin Keuangan',
            'email' => 'keuangan@bka.umri.ac.id',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        $admin2->assignRole('admin');
    }
}
