<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * English copy of a project for the /en site. Every column is optional: an empty one falls back to the Polish copy.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('category_en')->nullable()->after('full_description');
            $table->text('description_en')->nullable()->after('category_en');
            $table->text('full_description_en')->nullable()->after('description_en');
            $table->json('metrics_en')->nullable()->after('full_description_en');
            $table->json('challenges_en')->nullable()->after('metrics_en');
            $table->json('solutions_en')->nullable()->after('challenges_en');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['category_en', 'description_en', 'full_description_en', 'metrics_en', 'challenges_en', 'solutions_en']);
        });
    }
};
