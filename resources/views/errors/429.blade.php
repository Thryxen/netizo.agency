@extends('errors::minimal')

@section('title', 'Zbyt wiele prób')
@section('code', '429')
@section('description')
    W&nbsp;krótkim czasie wysłano zbyt wiele zapytań. Odczekaj minutę i&nbsp;spróbuj ponownie.
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'requests', 'icon' => 'hourglass', 'chipTitle' => 'Odczekaj minutę'])
@endsection
