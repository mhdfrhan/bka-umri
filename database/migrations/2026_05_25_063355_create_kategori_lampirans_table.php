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
        Schema::create('kategori_lampirans', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100)->unique();
            $table->string('slug', 120)->unique();
            $table->string('deskripsi', 300)->nullable();
            $table->unsignedSmallInteger('urutan')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_lampirans');
    }
};
