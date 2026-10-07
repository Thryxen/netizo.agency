@extends('errors::minimal')

{{-- Any other server error without its own view (502, 504, ...). --}}
@php
    $statusCode = isset($exception) && method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
@endphp

@section('title', 'Coś poszło nie tak')
@section('code', (string) $statusCode)
@section('description', 'To błąd na naszym serwerze. Spróbuj ponownie za kilka minut.')

@section('visual')
    @include('errors::partials.window', ['icon' => 'server-crash', 'chipTitle' => 'Serwer nie odpowiada'])
@endsection
