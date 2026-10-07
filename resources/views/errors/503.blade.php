@extends('errors::minimal')

@section('title', 'Trwają prace techniczne')
@section('code', '503')
@section('description', 'Aktualizujemy stronę. Wróć za kilka minut.')
@section('maintenance', '1')

{{-- An empty href reloads the current address, also on the prerendered maintenance page. --}}
@section('actions')
    <a class="button button--primary" href="">Odśwież stronę</a>
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'update', 'icon' => 'refresh', 'chipTitle' => 'Aktualizacja w toku'])
@endsection
