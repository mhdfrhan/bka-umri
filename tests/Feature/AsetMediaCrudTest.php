<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AsetMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AsetMediaCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create(['is_active' => true]);
        $user->assignRole('admin');
        return $user;
    }

    public function test_guests_cannot_access_admin_aset()
    {
        $response = $this->get(route('admin.aset.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_aset_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.aset.index'));
        $response->assertOk();
    }

    public function test_admin_can_upload_base64_image_asset()
    {
        $admin = $this->createAdminUser();
        
        $base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->actingAs($admin)->post(route('admin.aset.store'), [
            'name' => 'test_upload.png',
            'url' => $base64Image,
            'type' => 'image',
            'extension' => 'png',
            'size' => 120,
            'originalSize' => 360,
            'isVisible' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('aset_medias', [
            'nama' => 'test_upload.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => 120,
            'ukuran_asli' => 360,
            'is_visible' => true,
        ]);

        $asset = AsetMedia::where('nama', 'test_upload.png')->first();
        $this->assertNotNull($asset);
        $this->assertTrue($asset->hasMedia('berkas'));
    }

    public function test_admin_can_update_asset_metadata()
    {
        $admin = $this->createAdminUser();

        $asset = AsetMedia::create([
            'nama' => 'test_file.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => 100,
            'ukuran_asli' => 200,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.aset.update', $asset->id), [
            'name' => 'updated_file.png',
            'is_visible' => false,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('aset_medias', [
            'id' => $asset->id,
            'nama' => 'updated_file.png',
            'is_visible' => false,
        ]);
    }

    public function test_admin_can_delete_asset()
    {
        $admin = $this->createAdminUser();

        $asset = AsetMedia::create([
            'nama' => 'test_delete.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => 100,
            'ukuran_asli' => 200,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.aset.destroy', $asset->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('aset_medias', [
            'id' => $asset->id,
        ]);
    }

    public function test_visible_images_available_for_global_picker()
    {
        $admin = $this->createAdminUser();

        AsetMedia::create([
            'nama' => 'visible_img.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => 100,
            'ukuran_asli' => 200,
            'is_visible' => true,
        ]);

        AsetMedia::create([
            'nama' => 'private_img.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => 100,
            'ukuran_asli' => 200,
            'is_visible' => false,
        ]);

        AsetMedia::create([
            'nama' => 'visible_doc.pdf',
            'tipe' => 'file',
            'ekstensi' => 'pdf',
            'ukuran' => 100,
            'ukuran_asli' => 200,
            'is_visible' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.aset.apiList'));

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonFragment([
            'name' => 'visible_img.png',
        ]);
        $response->assertJsonMissing([
            'name' => 'private_img.png',
        ]);
        $response->assertJsonMissing([
            'name' => 'visible_doc.pdf',
        ]);
    }
}
