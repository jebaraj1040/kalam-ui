<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\SiteStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('site_id')->nullable()->unique();
            $table->string('name');
            $table->enum('status', array_column(SiteStatus::cases(), 'value'))->default(SiteStatus::Active->value);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
