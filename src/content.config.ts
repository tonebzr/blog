// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  // We extend the default schema to include the 'order' field
  docs: defineCollection({ 
    loader: docsLoader(), 
    schema: docsSchema({
      extend: z.object({
        // PRIORITY: This allows Astro to see your 'order: x' in Markdown
        order: z.number().optional(),
      }),
    }),
  }),

  // Standard i18n collection for Starlight
  i18n: defineCollection({ 
    loader: i18nLoader(), 
    schema: i18nSchema() 
  }),
};