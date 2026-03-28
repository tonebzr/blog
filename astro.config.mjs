// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	redirects: {
        '/': '/fr/'
    },
    integrations: [
        starlight({
            title: 'TBZR Blog',
            // On définit ici les langues supportées
            defaultLocale: 'fr', 
            locales: {
                fr: {
                    label: 'Français',
                    lang: 'fr-FR',
                },
                en: {
                    label: 'English',
                    lang: 'en-US',
                },
            },
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/tonebzr/blog' }
            ],
            sidebar: [
                {
                    label: 'Guides',
                    translations: {
                        en: 'Guides',
                    },
                    items: [
                        { label: 'Exemple de Guide', slug: 'guides/example', translations: { en: 'Example Guide' } },
                    ],
                },
            ],
        }),
    ],
});