<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'discord' => [
        'webhook_contact' => env('DISCORD_WEBHOOK_CONTACT'),
        'webhook_brief' => env('DISCORD_WEBHOOK_BRIEF'),
        'webhook_callback' => env('DISCORD_WEBHOOK_CALLBACK'),
        'webhook_partner' => env('DISCORD_WEBHOOK_PARTNER', env('DISCORD_WEBHOOK_CONTACT')),
        'role_id' => env('DISCORD_ROLE_ID'),
    ],

    /*
     * The API key is read by the AI SDK (config/ai.php in laravel/ai: OPENROUTER_API_KEY). The model translates
     * project copy into English in the admin panel (App\Ai\Agents\ProjectTranslator).
     */
    'openrouter' => [
        'translation_model' => env('OPENROUTER_TRANSLATION_MODEL', 'anthropic/claude-haiku-5.5'),
    ],

];
