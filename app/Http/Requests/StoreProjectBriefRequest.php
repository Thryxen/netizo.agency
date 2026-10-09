<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectBriefRequest extends FormRequest
{
    /** @var list<string> */
    public const TYPES = ['website', 'webapp', 'ecommerce', 'mobile', 'redesign', 'other'];

    /** @var list<string> */
    public const FEATURES = [
        'auth', 'social', 'roles', 'profiles',
        'payments', 'subscriptions', 'invoices', 'cart',
        'cms', 'admin', 'analytics', 'reports',
        'api', 'notifications', 'chat', 'email',
        'booking', 'search', 'multilang', 'ai', 'maps', 'upload',
    ];

    /** @var list<string> */
    public const INDUSTRIES = ['ecommerce', 'fintech', 'healthcare', 'education', 'realestate', 'travel', 'logistics', 'saas', 'media', 'other'];

    /** @var list<string> */
    public const AUDIENCES = ['b2c', 'b2b', 'both', 'internal'];

    /** @var list<string> */
    public const DESIGNS = ['yes', 'partial', 'no'];

    /** @var list<string> */
    public const TIMELINES = ['asap', '1-2', '3-6', 'flexible'];

    /** @var list<string> */
    public const TECH = ['react', 'next', 'vue', 'node', 'laravel', 'python', 'wordpress', 'shopify', 'nopreference'];

    /** @var list<string> */
    public const SECURITY_LEVELS = ['standard', 'high', 'enterprise'];

    /** @var list<string> */
    public const HOSTING_OPTIONS = ['help', 'own', 'cloud'];

    /** @var list<string> */
    public const BUDGETS = ['small', 'medium', 'large', 'enterprise', 'unknown'];

    /** @var list<string> */
    public const COOPERATION_MODELS = ['fixed', 'hourly', 'dedicated'];

    /** @var list<string> */
    public const SOURCES = ['google', 'social', 'referral', 'clutch', 'other'];

    /** @var list<string> */
    public const CONTACT_PREFERENCES = ['email', 'phone', 'video'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Option arrays use the "in" rule together with "array", so every
     * element must be an allowed value and errors land on the array key.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'types' => ['required', 'array', Rule::in(self::TYPES)],
            'features' => ['nullable', 'array', Rule::in(self::FEATURES)],
            'industry' => ['nullable', 'string', Rule::in(self::INDUSTRIES)],
            'audience' => ['nullable', 'string', Rule::in(self::AUDIENCES)],
            'design' => ['nullable', 'string', Rule::in(self::DESIGNS)],
            'timeline' => ['nullable', 'string', Rule::in(self::TIMELINES)],
            'tech' => ['nullable', 'array', Rule::in(self::TECH)],
            'security' => ['nullable', 'string', Rule::in(self::SECURITY_LEVELS)],
            'hosting' => ['nullable', 'string', Rule::in(self::HOSTING_OPTIONS)],
            'integrations' => ['nullable', 'string', 'max:5000'],
            'budget' => ['nullable', 'string', Rule::in(self::BUDGETS)],
            'cooperation_model' => ['nullable', 'string', Rule::in(self::COOPERATION_MODELS)],
            'notes' => ['nullable', 'string', 'max:5000'],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'string', Rule::in(self::SOURCES)],
            'contact_pref' => ['nullable', 'array', Rule::in(self::CONTACT_PREFERENCES)],
            'privacy' => ['accepted'],
        ];
    }

    /**
     * Get the custom validation messages, in the language of the page the form was sent from (lang/{pl,en}/forms.php).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return __('forms.brief');
    }
}
