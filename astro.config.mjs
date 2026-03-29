// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightCatppuccin from '@catppuccin/starlight'; // 1. Ajout de l'import

export default defineConfig({
    redirects: {
        '/': '/fr/'
    },
    integrations: [
        starlight({
            title: 'Blog',
            // 2. Ajout du plugin ici
            customCss: ['./src/styles/custom.css'],
            
            plugins: [
                starlightCatppuccin({
                    dark: { flavor: "mocha", accent: "sapphire" },
                    light: { flavor: "latte", accent: "sapphire" },
                }),
            ],
            logo: {
                src: './src/assets/images/home/tbzr_logo.webp',
                alt: 'Logo TBZR',
            },
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