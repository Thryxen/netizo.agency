@extends('errors::minimal')

{{-- Any other client error without its own view (405, 410, 413, ...). --}}
@php
    $statusCode = isset($exception) && method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 400;
@endphp

@section('title', __('errors.pages.4xx.title'))
@section('code', (string) $statusCode)
@section('description')
    {!! __('errors.pages.4xx.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['icon' => 'ban', 'chipTitle' => __('errors.pages.4xx.chip')])
@endsection
