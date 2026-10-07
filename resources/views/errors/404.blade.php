@extends('errors::minimal')

@section('title', 'Nie ma takiej strony')
@section('code', '404')
@section('description')
    Adres mógł się zmienić albo strona została usunięta. Sprawdź, czy w&nbsp;adresie nie ma literówki.
@endsection

@section('visual')
    @include('errors::partials.window', ['icon' => 'file-x', 'chipTitle' => 'Pod tym adresem nic nie ma'])
@endsection
