<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Berita;
use App\Models\KategoriBerita;
use App\Enums\ContentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BeritaCrudTest extends TestCase
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

    public function test_guests_cannot_access_admin_berita()
    {
        $response = $this->get(route('admin.berita.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_berita_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.berita.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_news_with_base64_thumbnail()
    {
        $admin = $this->createAdminUser();

        $kategori = KategoriBerita::create(['nama' => 'Kegiatan']);

        $thumbnailBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // 50+ characters content
        $isiContent = '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi minimal lima puluh karakter di server side.</p>';

        $response = $this->actingAs($admin)->post(route('admin.berita.store'), [
            'judul' => 'Sosialisasi Beasiswa 2026',
            'slug' => 'sosialisasi-beasiswa-2026',
            'kategori' => 'Kegiatan',
            'status' => 'terpublikasi',
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => $thumbnailBase64,
            'isi' => $isiContent,
        ]);

        $response->assertRedirect(route('admin.berita.index'));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('beritas', [
            'judul' => 'Sosialisasi Beasiswa 2026',
            'slug' => 'sosialisasi-beasiswa-2026',
            'kategori_berita_id' => $kategori->id,
            'status' => ContentStatus::TERPUBLIKASI->value,
        ]);

        $berita = Berita::where('slug', 'sosialisasi-beasiswa-2026')->first();
        $this->assertNotNull($berita);
        $this->assertTrue($berita->hasMedia('thumbnail'));
    }

    public function test_news_validation_requires_minimum_lengths()
    {
        $admin = $this->createAdminUser();

        // 1. Title too short (less than 10 characters)
        $response = $this->actingAs($admin)->post(route('admin.berita.store'), [
            'judul' => 'Pendek',
            'slug' => 'sosialisasi-beasiswa-2026',
            'kategori' => 'Tanpa Kategori',
            'status' => 'terpublikasi',
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'isi' => '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi minimal lima puluh karakter.</p>',
        ]);

        $response->assertSessionHasErrors('judul');

        // 2. Content too short (less than 50 plain text characters)
        $response = $this->actingAs($admin)->post(route('admin.berita.store'), [
            'judul' => 'Sosialisasi Beasiswa Panjang Judul',
            'slug' => 'sosialisasi-beasiswa-2026',
            'kategori' => 'Tanpa Kategori',
            'status' => 'terpublikasi',
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'isi' => '<p>Konten pendek.</p>',
        ]);

        $response->assertSessionHasErrors('isi');
    }

    public function test_admin_can_update_news()
    {
        $admin = $this->createAdminUser();

        $berita = Berita::create([
            'judul' => 'Judul Berita Lama Sekali',
            'slug' => 'judul-berita-lama-sekali',
            'isi' => '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi lama.</p>',
            'status' => ContentStatus::DRAF,
            'user_id' => $admin->id,
        ]);

        $thumbnailBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->actingAs($admin)->put(route('admin.berita.update', $berita->id), [
            'judul' => 'Judul Berita Baru Sekali',
            'slug' => 'judul-berita-baru-sekali',
            'kategori' => 'Tanpa Kategori',
            'status' => 'terpublikasi',
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => $thumbnailBase64,
            'isi' => '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi baru yang dibuat.</p>',
        ]);

        $response->assertRedirect(route('admin.berita.index'));
        $response->assertSessionHasNoErrors();

        $berita->refresh();
        $this->assertEquals('Judul Berita Baru Sekali', $berita->judul);
        $this->assertEquals('judul-berita-baru-sekali', $berita->slug);
        $this->assertEquals(ContentStatus::TERPUBLIKASI, $berita->status);
        $this->assertTrue($berita->hasMedia('thumbnail'));
    }

    public function test_admin_can_delete_news_soft_deleted()
    {
        $admin = $this->createAdminUser();

        $berita = Berita::create([
            'judul' => 'Berita Yang Akan Dihapus',
            'slug' => 'berita-yang-akan-dihapus',
            'isi' => '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi dihapus.</p>',
            'status' => ContentStatus::DRAF,
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.berita.destroy', $berita->id));
        $response->assertRedirect(route('admin.berita.index'));

        $this->assertSoftDeleted('beritas', [
            'id' => $berita->id,
        ]);
    }

    public function test_categories_crud_and_orphan_handling()
    {
        $admin = $this->createAdminUser();

        // 1. Create Category
        $response = $this->actingAs($admin)->post(route('admin.berita.kategori.store'), [
            'nama' => 'Prestasi Baru',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('kategori_beritas', ['nama' => 'Prestasi Baru']);

        $category = KategoriBerita::where('nama', 'Prestasi Baru')->first();

        // 2. Associate news with this category
        $berita = Berita::create([
            'judul' => 'Mahasiswa UMRI Juara Nasional Pemrograman',
            'slug' => 'mahasiswa-umri-juara-nasional-pemrograman',
            'isi' => '<p>Ini adalah isi konten berita yang cukup panjang untuk melewati batas validasi prestasi.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'kategori_berita_id' => $category->id,
            'user_id' => $admin->id,
        ]);

        $this->assertEquals($category->id, $berita->kategori_berita_id);

        // 3. Delete Category and verify news becomes Uncategorized (orphan set to null)
        $response = $this->actingAs($admin)->delete(route('admin.berita.kategori.destroy', $category->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('kategori_beritas', ['id' => $category->id]);
        
        $berita->refresh();
        $this->assertNull($berita->kategori_berita_id);
    }

    public function test_public_can_only_view_published_news()
    {
        $admin = $this->createAdminUser();

        // Published
        $berita1 = Berita::create([
            'judul' => 'Berita Terpublikasi Sekarang',
            'slug' => 'berita-terpublikasi-sekarang',
            'isi' => 'Konten',
            'status' => ContentStatus::TERPUBLIKASI,
            'tanggal_publikasi' => now()->subHour(),
            'user_id' => $admin->id,
        ]);

        // Draft
        $berita2 = Berita::create([
            'judul' => 'Berita Draft Belum Rilis',
            'slug' => 'berita-draft-belum-rilis',
            'isi' => 'Konten',
            'status' => ContentStatus::DRAF,
            'user_id' => $admin->id,
        ]);

        // Scheduled future
        $berita3 = Berita::create([
            'judul' => 'Berita Terjadwal Masa Depan',
            'slug' => 'berita-terjadwal-masa-depan',
            'isi' => 'Konten',
            'status' => ContentStatus::TERPUBLIKASI,
            'tanggal_publikasi' => now()->addDay(),
            'user_id' => $admin->id,
        ]);

        // 1. Check public list contains only published
        $response = $this->get(route('public.berita.index'));
        $response->assertOk();

        // 2. Access published show page -> OK
        $response = $this->get(route('public.berita.show', 'berita-terpublikasi-sekarang'));
        $response->assertOk();

        // 3. Access draft show page -> 404
        $response = $this->get(route('public.berita.show', 'berita-draft-belum-rilis'));
        $response->assertStatus(404);

        // 4. Access scheduled show page -> 404
        $response = $this->get(route('public.berita.show', 'berita-terjadwal-masa-depan'));
        $response->assertStatus(404);
    }
}
