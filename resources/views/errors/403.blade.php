@extends('errors::minimal')

@section('title', 'Brak dostępu')
@section('code', '403')
@section('description', 'Nie masz uprawnień, żeby zobaczyć tę stronę.')

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'lock', 'chipTitle' => 'Dostęp zablokowany'])
@endsection
