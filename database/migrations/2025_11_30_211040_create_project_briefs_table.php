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
        Schema::create('project_briefs', function (Blueprint $table) {
            $table->id();

            // Step 1: Project types
            $table->json('types')->nullable();

            // Step 2: Features
            $table->json('features')->nullable();

            // Step 3: Details
            $table->string('industry')->nullable();
            $table->string('audience')->nullable();
            $table->string('design')->nullable();
            $table->string('timeline')->nullable();

            // Step 4: Tech
            $table->json('tech')->nullable();
            $table->string('security')->nullable();
            $table->string('hosting')->nullable();
            $table->text('integrations')->nullable();

            // Step 5: Budget
            $table->string('budget')->nullable();
            $table->string('cooperation_model')->nullable();
            $table->text('notes')->nullable();

            // Step 6: Contact
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('position')->nullable();
            $table->string('website')->nullable();
            $table->string('source')->nullable();
            $table->json('contact_pref')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_briefs');
    }
};
