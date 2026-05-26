<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class LogController extends Controller
{
    /**
     * Display a listing of system activity logs.
     */
    public function index(): Response
    {
        $activities = Activity::with('causer')->latest('id')->get();

        $mappedLogs = $activities->map(function ($activity) {
            $causer = $activity->causer;

            // User & role details
            $user = $causer ? $causer->name : 'Sistem';
            $role = $causer ? ($causer->hasRole('super_admin') ? 'Super Admin' : 'Admin') : 'Sistem';

            // Determine log action types matching frontend Pills: 'create' | 'update' | 'delete' | 'system' | 'user'
            $type = 'system';
            if (in_array($activity->log_name, ['user', 'auth'])) {
                $type = 'user';
            } elseif ($activity->event === 'created') {
                $type = 'create';
            } elseif ($activity->event === 'updated') {
                $type = 'update';
            } elseif ($activity->event === 'deleted') {
                $type = 'delete';
            }

            // Create friendly action names
            $logNameFriendly = ucwords(str_replace('_', ' ', $activity->log_name));
            $action = '';
            
            switch ($activity->event) {
                case 'created':
                    if ($activity->log_name === 'user') {
                        $action = 'Membuat akun pengguna';
                    } elseif ($activity->log_name === 'berita') {
                        $action = 'Menerbitkan berita baru';
                    } elseif ($activity->log_name === 'pengumuman') {
                        $action = 'Menerbitkan pengumuman baru';
                    } elseif ($activity->log_name === 'aset_media') {
                        $action = 'Mengunggah aset media baru';
                    } elseif ($activity->log_name === 'lampiran') {
                        $action = 'Mengunggah berkas lampiran';
                    } else {
                        $action = 'Membuat ' . $logNameFriendly . ' baru';
                    }
                    break;
                case 'updated':
                    if ($activity->log_name === 'user') {
                        $action = 'Mengubah data pengguna';
                    } elseif ($activity->log_name === 'pengaturan') {
                        $action = 'Mengubah pengaturan sistem';
                    } elseif ($activity->log_name === 'berita') {
                        $action = 'Mengubah berita';
                    } else {
                        $action = 'Mengubah ' . $logNameFriendly;
                    }
                    break;
                case 'deleted':
                    if ($activity->log_name === 'user') {
                        $action = 'Menghapus akun pengguna';
                    } else {
                        $action = 'Menghapus ' . $logNameFriendly;
                    }
                    break;
                default:
                    $action = ucwords($activity->description);
                    break;
            }

            // Target extraction
            $target = '';
            $props = $activity->attribute_changes;
            if (empty($props) || (is_object($props) && method_exists($props, 'isEmpty') && $props->isEmpty())) {
                $props = $activity->properties;
            }

            if (is_object($props) && method_exists($props, 'toArray')) {
                $propsArray = $props->toArray();
            } else {
                $propsArray = (array)$props;
            }

            $attributes = $propsArray['attributes'] ?? [];
            $old = $propsArray['old'] ?? [];

            $searchKeys = ['judul', 'nama', 'nama_tampilan', 'key', 'label', 'email', 'angka', 'name'];
            foreach ($searchKeys as $k) {
                if (isset($attributes[$k])) {
                    $target = $attributes[$k];
                    break;
                } elseif (isset($old[$k])) {
                    $target = $old[$k];
                    break;
                }
            }

            if (empty($target)) {
                $target = $logNameFriendly . ' #' . $activity->subject_id;
            }

            return [
                'id' => $activity->id,
                'time' => $activity->created_at->toISOString(),
                'user' => $user,
                'role' => $role,
                'action' => $action,
                'target' => (string)$target,
                'type' => $type,
            ];
        })->toArray();

        return Inertia::render('admin/logs/index', [
            'logs' => $mappedLogs,
        ]);
    }

    /**
     * Clear all activity logs.
     */
    public function destroyAll()
    {
        Activity::truncate();

        return redirect()->back()->with('success', 'Seluruh log aktivitas sistem berhasil dikosongkan.');
    }

    /**
     * Seed initial mock logs.
     */
    public function seed()
    {
        Activity::truncate();

        $logs = [
            [
                'time' => now()->subMinutes(5),
                'log_name' => 'berita',
                'description' => 'created',
                'event' => 'created',
                'properties' => ['attributes' => ['judul' => 'BKA UMRI Luncurkan Portal Informasi Baru Terintegrasi']],
            ],
            [
                'time' => now()->subMinutes(20),
                'log_name' => 'pengumuman',
                'description' => 'updated',
                'event' => 'updated',
                'properties' => ['attributes' => ['judul' => 'Jadwal Pengisian KRS Semester Genap 2025/2026']],
            ],
            [
                'time' => now()->subHour(),
                'log_name' => 'pengaturan',
                'description' => 'updated',
                'event' => 'updated',
                'properties' => ['attributes' => ['key' => 'Pemberlakuan SSL & Favicon Baru']],
            ],
            [
                'time' => now()->subHours(3),
                'log_name' => 'user',
                'description' => 'created',
                'event' => 'created',
                'properties' => ['attributes' => ['nama' => 'Lusi Lestari (Admin Bidang Keuangan)']],
            ],
            [
                'time' => now()->subDay(),   
                'log_name' => 'lampiran',
                'description' => 'deleted',
                'event' => 'deleted',
                'properties' => ['old' => ['nama_tampilan' => 'Panduan Penggunaan Portal Versi 1.0 (PDF)']],
            ],
            [
                'time' => now()->subDays(2),
                'log_name' => 'bidang',
                'description' => 'updated',
                'event' => 'updated',
                'properties' => ['attributes' => ['nama' => 'Bidang Kemahasiswaan & Hubungan Alumni']],
            ],
            [
                'time' => now()->subDays(3),
                'log_name' => 'album',
                'description' => 'created',
                'event' => 'created',
                'properties' => ['attributes' => ['judul' => 'Pelantikan Rektor Universitas Muhammadiyah Riau Periode 2026-2030']],
            ],
            [
                'time' => now()->subDays(5),
                'log_name' => 'user',
                'description' => 'updated',
                'event' => 'updated',
                'properties' => ['attributes' => ['nama' => 'Rudi Hermawan (Admin Bidang Humas)']],
            ],
        ];

        $superAdmin = User::role('super_admin')->first();

        foreach ($logs as $log) {
            Activity::create([
                'log_name' => $log['log_name'],
                'description' => $log['description'],
                'event' => $log['event'],
                'properties' => $log['properties'],
                'causer_type' => User::class,
                'causer_id' => $superAdmin?->id,
                'created_at' => $log['time'],
                'updated_at' => $log['time'],
            ]);
        }

        return redirect()->back()->with('success', 'Berhasil memuat ulang data log contoh (Mock Logs).');
    }
}
