<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\Lampiran;
use App\Models\PesanKontak;
use App\Models\Kunjungan;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     *
     * @return Response
     */
    public function index(): Response
    {
        // 1. Fetch core database counts
        $stats = [
            'berita' => Berita::count(),
            'pengumuman' => Pengumuman::count(),
            'lampiran' => Lampiran::count(),
            'pesan' => PesanKontak::where('is_read', false)->count(),
        ];

        // 2. Fetch latest 10 Spatie activity logs
        $activities = Activity::with('causer')->latest('id')->limit(10)->get();

        $mappedLogs = $activities->map(function ($activity) {
            $causer = $activity->causer;

            // Resolve name and role
            $user = $causer ? $causer->name : 'Sistem';
            $role = $causer ? ($causer->hasRole('super_admin') ? 'Super Admin' : 'Admin') : 'Sistem';

            // Action type matching UI Pills: 'create' | 'update' | 'delete' | 'system' | 'user'
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

            // Human friendly description mapping
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

            // Target extraction from attributes changes or properties
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

        // 3. Visitor Tracking Analytics
        $todayDate = now()->toDateString();
        $yesterdayDate = now()->subDay()->toDateString();
        $startOfWeek = now()->startOfWeek()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();

        $todayVisits = Kunjungan::where('tanggal', $todayDate)->count();
        $yesterdayVisits = Kunjungan::where('tanggal', $yesterdayDate)->count();
        $weekVisits = Kunjungan::where('tanggal', '>=', $startOfWeek)->count();
        $monthVisits = Kunjungan::where('tanggal', '>=', $startOfMonth)->count();

        // Percentage change compared to yesterday
        if ($yesterdayVisits === 0) {
            $changePercentage = $todayVisits > 0 ? 100.0 : 0.0;
        } else {
            $changePercentage = round((($todayVisits - $yesterdayVisits) / $yesterdayVisits) * 100, 1);
        }

        // Compiled 7-day chart data
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $carbon = now()->subDays($i);
            $date = $carbon->toDateString();
            $count = Kunjungan::where('tanggal', $date)->count();

            $chartData[] = [
                'tanggal' => $date,
                'label' => $carbon->translatedFormat('d M'), // e.g. "26 Mei"
                'hari' => $carbon->translatedFormat('D'), // e.g. "Sel" or "Tue"
                'hari_lengkap' => $carbon->translatedFormat('l'), // e.g. "Selasa"
                'kunjungan' => $count,
            ];
        }

        $analytics = [
            'today' => $todayVisits,
            'yesterday' => $yesterdayVisits,
            'week' => $weekVisits,
            'month' => $monthVisits,
            'change_percentage' => $changePercentage,
            'chart_data' => $chartData,
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'activities' => $mappedLogs,
            'analytics' => $analytics,
        ]);
    }
}
