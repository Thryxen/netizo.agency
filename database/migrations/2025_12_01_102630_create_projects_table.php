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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            // Basic info
            $table->string('title');
            $table->string('url');
            $table->string('category');
            $table->text('description');
            $table->text('full_description');

            // Images - 2 separate images
            $table->string('thumbnail_image')->nullable(); // Image shown on homepage
            $table->string('full_image')->nullable(); // Image shown in modal (high quality)

            // Tech stack (JSON array)
            $table->json('tech_stack');

            // Metrics (JSON array of objects with value and label)
            $table->json('metrics');

            // Challenges and Solutions (JSON arrays)
            $table->json('challenges');
            $table->json('solutions');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
