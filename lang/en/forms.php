<?php

/*
 * Errors of the public forms on the English site: the custom validation messages of each Form Request, the `forms`
 * rate limiter and the exception handler. Polish twin: lang/pl/forms.php (same keys).
 */
return [
    'errors' => [
        'throttled' => 'Too many attempts. Please try again in a minute.',
        'expired' => 'The form has expired. Please send it again.',
        'failed' => 'We couldn’t send the form. Please try again in a moment or email us at kontakt@netizo.pl.',
    ],

    // StoreContactMessageRequest
    'contact' => [
        'name.required' => 'Please enter your full name.',
        'name.string' => 'Please enter a valid full name.',
        'name.min' => 'Your full name must be at least 2 characters long.',
        'name.max' => 'Your full name can be at most 255 characters long.',
        'email.required' => 'Please enter your email address.',
        'email.email' => 'Please enter a valid email address.',
        'email.max' => 'Your email address can be at most 255 characters long.',
        'subject.string' => 'Please choose a subject from the list.',
        'subject.in' => 'Please choose a subject from the list.',
        'message.required' => 'Please enter a message.',
        'message.string' => 'Please enter a message.',
        'message.min' => 'Your message must be at least 10 characters long.',
        'message.max' => 'Your message can be at most 5,000 characters long.',
    ],

    // StoreProjectBriefRequest
    'brief' => [
        'types.required' => 'Please choose at least one project type.',
        'types.array' => 'Please choose at least one project type.',
        'types.in' => 'Please choose a project type from the list.',
        'features.array' => 'Please choose features from the list.',
        'features.in' => 'Please choose features from the list.',
        'industry.string' => 'Please choose an industry from the list.',
        'industry.in' => 'Please choose an industry from the list.',
        'audience.string' => 'Please choose a target audience from the list.',
        'audience.in' => 'Please choose a target audience from the list.',
        'design.string' => 'Please choose one of the design options.',
        'design.in' => 'Please choose one of the design options.',
        'timeline.string' => 'Please choose a timeline from the list.',
        'timeline.in' => 'Please choose a timeline from the list.',
        'tech.array' => 'Please choose technologies from the list.',
        'tech.in' => 'Please choose technologies from the list.',
        'security.string' => 'Please choose a security level from the list.',
        'security.in' => 'Please choose a security level from the list.',
        'hosting.string' => 'Please choose a hosting option from the list.',
        'hosting.in' => 'Please choose a hosting option from the list.',
        'integrations.string' => 'The integrations description must be text.',
        'integrations.max' => 'The integrations description can be at most 5,000 characters long.',
        'budget.string' => 'Please choose a budget from the list.',
        'budget.in' => 'Please choose a budget from the list.',
        'cooperation_model.string' => 'Please choose an engagement model from the list.',
        'cooperation_model.in' => 'Please choose an engagement model from the list.',
        'notes.string' => 'Additional information must be text.',
        'notes.max' => 'Additional information can be at most 5,000 characters long.',
        'name.required' => 'Please enter your full name.',
        'name.string' => 'Please enter a valid full name.',
        'name.min' => 'Your full name must be at least 2 characters long.',
        'name.max' => 'Your full name can be at most 255 characters long.',
        'email.required' => 'Please enter your email address.',
        'email.email' => 'Please enter a valid email address.',
        'email.max' => 'Your email address can be at most 255 characters long.',
        'phone.string' => 'Please enter a valid phone number.',
        'phone.max' => 'Your phone number can be at most 255 characters long.',
        'company.string' => 'Please enter a valid company name.',
        'company.max' => 'The company name can be at most 255 characters long.',
        'position.string' => 'Please enter a valid job title.',
        'position.max' => 'The job title can be at most 255 characters long.',
        'website.string' => 'Please enter a valid website address.',
        'website.max' => 'The website address can be at most 255 characters long.',
        'source.string' => 'Please choose a source from the list.',
        'source.in' => 'Please choose a source from the list.',
        'contact_pref.array' => 'Please choose a preferred contact method from the list.',
        'contact_pref.in' => 'Please choose a preferred contact method from the list.',
        'privacy.accepted' => 'Please accept the privacy policy.',
    ],

    // StoreCallbackRequestRequest
    'callback' => [
        'phone.required' => 'Please enter your phone number.',
        'phone.string' => 'Please enter a valid phone number.',
        'phone.min' => 'Please enter a valid phone number.',
        'phone.max' => 'Please enter a valid phone number.',
    ],

    // StoreNewsletterSubscriptionRequest
    'newsletter' => [
        'email.required' => 'Please enter your email address.',
        'email.email' => 'Please enter a valid email address.',
        'email.max' => 'Your email address can be at most 255 characters long.',
        'email.unique' => 'This address is already subscribed to the newsletter.',
    ],

    // StorePartnerApplicationRequest
    'partner' => [
        'name.required' => 'Please enter your full name.',
        'name.string' => 'Please enter a valid full name.',
        'name.min' => 'Your full name must be at least 2 characters long.',
        'name.max' => 'Your full name can be at most 255 characters long.',
        'email.required' => 'Please enter your email address.',
        'email.email' => 'Please enter a valid email address.',
        'email.max' => 'Your email address can be at most 255 characters long.',
        'phone.string' => 'Please enter a valid phone number.',
        'phone.min' => 'Please enter a valid phone number.',
        'phone.max' => 'Please enter a valid phone number.',
        'partner_type.required' => 'Please tell us who you are.',
        'partner_type.string' => 'Please tell us who you are.',
        'partner_type.in' => 'Please tell us who you are.',
        'message.string' => 'Please enter valid text.',
        'message.max' => 'Your message can be at most 2,000 characters long.',
    ],
];
