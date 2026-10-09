export const endpoints = {
    contact: '/kontakt',
    brief: '/brief',
    callback: '/oddzwonimy',
    newsletter: '/newsletter',
    partner: '/partnerzy',
} as const;

export type Endpoint = (typeof endpoints)[keyof typeof endpoints];
