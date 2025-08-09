import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

export const imageSchema = ({ image }: SchemaContext) =>
  z.object({
      image: image(),
      description: z.string().optional(),
  });

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featuredImage: imageSchema().optional(),
    featuredImageAlt: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    author: z.string(),
    keywords: z.array(z.string()).default([]),
    readingTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};


