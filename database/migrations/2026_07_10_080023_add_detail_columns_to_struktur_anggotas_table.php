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
        Schema::table('struktur_anggotas', function (Blueprint $table) {
            $table->text('tugas_pokok')->nullable()->after('jabatan');
            $table->text('jobdesk')->nullable()->after('tugas_pokok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('struktur_anggotas', function (Blueprint $table) {
            $table->dropColumn(['tugas_pokok', 'jobdesk']);
        });
    }
};
