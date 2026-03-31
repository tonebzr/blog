import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
    // Indispensable pour que Starlight lise tes fichiers .md / .mdx
    docs: defineCollection({ 
        loader: docsLoader(), 
        schema: docsSchema() 
    }),
    // Indispensable pour la traduction de l'interface (boutons, recherche, etc.)
    i18n: defineCollection({ 
        loader: i18nLoader(), 
        schema: i18nSchema() 
    }),
};