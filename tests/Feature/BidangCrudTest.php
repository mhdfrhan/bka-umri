<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Bidang;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BidangCrudTest extends TestCase
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

    public function test_guests_cannot_access_admin_bidang()
    {
        $response = $this->get(route('admin.bidang.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_admin_bidang_index()
    {
        $admin = $this->createAdminUser();
        $response = $this->actingAs($admin)->get(route('admin.bidang.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_bidang()
    {
        $admin = $this->createAdminUser();

        $bannerBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $fotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->actingAs($admin)->post(route('admin.bidang.store'), [
            'nama' => 'Bidang Akademik',
            'slug' => 'akademik',
            'deskripsiSingkat' => 'Mengurus administrasi akademik mahasiswa.',
            'deskripsiLengkap' => '<p>Deskripsi lengkap bidang akademik.</p>',
            'bannerUrl' => $bannerBase64,
            'kepalaNama' => 'Prof. Dr. John Doe',
            'kepalaJabatan' => 'Kepala Urusan Akademik',
            'kepalaFoto' => $fotoBase64,
            'kepalaTugas' => 'Merencanakan kurikulum perkuliahan.',
            'anggota' => [
                ['nama' => 'Jane Smith', 'jabatan' => 'Staf Kurikulum'],
                ['nama' => 'Bob Johnson', 'jabatan' => 'Staf Nilai'],
            ],
            'ctaHeading' => 'Ada Kendala KRS?',
            'ctaSub' => 'Silakan hubungi helpdesk kami.',
            'ctaBtnText' => 'Hubungi Kami',
            'ctaBtnUrl' => '#krs',
        ]);

        $response->assertRedirect(route('admin.bidang.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('bidangs', [
            'nama' => 'Bidang Akademik',
            'slug' => 'akademik',
            'deskripsi_singkat' => 'Mengurus administrasi akademik mahasiswa.',
        ]);

        $bidang = Bidang::where('slug', 'akademik')->first();
        $this->assertNotNull($bidang);
        $this->assertNotNull($bidang->kepalaBagian);
        $this->assertEquals('Prof. Dr. John Doe', $bidang->kepalaBagian->nama);
        $this->assertEquals(2, $bidang->anggotas()->count());

        // Verify media collection
        $this->assertTrue($bidang->hasMedia('banner'));
        $this->assertTrue($bidang->kepalaBagian->hasMedia('foto'));
    }

    public function test_bidangs_limit_maximum_six()
    {
        $admin = $this->createAdminUser();

        // Create 6 fields
        for ($i = 1; $i <= 6; $i++) {
            Bidang::create([
                'nama' => "Bidang $i",
                'slug' => "bidang-$i",
                'deskripsi_singkat' => 'Singkat',
                'deskripsi_lengkap' => 'Lengkap',
                'urutan' => $i,
            ]);
        }

        $this->assertEquals(6, Bidang::count());

        // Fails to store the 7th
        $response = $this->actingAs($admin)->post(route('admin.bidang.store'), [
            'nama' => 'Bidang 7',
            'slug' => 'bidang-7',
            'deskripsiSingkat' => 'Singkat',
            'deskripsiLengkap' => 'Lengkap',
            'bannerUrl' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'kepalaNama' => 'John',
            'kepalaJabatan' => 'Kepala',
            'kepalaFoto' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ]);

        $response->assertSessionHas('error', 'Batas maksimum 6 bidang telah tercapai.');
        $this->assertEquals(6, Bidang::count());
    }

    public function test_admin_can_update_bidang()
    {
        $admin = $this->createAdminUser();

        $bidang = Bidang::create([
            'nama' => 'Bidang Aset Lama',
            'slug' => 'aset-lama',
            'deskripsi_singkat' => 'Lama',
            'deskripsi_lengkap' => 'Lengkap lama',
            'urutan' => 1,
        ]);
        $bidang->kepalaBagian()->create([
            'nama' => 'Kepala Lama',
            'jabatan' => 'Jabatan Lama',
        ]);

        $bannerBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        $fotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->actingAs($admin)->put(route('admin.bidang.update', $bidang->id), [
            'nama' => 'Bidang Aset Baru',
            'slug' => 'aset-baru',
            'deskripsiSingkat' => 'Baru',
            'deskripsiLengkap' => 'Lengkap baru',
            'bannerUrl' => $bannerBase64,
            'kepalaNama' => 'Kepala Baru',
            'kepalaJabatan' => 'Jabatan Baru',
            'kepalaFoto' => $fotoBase64,
            'kepalaTugas' => 'Tugas baru',
            'anggota' => [
                ['nama' => 'New Staff', 'jabatan' => 'Peran Baru'],
            ],
            'ctaHeading' => 'New CTA',
            'ctaSub' => 'New Sub',
            'ctaBtnText' => 'Pencet',
            'ctaBtnUrl' => '#pencet',
        ]);

        $response->assertRedirect(route('admin.bidang.index'));
        $response->assertSessionHas('success');

        $bidang->refresh();
        $this->assertEquals('Bidang Aset Baru', $bidang->nama);
        $this->assertEquals('aset-baru', $bidang->slug);
        $this->assertEquals('Kepala Baru', $bidang->kepalaBagian->nama);
        $this->assertEquals(1, $bidang->anggotas()->count());
    }

    public function test_admin_can_reorder_bidangs()
    {
        $admin = $this->createAdminUser();

        $bidang1 = Bidang::create([
            'nama' => 'Bidang 1',
            'slug' => 'bidang-1',
            'deskripsi_singkat' => 'S1',
            'deskripsi_lengkap' => 'L1',
            'urutan' => 1,
        ]);
        $bidang2 = Bidang::create([
            'nama' => 'Bidang 2',
            'slug' => 'bidang-2',
            'deskripsi_singkat' => 'S2',
            'deskripsi_lengkap' => 'L2',
            'urutan' => 2,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.bidang.reorder'), [
            'ids' => [$bidang2->id, $bidang1->id],
        ]);

        $response->assertRedirect(route('admin.bidang.index'));

        $this->assertEquals(1, $bidang2->fresh()->urutan);
        $this->assertEquals(2, $bidang1->fresh()->urutan);
    }

    public function test_admin_can_delete_bidang()
    {
        $admin = $this->createAdminUser();

        $bidang = Bidang::create([
            'nama' => 'Bidang Hapus',
            'slug' => 'bidang-hapus',
            'deskripsi_singkat' => 'S',
            'deskripsi_lengkap' => 'L',
            'urutan' => 1,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.bidang.destroy', $bidang->id));
        $response->assertRedirect(route('admin.bidang.index'));

        $this->assertSoftDeleted('bidangs', [
            'id' => $bidang->id,
        ]);
    }

    public function test_public_can_view_bidang_details()
    {
        $bidang = Bidang::create([
            'nama' => 'Bidang Publik',
            'slug' => 'bidang-publik',
            'deskripsi_singkat' => 'S',
            'deskripsi_lengkap' => 'Lengkap publik',
            'urutan' => 1,
        ]);
        $bidang->kepalaBagian()->create([
            'nama' => 'Kepala Publik',
            'jabatan' => 'Urusan Publik',
        ]);

        $response = $this->get(route('public.bidang.show', 'bidang-publik'));
        $response->assertOk();
    }
}
