@extends('errors::minimal')

@section('title', __('errors.pages.402.title'))
@section('code', '402')
@section('description')
    {!! __('errors.pages.402.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'locked', 'icon' => 'credit-card', 'chipTitle' => __('errors.pages.402.chip')])
@endsection
