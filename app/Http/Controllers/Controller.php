<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Build the FAQPage JSON-LD document from a page's FAQ items (the root view renders it as `faqSchema`).
     *
     * @param  list<array{question: string, answer: string}>  $faq
     * @return array<string, mixed>
     */
    protected function faqSchema(array $faq): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $item): array => [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item['answer'],
                ],
            ], $faq),
        ];
    }
}
