export const endpoints = {
    contact: '/kontakt',
    brief: '/brief',
    callback: '/oddzwonimy',
    newsletter: '/newsletter',
} as const;

export type Endpoint = (typeof endpoints)[keyof typeof endpoints];
