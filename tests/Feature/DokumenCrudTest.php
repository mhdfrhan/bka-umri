<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\KategoriLampiran;
use App\Models\Lampiran;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DokumenCrudTest extends TestCase
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

    public function test_guests_cannot_access_admin_dokumen()
    {
        $response = $this->get(route('admin.dokumen.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_dokumen_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.dokumen.index'));
        $response->assertOk();
    }

    public function test_admin_can_crud_kategori_lampiran()
    {
        $admin = $this->createAdminUser();

        // 1. Create Category
        $response = $this->actingAs($admin)->post(route('admin.dokumen.kategori.store'), [
            'nama' => 'Kebijakan Keuangan Baru',
            'deskripsi' => 'Deskripsi kebijakan keuangan universitas.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('kategori_lampirans', [
            'nama' => 'Kebijakan Keuangan Baru',
            'slug' => 'kebijakan-keuangan-baru',
            'deskripsi' => 'Deskripsi kebijakan keuangan universitas.',
            'urutan' => 1,
        ]);

        $category = KategoriLampiran::where('slug', 'kebijakan-keuangan-baru')->firstOrFail();

        // 2. Update Category
        $response = $this->actingAs($admin)->put(route('admin.dokumen.kategori.update', $category->id), [
            'nama' => 'Manajemen Keuangan Kampus',
            'deskripsi' => 'Deskripsi baru.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('kategori_lampirans', [
            'id' => $category->id,
            'nama' => 'Manajemen Keuangan Kampus',
            'slug' => 'manajemen-keuangan-kampus',
        ]);

        // 3. Delete Category
        $response = $this->actingAs($admin)->delete(route('admin.dokumen.kategori.destroy', $category->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('kategori_lampirans', [
            'id' => $category->id,
        ]);
    }

    public function test_admin_can_reorder_categories()
    {
        $admin = $this->createAdminUser();

        $cat1 = KategoriLampiran::create(['nama' => 'Folder A', 'urutan' => 1]);
        $cat2 = KategoriLampiran::create(['nama' => 'Folder B', 'urutan' => 2]);

        $response = $this->actingAs($admin)->post(route('admin.dokumen.kategori.reorder'), [
            'ids' => [$cat2->id, $cat1->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(1, $cat2->fresh()->urutan);
        $this->assertEquals(2, $cat1->fresh()->urutan);
    }

    public function test_admin_can_crud_berkas_lampiran()
    {
        $admin = $this->createAdminUser();

        $category = KategoriLampiran::create(['nama' => 'Kategori Contoh', 'urutan' => 1]);

        $base64File = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIHhtbA==';

        // 1. Upload Berkas
        $response = $this->actingAs($admin)->post(route('admin.dokumen.berkas.store'), [
            'kategori_id' => $category->id,
            'nama_tampilan' => 'Panduan Virtual Account.pdf',
            'deskripsi' => 'Panduan pembayaran biaya kuliah.',
            'fileDataUrl' => $base64File,
            'fileName' => 'panduan_va.pdf',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('lampirans', [
            'nama_tampilan' => 'Panduan Virtual Account.pdf',
            'kategori_lampiran_id' => $category->id,
        ]);

        $lampiran = Lampiran::where('nama_tampilan', 'Panduan Virtual Account.pdf')->firstOrFail();
        $this->assertTrue($lampiran->hasMedia('berkas'));

        // 2. Update Berkas
        $response = $this->actingAs($admin)->put(route('admin.dokumen.berkas.update', $lampiran->id), [
            'nama_tampilan' => 'VA Panduan BSI.pdf',
            'deskripsi' => 'Panduan BSI terupdate.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('lampirans', [
            'id' => $lampiran->id,
            'nama_tampilan' => 'VA Panduan BSI.pdf',
            'deskripsi' => 'Panduan BSI terupdate.',
        ]);

        // 3. Delete Berkas
        $response = $this->actingAs($admin)->delete(route('admin.dokumen.berkas.destroy', $lampiran->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('lampirans', [
            'id' => $lampiran->id,
        ]);
    }

    public function test_guests_can_access_public_lampirans()
    {
        $category = KategoriLampiran::create(['nama' => 'Panduan Resmi', 'urutan' => 1]);
        
        $lampiran = Lampiran::create([
            'nama_tampilan' => 'Panduan.pdf',
            'deskripsi' => 'Pedoman akademik.',
            'kategori_lampiran_id' => $category->id,
        ]);

        // 1. Repositori List Index
        $response = $this->get(route('public.lampiran.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('public/lampiran/index')
            ->has('kategoriLampirans')
            ->where('kategoriLampirans.0.nama', 'Panduan Resmi')
        );

        // 2. Category Detail List
        $response = $this->get(route('public.lampiran.kategori', $category->slug));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('public/lampiran/kategori')
            ->has('berkas', 1)
            ->where('berkas.0.nama_tampilan', 'Panduan.pdf')
        );
    }
    
}
