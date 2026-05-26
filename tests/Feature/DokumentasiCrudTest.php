<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Album;
use App\Models\Foto;
use App\Models\KategoriDokumentasi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DokumentasiCrudTest extends TestCase
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

    public function test_guests_cannot_access_admin_dokumentasi()
    {
        $response = $this->get(route('admin.dokumentasi.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_dokumentasi_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.dokumentasi.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_album_with_base64_cover()
    {
        $admin = $this->createAdminUser();

        $category = KategoriDokumentasi::create([
            'nama' => 'Keuangan',
            'slug' => 'keuangan',
        ]);

        $coverBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->actingAs($admin)->post(route('admin.dokumentasi.store'), [
            'judul' => 'Rencana Anggaran Tahunan 2026',
            'slug' => 'rencana-anggaran-tahunan-2026',
            'deskripsi' => 'Rangkuman rapat penyusunan anggaran belanja operasional BKA UMRI.',
            'tanggal_kegiatan' => '2026-05-25',
            'kategori' => 'Keuangan',
            'coverUrl' => $coverBase64,
        ]);

        $response->assertRedirect(route('admin.dokumentasi.index'));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('albums', [
            'judul' => 'Rencana Anggaran Tahunan 2026',
            'slug' => 'rencana-anggaran-tahunan-2026',
            'kategori_dokumentasi_id' => $category->id,
        ]);

        $album = Album::where('slug', 'rencana-anggaran-tahunan-2026')->first();
        $this->assertNotNull($album);
        $this->assertTrue($album->hasMedia('cover'));
    }

    public function test_album_validation_requires_minimum_lengths()
    {
        $admin = $this->createAdminUser();

        // Title too short (less than 5 characters)
        $response = $this->actingAs($admin)->post(route('admin.dokumentasi.store'), [
            'judul' => 'Rpt',
            'slug' => 'rapat-anggaran-2026',
            'tanggal_kegiatan' => '2026-05-25',
            'kategori' => 'Keuangan',
        ]);

        $response->assertSessionHasErrors('judul');
    }

    public function test_admin_can_update_album_and_sync_photos()
    {
        $admin = $this->createAdminUser();

        $category = KategoriDokumentasi::create([
            'nama' => 'Aset',
            'slug' => 'aset',
        ]);

        $album = Album::create([
            'judul' => 'Pencatatan Sarana Fisik Kampus',
            'slug' => 'pencatatan-sarana-fisik-kampus',
            'deskripsi' => 'Deskripsi lama.',
            'tanggal_kegiatan' => '2026-05-10',
            'kategori_dokumentasi_id' => $category->id,
        ]);

        $coverBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $newPhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // Add an initial photo to the album
        $foto1 = Foto::create([
            'album_id' => $album->id,
            'urutan' => 1,
        ]);
        $foto1->addMediaFromBase64($newPhotoBase64)
            ->usingFileName('Old_File.png')
            ->toMediaCollection('foto');

        $this->assertEquals(1, $album->fotos->count());
        $oldPhotoUrl = $foto1->getFirstMediaUrl('foto');

        $response = $this->actingAs($admin)->put(route('admin.dokumentasi.update', $album->id), [
            'judul' => 'Pencatatan Sarana Baru',
            'slug' => 'pencatatan-sarana-baru',
            'deskripsi' => 'Deskripsi baru.',
            'tanggal_kegiatan' => '2026-05-25',
            'kategori' => 'Aset',
            'coverUrl' => $coverBase64,
            // Sync photos: remove Old_File.jpg and add newPhotoBase64 with order 1
            'photos' => [
                [
                    'id' => 'new-client-id-1',
                    'url' => $newPhotoBase64,
                    'order' => 1,
                ]
            ]
        ]);

        $response->assertRedirect(route('admin.dokumentasi.index'));
        $response->assertSessionHasNoErrors();

        $album->refresh();
        $this->assertEquals('Pencatatan Sarana Baru', $album->judul);
        $this->assertEquals('Deskripsi baru.', $album->deskripsi);

        // Verify photos are synced correctly
        $photos = $album->fotos;
        $this->assertEquals(1, $photos->count());
        $this->assertTrue($photos->first()->hasMedia('foto'));
    }

    public function test_admin_can_delete_album_soft_deleted()
    {
        $admin = $this->createAdminUser();

        $album = Album::create([
            'judul' => 'Album Yang Akan Dihapus',
            'slug' => 'album-yang-akan-dihapus',
            'tanggal_kegiatan' => '2026-05-25',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.dokumentasi.destroy', $album->id));
        $response->assertRedirect(route('admin.dokumentasi.index'));

        $this->assertSoftDeleted('albums', [
            'id' => $album->id,
        ]);
    }

    public function test_kategori_dokumentasi_crud_and_orphan_handling()
    {
        $admin = $this->createAdminUser();

        // 1. Create Category
        $response = $this->actingAs($admin)->post(route('admin.dokumentasi.kategori.store'), [
            'nama' => 'Kategori Kustom Baru',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('kategori_dokumentasis', ['nama' => 'Kategori Kustom Baru']);

        $category = KategoriDokumentasi::where('nama', 'Kategori Kustom Baru')->first();

        // 2. Associate album with this category
        $album = Album::create([
            'judul' => 'Rapat Kerja Istimewa',
            'slug' => 'rapat-kerja-istimewa',
            'tanggal_kegiatan' => '2026-05-25',
            'kategori_dokumentasi_id' => $category->id,
        ]);

        $this->assertEquals($category->id, $album->kategori_dokumentasi_id);

        // 3. Delete Category and verify album category becomes null (orphan set to null)
        $response = $this->actingAs($admin)->delete(route('admin.dokumentasi.kategori.destroy', $category->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('kategori_dokumentasis', ['id' => $category->id]);
        
        $album->refresh();
        $this->assertNull($album->kategori_dokumentasi_id);
    }

    public function test_public_can_view_albums_with_filters_and_detail_show()
    {
        $category1 = KategoriDokumentasi::create([
            'nama' => 'Keuangan',
            'slug' => 'keuangan',
        ]);
        $category2 = KategoriDokumentasi::create([
            'nama' => 'Aset',
            'slug' => 'aset',
        ]);

        // Keuangan Album
        $a1 = Album::create([
            'judul' => 'Peluncuran Sistem SPP Online',
            'slug' => 'peluncuran-sistem-spp-online',
            'deskripsi' => 'Liputan peluncuran sistem pembayaran SPP virtual account.',
            'tanggal_kegiatan' => '2026-05-20',
            'kategori_dokumentasi_id' => $category1->id,
        ]);

        // Aset Album
        $a2 = Album::create([
            'judul' => 'Inventarisasi Aset Fisik Wilayah',
            'slug' => 'inventarisasi-aset-fisik-wilayah',
            'deskripsi' => 'Pencatatan sarana prasarana tanah dan bangunan kampus.',
            'tanggal_kegiatan' => '2026-05-15',
            'kategori_dokumentasi_id' => $category2->id,
        ]);

        // 1. Get default public listing
        $response = $this->get(route('public.dokumentasi.index'));
        $response->assertOk();

        // 2. Filter by category Keuangan
        $response = $this->get(route('public.dokumentasi.index', ['category' => 'Keuangan']));
        $response->assertOk();
        $data = $response->original->getData();
        $this->assertCount(1, $data['page']['props']['albums']['data']);
        $this->assertEquals('Peluncuran Sistem SPP Online', $data['page']['props']['albums']['data'][0]['judul']);

        // 3. Search by keyword
        $response = $this->get(route('public.dokumentasi.index', ['search' => 'Inventarisasi']));
        $response->assertOk();
        $data = $response->original->getData();
        $this->assertCount(1, $data['page']['props']['albums']['data']);
        $this->assertEquals('Inventarisasi Aset Fisik Wilayah', $data['page']['props']['albums']['data'][0]['judul']);

        // 4. Access show page
        $response = $this->get(route('public.dokumentasi.show', 'peluncuran-sistem-spp-online'));
        $response->assertOk();

        // 5. Access non-existing show page -> 404
        $response = $this->get(route('public.dokumentasi.show', 'album-fiktif-tidak-ada'));
        $response->assertStatus(404);
    }
}
