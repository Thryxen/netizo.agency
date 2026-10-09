<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables of the leads collected by the public forms.
     *
     * @var list<string>
     */
    private array $tables = ['contact_messages', 'project_briefs', 'callback_requests', 'newsletter_subscribers', 'partner_applications'];

    /**
     * The language of the site a lead came from (pl or en), so the reply goes out in that language.
     */
    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('locale', 2)->default('pl')->after('id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('locale');
            });
        }
    }
};
