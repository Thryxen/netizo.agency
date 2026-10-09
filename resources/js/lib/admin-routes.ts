const base = '/admin';

export const adminRoutes = {
    login: `${base}/login`,
    logout: `${base}/logout`,
    projects: {
        index: `${base}/projects`,
        create: `${base}/projects/create`,
        edit: (id: number): string => `${base}/projects/${id}/edit`,
        update: (id: number): string => `${base}/projects/${id}`,
        destroy: (id: number): string => `${base}/projects/${id}`,
        reorder: `${base}/projects/reorder`,
    },
    clients: {
        index: `${base}/clients`,
        create: `${base}/clients/create`,
        edit: (id: number): string => `${base}/clients/${id}/edit`,
        update: (id: number): string => `${base}/clients/${id}`,
        destroy: (id: number): string => `${base}/clients/${id}`,
        reorder: `${base}/clients/reorder`,
    },
    messages: {
        index: `${base}/messages`,
        show: (id: number): string => `${base}/messages/${id}`,
        destroy: (id: number): string => `${base}/messages/${id}`,
    },
    briefs: {
        index: `${base}/briefs`,
        show: (id: number): string => `${base}/briefs/${id}`,
        destroy: (id: number): string => `${base}/briefs/${id}`,
    },
    callbacks: {
        index: `${base}/callbacks`,
        destroy: (id: number): string => `${base}/callbacks/${id}`,
    },
    partners: {
        index: `${base}/partners`,
        show: (id: number): string => `${base}/partners/${id}`,
        destroy: (id: number): string => `${base}/partners/${id}`,
    },
} as const;
