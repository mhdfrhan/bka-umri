<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kunjungan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitorTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_visit_records_unique_kunjungan()
    {
        $this->assertEquals(0, Kunjungan::count());

        // Make GET request as guest
        $response = $this->get(route('home'), [
            'REMOTE_ADDR' => '192.168.1.50',
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        ]);

        $response->assertOk();
        $this->assertEquals(1, Kunjungan::count());

        $kunjungan = Kunjungan::first();
        $this->assertEquals('192.168.1.50', $kunjungan->ip_address);
        $this->assertEquals(now()->toDateString(), $kunjungan->tanggal->toDateString());
    }

    public function test_duplicate_guest_visits_on_same_day_are_not_recorded_twice()
    {
        $this->assertEquals(0, Kunjungan::count());

        // First visit
        $this->get(route('home'), [
            'REMOTE_ADDR' => '192.168.1.50',
            'HTTP_USER_AGENT' => 'Chrome',
        ]);
        $this->assertEquals(1, Kunjungan::count());

        // Second visit (refresh / navigation)
        $this->get(route('home'), [
            'REMOTE_ADDR' => '192.168.1.50',
            'HTTP_USER_AGENT' => 'Chrome',
        ]);
        
        // Count should still be 1 (ignored, not duplicated)
        $this->assertEquals(1, Kunjungan::count());
    }

    public function test_authenticated_admin_visits_are_not_tracked()
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('admin');

        $this->actingAs($admin);
        $this->assertEquals(0, Kunjungan::count());

        // Visit public page
        $this->get(route('home'), [
            'REMOTE_ADDR' => '192.168.1.100',
        ]);

        // Admins should not be recorded as visitors
        $this->assertEquals(0, Kunjungan::count());
    }

    public function test_admin_paths_are_not_tracked_for_guests()
    {
        $this->assertEquals(0, Kunjungan::count());

        // Try to access admin URL (which redirects to login, but middleware should ignore it)
        $this->get('/admin', [
            'REMOTE_ADDR' => '192.168.1.50',
        ]);

        $this->assertEquals(0, Kunjungan::count());
    }
}
