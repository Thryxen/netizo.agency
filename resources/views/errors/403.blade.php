@extends('errors::minimal')

@section('title', __('errors.pages.403.title'))
@section('code', '403')
@section('description')
    {!! __('errors.pages.403.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'lock', 'chipTitle' => __('errors.pages.403.chip')])
@endsection
