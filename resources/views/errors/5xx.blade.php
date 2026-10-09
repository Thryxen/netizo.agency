@extends('errors::minimal')

{{-- Any other server error without its own view (502, 504, ...). --}}
@php
    $statusCode = isset($exception) && method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
@endphp

@section('title', __('errors.pages.5xx.title'))
@section('code', (string) $statusCode)
@section('description')
    {!! __('errors.pages.5xx.description') !!}
@endsection

@section('visual')
    @include('errors::partials.window', ['icon' => 'server-crash', 'chipTitle' => __('errors.pages.5xx.chip')])
@endsection
