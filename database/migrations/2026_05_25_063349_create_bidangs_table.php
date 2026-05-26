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
        Schema::create('bidangs', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('slug', 120)->unique();
            $table->string('deskripsi_singkat', 200);
            $table->text('deskripsi_lengkap');
            $table->unsignedSmallInteger('urutan')->default(0);
            $table->string('cta_heading', 100)->nullable();
            $table->string('cta_sub', 100)->nullable();
            $table->string('cta_teks_tombol', 30)->nullable();
            $table->string('cta_tautan', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bidangs');
    }
};
