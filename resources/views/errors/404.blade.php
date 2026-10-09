@extends('errors::minimal')

@section('title', __('errors.pages.404.title'))
@section('code', '404')
@section('description')
    {!! __('errors.pages.404.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['icon' => 'file-x', 'chipTitle' => __('errors.pages.404.chip')])
@endsection
