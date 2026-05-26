<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic Spatie Roles
        Role::create(['name' => 'super_admin']);
        Role::create(['name' => 'admin']);
    }

    /**
     * Test guest cannot access user management.
     */
    public function test_guest_cannot_access_user_management(): void
    {
        $response = $this->get(route('admin.users.index'));
        $response->assertRedirect('/login');
    }

    /**
     * Test standard admin cannot access user management.
     */
    public function test_standard_admin_cannot_access_user_management(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.users.index'));
        
        // Assert the user gets redirected or blocked (role:super_admin middleware returns 403 or redirects)
        $response->assertStatus(403);
    }

    /**
     * Test super admin can access user management.
     */
    public function test_super_admin_can_access_user_management(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->get(route('admin.users.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/users/index'));
    }

    /**
     * Test super admin can create a user.
     */
    public function test_super_admin_can_create_user(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->post(route('admin.users.store'), [
            'name' => 'Staf Baru',
            'email' => 'newstaff@bka.umri.ac.id',
            'role' => 'admin',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', ['email' => 'newstaff@bka.umri.ac.id']);
        
        $newUser = User::where('email', 'newstaff@bka.umri.ac.id')->first();
        $this->assertTrue($newUser->hasRole('admin'));
    }

    /**
     * Test weak password validation during creation.
     */
    public function test_cannot_create_user_with_weak_password(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->post(route('admin.users.store'), [
            'name' => 'Staf Baru',
            'email' => 'newstaff@bka.umri.ac.id',
            'role' => 'admin',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test active admin quota limit (max 10 active administrators).
     */
    public function test_active_admin_capacity_limit(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        // Create 9 other active users (total active = 10)
        for ($i = 0; $i < 9; $i++) {
            $u = User::factory()->create(['is_active' => true]);
            $u->assignRole('admin');
        }

        $this->assertEquals(10, User::where('is_active', true)->count());

        // Try to create 11th active user
        $response = $this->actingAs($superAdmin)->post(route('admin.users.store'), [
            'name' => 'Limit Breaker',
            'email' => 'limitbreaker@bka.umri.ac.id',
            'role' => 'admin',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test super admin can update user.
     */
    public function test_super_admin_can_update_user(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $staff = User::factory()->create(['is_active' => true]);
        $staff->assignRole('admin');

        $response = $this->actingAs($superAdmin)->put(route('admin.users.update', $staff->id), [
            'name' => 'Updated Name',
            'email' => 'updatedemail@bka.umri.ac.id',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'name' => 'Updated Name',
            'email' => 'updatedemail@bka.umri.ac.id',
        ]);
        
        $staff->refresh();
        $this->assertTrue($staff->hasRole('admin'));
    }

    /**
     * Test self-lock protection: logged-in user cannot deactivate or demote self.
     */
    public function test_self_lock_protection_prevents_deactivation_and_demotion(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        // Attempt self-deactivation
        $response = $this->actingAs($superAdmin)->put(route('admin.users.update', $superAdmin->id), [
            'name' => $superAdmin->name,
            'email' => $superAdmin->email,
            'role' => 'super_admin',
            'is_active' => false,
        ]);
        $response->assertSessionHasErrors('is_active');

        // Attempt self-demotion
        $response = $this->actingAs($superAdmin)->put(route('admin.users.update', $superAdmin->id), [
            'name' => $superAdmin->name,
            'email' => $superAdmin->email,
            'role' => 'admin',
            'is_active' => true,
        ]);
        $response->assertSessionHasErrors('role');
    }

    /**
     * Test last active Super Admin lock protection.
     */
    public function test_last_active_super_admin_protection(): void
    {
        $this->withoutMiddleware([\App\Http\Middleware\CheckUserIsActive::class]);

        // 1 active Super Admin
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        // Another active Super Admin
        $anotherSuperAdmin = User::factory()->create(['is_active' => true]);
        $anotherSuperAdmin->assignRole('super_admin');

        // Attempt to deactivate the first super admin via the second super admin.
        // Since there is still $anotherSuperAdmin active, this succeeds.
        $response = $this->actingAs($anotherSuperAdmin)->put(route('admin.users.update', $superAdmin->id), [
            'name' => $superAdmin->name,
            'email' => $superAdmin->email,
            'role' => 'super_admin',
            'is_active' => false,
        ]);
        $response->assertRedirect(route('admin.users.index'));

        // Now $anotherSuperAdmin is the ONLY active super admin in the system.
        // Let's create a deactivated super admin to act.
        $deactivatedSuper = User::factory()->create(['is_active' => false]);
        $deactivatedSuper->assignRole('super_admin');

        // Attempt to deactivate $anotherSuperAdmin acting as $deactivatedSuper.
        // This should fail because it would leave 0 active super admins.
        $response = $this->actingAs($deactivatedSuper)->put(route('admin.users.update', $anotherSuperAdmin->id), [
            'name' => $anotherSuperAdmin->name,
            'email' => $anotherSuperAdmin->email,
            'role' => 'super_admin',
            'is_active' => false,
        ]);
        
        $response->assertSessionHasErrors('role');
    }

    /**
     * Test self-deletion prevention.
     */
    public function test_cannot_delete_self(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $response = $this->actingAs($superAdmin)->delete(route('admin.users.destroy', $superAdmin->id));
        $response->assertSessionHasErrors('id');
    }

    /**
     * Test cannot delete the last active Super Admin.
     */
    public function test_cannot_delete_last_active_super_admin(): void
    {
        $this->withoutMiddleware([\App\Http\Middleware\CheckUserIsActive::class]);

        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');

        $anotherSuperAdmin = User::factory()->create(['is_active' => true]);
        $anotherSuperAdmin->assignRole('super_admin');

        // Delete $superAdmin acting as $anotherSuperAdmin. This succeeds because $anotherSuperAdmin is still active.
        $response = $this->actingAs($anotherSuperAdmin)->delete(route('admin.users.destroy', $superAdmin->id));
        $response->assertRedirect(route('admin.users.index'));

        // Now $anotherSuperAdmin is the last active super admin. Let's create a deactivated super admin to act.
        $deactivatedSuper = User::factory()->create(['is_active' => false]);
        $deactivatedSuper->assignRole('super_admin');

        // Attempt to delete $anotherSuperAdmin acting as $deactivatedSuper
        $response = $this->actingAs($deactivatedSuper)->delete(route('admin.users.destroy', $anotherSuperAdmin->id));
        $response->assertSessionHasErrors('id');
    }
}
