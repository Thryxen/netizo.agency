@extends('errors::minimal')

@section('title', __('errors.pages.503.title'))
@section('code', '503')
@section('description')
    {!! __('errors.pages.503.description') !!}
@endsection
@section('maintenance', '1')

{{-- An empty href reloads the current address, also on the prerendered maintenance page. --}}
@section('actions')
    <a class="button button--primary" href="">{{ __('errors.reload') }}</a>
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'update', 'icon' => 'refresh', 'chipTitle' => __('errors.pages.503.chip')])
@endsection
