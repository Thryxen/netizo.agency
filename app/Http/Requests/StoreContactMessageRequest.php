<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactMessageRequest extends FormRequest
{
    /**
     * Allowed values of the "Temat" select.
     *
     * @var list<string>
     */
    public const SUBJECTS = ['project', 'cooperation', 'career', 'other'];

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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', Rule::in(self::SUBJECTS)],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Imię i nazwisko jest wymagane.',
            'name.string' => 'Podaj poprawne imię i nazwisko.',
            'name.min' => 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
            'name.max' => 'Imię i nazwisko może mieć maksymalnie 255 znaków.',
            'email.required' => 'Adres e-mail jest wymagany.',
            'email.email' => 'Podaj poprawny adres e-mail.',
            'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
            'subject.string' => 'Wybierz temat z listy.',
            'subject.in' => 'Wybierz temat z listy.',
            'message.required' => 'Wiadomość jest wymagana.',
            'message.string' => 'Wiadomość jest wymagana.',
            'message.min' => 'Wiadomość musi mieć co najmniej 10 znaków.',
            'message.max' => 'Wiadomość może mieć maksymalnie 5000 znaków.',
        ];
    }
}
