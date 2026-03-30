// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightCatppuccin from '@catppuccin/starlight';

export default defineConfig({
    redirects: {
        '/': '/fr/'
    },
    integrations: [
        starlight({
            title: 'blog',
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
                { icon: 'github', label: 'GitHub', href: 'https://github.com/tonebzr/blog' },
                { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/tony-brezulier' }
            ],

            // --- DESACTIVATION DES BOUTONS PRECEDENT / SUIVANT ---
            pagination: false,
            
            sidebar: [
                { 
                    label: 'AI', 
                    link: '/ai/',
                    translations: { en: 'AI' } 
                },
                { 
                    label: 'SEC', 
                    link: '/sec/',
                    translations: { en: 'SEC' } 
                },
                { 
                    label: 'RADIO', 
                    link: '/radio/',
                    translations: { en: 'RADIO' } 
                },
                { 
                    label: 'FORMATION', 
                    link: '/formation/',
                    translations: { en: 'LEARNING' } // Le texte change en anglais
                },
                { 
                    label: 'ACTUALITÉ', 
                    link: '/news/',
                    translations: { en: 'NEWS' },
                    badge: { text: 'BLOG', variant: 'danger' } 
                },
            ],
        }),
    ],
});