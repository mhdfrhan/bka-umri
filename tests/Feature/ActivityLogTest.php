<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Spatie Roles
        Role::create(['name' => 'super_admin']);
        Role::create(['name' => 'admin']);
    }

    /**
     * Test guest cannot access logs page.
     */
    public function test_guest_cannot_access_logs_page(): void
    {
        $response = $this->get(route('admin.logs.index'));
        $response->assertRedirect('/login');
    }

    /**
     * Test standard admin cannot access logs page.
     */
    public function test_standard_admin_cannot_access_logs_page(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.logs.index'));
        $response->assertStatus(403);
    }

    /**
     * Test super admin can access logs page.
     */
    public function test_super_admin_can_access_logs_page(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->get(route('admin.logs.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/logs/index'));
    }

    /**
     * Test super admin can seed mock logs.
     */
    public function test_super_admin_can_seed_mock_logs(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->post(route('admin.logs.seed'));
        $response->assertRedirect();
        
        $this->assertDatabaseCount('activity_log', 8);
    }

    /**
     * Test super admin can clear all logs.
     */
    public function test_super_admin_can_clear_all_logs(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        // First seed some logs
        $this->actingAs($superAdmin)->post(route('admin.logs.seed'));
        $this->assertDatabaseCount('activity_log', 8);

        // Clear all logs
        $response = $this->actingAs($superAdmin)->delete(route('admin.logs.destroy-all'));
        $response->assertRedirect();
        
        $this->assertDatabaseCount('activity_log', 0);
    }

    /**
     * Test automatic logging of user actions on database changes.
     */
    public function test_automatic_logging_of_user_actions(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $staff = User::factory()->create(['name' => 'Old Name', 'is_active' => true]);
        $staff->assignRole('admin');

        // Let's perform an action that triggers activity logging (updating user name)
        $response = $this->actingAs($superAdmin)->put(route('admin.users.update', $staff->id), [
            'name' => 'Brand New Name',
            'email' => $staff->email,
            'role' => 'admin',
            'is_active' => true,
        ]);
        $response->assertRedirect(route('admin.users.index'));

        // Assert activity log contains a new log with name 'Brand New Name'
        $this->assertDatabaseHas('activity_log', [
            'log_name' => 'user',
            'event' => 'updated',
            'causer_id' => $superAdmin->id,
            'subject_id' => $staff->id,
        ]);

        // Access index page and check if the logged action is returned
        $response = $this->actingAs($superAdmin)->get(route('admin.logs.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('logs', 3)
            ->where('logs.0.user', $superAdmin->name)
            ->where('logs.0.role', 'Super Admin')
            ->where('logs.0.action', 'Mengubah data pengguna')
            ->where('logs.0.target', 'Brand New Name')
            ->where('logs.0.type', 'user')
        );
    }
}
