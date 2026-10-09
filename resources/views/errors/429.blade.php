@extends('errors::minimal')

@section('title', __('errors.pages.429.title'))
@section('code', '429')
@section('description')
    {!! __('errors.pages.429.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'requests', 'icon' => 'hourglass', 'chipTitle' => __('errors.pages.429.chip')])
@endsection
