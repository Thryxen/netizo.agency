@extends('errors::minimal')

@section('title', 'Wymagana płatność')
@section('code', '402')
@section('description')
    Dostęp do tej strony wymaga opłaty. Jeśli to pomyłka, skontaktuj się z&nbsp;nami.
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'credit-card', 'chipTitle' => 'Treść płatna'])
@endsection
