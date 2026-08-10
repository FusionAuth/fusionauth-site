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
        Schema::table('users',  function (Blueprint $table) {
            $table->string('fusionauth_id', 36)->unique();
            $table->text('fusionauth_access_token');
            $table->text('fusionauth_refresh_token')->nullable();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users',  function (Blueprint $table) {
            $table->dropColumn('fusionauth_id');
            $table->dropColumn('fusionauth_access_token');
            $table->dropColumn('fusionauth_refresh_token');
            $table->string('password')->nullable(false)->change();
        });
    }
};
