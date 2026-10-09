@extends('errors::minimal')

@section('title', __('errors.pages.401.title'))
@section('code', '401')
@section('description')
    {!! __('errors.pages.401.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'log-in', 'chipTitle' => __('errors.pages.401.chip')])
@endsection
