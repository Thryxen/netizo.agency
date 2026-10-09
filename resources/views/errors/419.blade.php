@extends('errors::minimal')

@section('title', __('errors.pages.419.title'))
@section('code', '419')
@section('description')
    {!! __('errors.pages.419.description') !!}
@endsection

{{--
    Back to the page the expired form was on (a same-origin referrer), never the POST address itself. A plain prefix
    check: the scheme, host and port must match exactly, so no URL-parser differences between PHP and browsers matter.
--}}
@section('actions')
    @php
        $homeUrl = __('errors.home_url');
        $formUrl = rescue(function () use ($homeUrl): string {
            $referer = (string) request()->headers->get('referer', '');

            return str_starts_with($referer, request()->getSchemeAndHttpHost().'/') ? $referer : $homeUrl;
        }, $homeUrl, false);
    @endphp
    <a class="button button--primary" href="{{ $formUrl }}">{{ __('errors.back_to_form') }}</a>
    <a class="button button--outline" href="{{ __('errors.contact_url') }}">{{ __('errors.contact') }}</a>
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'form', 'icon' => 'clock', 'chipTitle' => __('errors.pages.419.chip')])
@endsection
