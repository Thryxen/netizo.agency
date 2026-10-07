@extends('errors::minimal')

{{-- Any other client error without its own view (405, 410, 413, ...). --}}
@php
    $statusCode = isset($exception) && method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 400;
@endphp

@section('title', 'Nie udało się otworzyć strony')
@section('code', (string) $statusCode)
@section('description', 'Nie możemy obsłużyć tego zapytania. Sprawdź adres strony.')

@section('visual')
    @include('errors::partials.window', ['icon' => 'ban', 'chipTitle' => 'Zapytanie odrzucone'])
@endsection
