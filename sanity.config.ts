import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'n7arap96';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'development';
const previewUrl = process.env.NEXT_PUBLIC_SANITY_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default defineConfig({
  name: 'bullmet',
  title: 'Bullmet — контент сайта',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool(),
    presentationTool({
      title: 'Предпросмотр',
      previewUrl: {
        initial: previewUrl,
        previewMode: { enable: '/api/draft-mode/enable' }
      }
    })
  ],
  schema: { types: schemaTypes }
});
