@extends('errors::minimal')

@section('title', 'Wymagane logowanie')
@section('code', '401')
@section('description', 'Ta strona jest dostępna tylko po zalogowaniu.')

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'log-in', 'chipTitle' => 'Strona dla zalogowanych'])
@endsection
