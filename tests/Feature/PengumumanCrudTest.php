<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Pengumuman;
use App\Enums\ContentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PengumumanCrudTest extends TestCase
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

    public function test_guests_cannot_access_admin_pengumuman()
    {
        $response = $this->get(route('admin.pengumuman.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_pengumuman_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.pengumuman.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_announcement_with_base64_thumbnail_and_attachments()
    {
        $admin = $this->createAdminUser();

        $thumbnailBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        
        // base64 mock of a pdf file
        $pdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCAyNAo+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIDcwIDcwMCBUZCAoRGVtb3EpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNzcgMDAwMDAgbiAKMDAwMDAwMDEzNCAwMDAwMCBuIAowMDAwMDAwMjIzIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjg1CiUlRU9GCg==';

        $isiContent = '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>';

        $response = $this->actingAs($admin)->post(route('admin.pengumuman.store'), [
            'judul' => 'Panduan Registrasi Ulang 2026',
            'slug' => 'panduan-registrasi-ulang-2026',
            'status' => 'terpublikasi',
            'is_penting' => true,
            'tanggal_publikasi' => '2026-05-25 10:00:00',
            'thumbnail' => $thumbnailBase64,
            'isi' => $isiContent,
            'attachments' => [
                [
                    'name' => 'Panduan_Registrasi.pdf',
                    'url' => $pdfBase64
                ]
            ]
        ]);

        $response->assertRedirect(route('admin.pengumuman.index'));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('pengumumans', [
            'judul' => 'Panduan Registrasi Ulang 2026',
            'slug' => 'panduan-registrasi-ulang-2026',
            'status' => ContentStatus::TERPUBLIKASI->value,
            'is_penting' => true,
        ]);

        $pengumuman = Pengumuman::where('slug', 'panduan-registrasi-ulang-2026')->first();
        $this->assertNotNull($pengumuman);
        $this->assertTrue($pengumuman->hasMedia('thumbnail'));
        $this->assertTrue($pengumuman->hasMedia('lampirans'));
        
        $media = $pengumuman->getFirstMedia('lampirans');
        $this->assertEquals('Panduan_Registrasi.pdf', $media->file_name);
    }

    public function test_announcement_validation_requires_minimum_lengths()
    {
        $admin = $this->createAdminUser();

        // 1. Title too short (less than 10 characters)
        $response = $this->actingAs($admin)->post(route('admin.pengumuman.store'), [
            'judul' => 'Pendek',
            'slug' => 'panduan-registrasi-2026',
            'status' => 'terpublikasi',
            'is_penting' => false,
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => '',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'attachments' => []
        ]);

        $response->assertSessionHasErrors('judul');

        // 2. Content too short (less than 20 plain text characters)
        $response = $this->actingAs($admin)->post(route('admin.pengumuman.store'), [
            'judul' => 'Panduan Registrasi Panjang Sekali',
            'slug' => 'panduan-registrasi-2026',
            'status' => 'terpublikasi',
            'is_penting' => false,
            'tanggal_publikasi' => '2026-05-25',
            'thumbnail' => '',
            'isi' => '<p>Pendek.</p>',
            'attachments' => []
        ]);

        $response->assertSessionHasErrors('isi');
    }

    public function test_admin_can_update_announcement_and_sync_attachments()
    {
        $admin = $this->createAdminUser();

        $pengumuman = Pengumuman::create([
            'judul' => 'Judul Pengumuman Lama Sekali',
            'slug' => 'judul-pengumuman-lama-sekali',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::DRAF,
            'is_penting' => false,
            'user_id' => $admin->id,
        ]);

        // Add an initial media to lampirans
        $pengumuman->addMediaFromString('Old Content')
            ->usingFileName('Old_File.pdf')
            ->toMediaCollection('lampirans');

        $this->assertEquals(1, $pengumuman->getMedia('lampirans')->count());
        $oldMediaUrl = $pengumuman->getFirstMedia('lampirans')->getUrl();

        $thumbnailBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $newPdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCAyNAo+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIDcwIDcwMCBUZCAoRGVtb3EpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNzcgMDAwMDAgbiAKMDAwMDAwMDEzNCAwMDAwMCBuIAowMDAwMDAwMjIzIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjg1CiUlRU9GCg==';

        $response = $this->actingAs($admin)->put(route('admin.pengumuman.update', $pengumuman->id), [
            'judul' => 'Judul Pengumuman Baru Sekali',
            'slug' => 'judul-pengumuman-baru-sekali',
            'status' => 'terpublikasi',
            'is_penting' => true,
            'tanggal_publikasi' => '2026-05-25 12:00:00',
            'thumbnail' => $thumbnailBase64,
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter baru.</p>',
            // Sync attachments: remove Old_File.pdf (by not passing its URL) and add New_File.pdf
            'attachments' => [
                [
                    'name' => 'New_File.pdf',
                    'url' => $newPdfBase64
                ]
            ]
        ]);

        $response->assertRedirect(route('admin.pengumuman.index'));
        $response->assertSessionHasNoErrors();

        $pengumuman->refresh();
        $this->assertEquals('Judul Pengumuman Baru Sekali', $pengumuman->judul);
        $this->assertEquals(ContentStatus::TERPUBLIKASI, $pengumuman->status);
        $this->assertTrue($pengumuman->is_penting);
        
        // Verify attachments are synced correctly
        $attachments = $pengumuman->getMedia('lampirans');
        $this->assertEquals(1, $attachments->count());
        $this->assertEquals('New_File.pdf', $attachments->first()->file_name);
    }

    public function test_admin_can_delete_announcement_soft_deleted()
    {
        $admin = $this->createAdminUser();

        $pengumuman = Pengumuman::create([
            'judul' => 'Pengumuman Yang Akan Dihapus',
            'slug' => 'pengumuman-yang-akan-dihapus',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::DRAF,
            'is_penting' => false,
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.pengumuman.destroy', $pengumuman->id));
        $response->assertRedirect(route('admin.pengumuman.index'));

        $this->assertSoftDeleted('pengumumans', [
            'id' => $pengumuman->id,
        ]);
    }

    public function test_public_can_only_view_published_announcements()
    {
        $admin = $this->createAdminUser();

        // Published
        $p1 = Pengumuman::create([
            'judul' => 'Pengumuman Terpublikasi Sekarang',
            'slug' => 'pengumuman-terpublikasi-sekarang',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'is_penting' => false,
            'tanggal_publikasi' => now()->subHour(),
            'user_id' => $admin->id,
        ]);

        // Draft
        $p2 = Pengumuman::create([
            'judul' => 'Pengumuman Draft Belum Rilis',
            'slug' => 'pengumuman-draft-belum-rilis',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::DRAF,
            'is_penting' => false,
            'user_id' => $admin->id,
        ]);

        // Scheduled future
        $p3 = Pengumuman::create([
            'judul' => 'Pengumuman Terjadwal Masa Depan',
            'slug' => 'pengumuman-terjadwal-masa-depan',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'is_penting' => false,
            'tanggal_publikasi' => now()->addDay(),
            'user_id' => $admin->id,
        ]);

        // 1. Check public list contains only published
        $response = $this->get(route('public.pengumuman.index'));
        $response->assertOk();

        // 2. Access published show page -> OK
        $response = $this->get(route('public.pengumuman.show', 'pengumuman-terpublikasi-sekarang'));
        $response->assertOk();

        // 3. Access draft show page -> 404
        $response = $this->get(route('public.pengumuman.show', 'pengumuman-draft-belum-rilis'));
        $response->assertStatus(404);

        // 4. Access scheduled show page -> 404
        $response = $this->get(route('public.pengumuman.show', 'pengumuman-terjadwal-masa-depan'));
        $response->assertStatus(404);
    }

    public function test_public_announcements_index_prioritizes_is_penting()
    {
        $admin = $this->createAdminUser();

        // Standard regular announcement
        Pengumuman::create([
            'judul' => 'Pengumuman Biasa Satu',
            'slug' => 'pengumuman-biasa-satu',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'is_penting' => false,
            'tanggal_publikasi' => now()->subDays(2),
            'user_id' => $admin->id,
        ]);

        // Important announcement (should be pinned first despite being older than some others)
        Pengumuman::create([
            'judul' => 'Pengumuman Penting Pin',
            'slug' => 'pengumuman-penting-pin',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'is_penting' => true,
            'tanggal_publikasi' => now()->subDays(5),
            'user_id' => $admin->id,
        ]);

        // Standard regular announcement 2 (newer)
        Pengumuman::create([
            'judul' => 'Pengumuman Biasa Dua',
            'slug' => 'pengumuman-biasa-dua',
            'isi' => '<p>Ini adalah isi pengumuman yang cukup panjang untuk melewati batas minimal dua puluh karakter.</p>',
            'status' => ContentStatus::TERPUBLIKASI,
            'is_penting' => false,
            'tanggal_publikasi' => now()->subHour(),
            'user_id' => $admin->id,
        ]);

        $response = $this->get(route('public.pengumuman.index'));
        $response->assertOk();

        // Get inertia response and verify order
        $data = $response->original->getData();
        $pengumumans = $data['page']['props']['pengumumans']['data'];

        $this->assertCount(3, $pengumumans);
        // Penting should be first
        $this->assertEquals('Pengumuman Penting Pin', $pengumumans[0]['title']);
        // Regular newer should be second
        $this->assertEquals('Pengumuman Biasa Dua', $pengumumans[1]['title']);
        // Regular older should be third
        $this->assertEquals('Pengumuman Biasa Satu', $pengumumans[2]['title']);
    }
}
