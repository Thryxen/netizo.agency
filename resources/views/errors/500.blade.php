@extends('errors::minimal')

@section('title', __('errors.pages.500.title'))
@section('code', '500')
@section('description')
    {!! __('errors.pages.500.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['icon' => 'server-crash', 'chipTitle' => __('errors.pages.500.chip')])
@endsection
