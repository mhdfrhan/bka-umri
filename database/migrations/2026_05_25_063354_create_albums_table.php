<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 150);
            $table->string('slug', 170)->unique();
            $table->string('deskripsi', 500)->nullable();
            $table->date('tanggal_kegiatan');
            $table->foreignId('kategori_dokumentasi_id')->nullable()->constrained('kategori_dokumentasis')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('albums');
    }
};
