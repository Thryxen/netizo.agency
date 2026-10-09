<?php

namespace App\Models;

use Database\Factories\PartnerApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerApplication extends Model
{
    /** @use HasFactory<PartnerApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'partner_type',
        'message',
    ];
}
