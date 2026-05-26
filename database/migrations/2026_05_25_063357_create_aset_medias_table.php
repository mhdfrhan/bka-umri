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
        Schema::create('aset_medias', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 255);
            $table->string('tipe', 50);
            $table->string('ekstensi', 10);
            $table->unsignedBigInteger('ukuran');
            $table->unsignedBigInteger('ukuran_asli');
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aset_medias');
    }
};
