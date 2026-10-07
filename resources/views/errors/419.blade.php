@extends('errors::minimal')

@section('title', 'Sesja wygasła')
@section('code', '419')
@section('description')
    Formularz był otwarty zbyt długo i&nbsp;ze względów bezpieczeństwa stracił ważność. Otwórz go ponownie i&nbsp;wyślij jeszcze raz.
@endsection

{{--
    Back to the page the expired form was on (a same-origin referrer), never the POST address itself. A plain prefix
    check: the scheme, host and port must match exactly, so no URL-parser differences between PHP and browsers matter.
--}}
@section('actions')
    @php
        $formUrl = rescue(function (): string {
            $referer = (string) request()->headers->get('referer', '');

            return str_starts_with($referer, request()->getSchemeAndHttpHost().'/') ? $referer : '/';
        }, '/', false);
    @endphp
    <a class="button button--primary" href="{{ $formUrl }}">Wróć do formularza</a>
    <a class="button button--outline" href="/#kontakt">Napisz do nas</a>
@endsection

@section('visual')
    @include('errors::partials.window', ['scene' => 'form', 'icon' => 'clock', 'chipTitle' => 'Formularz wygasł'])
@endsection
