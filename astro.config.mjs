// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
    redirects: {
        '/': '/fr/'
    },
    integrations: [
        starlight({
            title: 'TBZR Blog',
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
            // Add the override here
            components: {
                LanguageSelect: './src/components/LanguageSelect.astro',
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