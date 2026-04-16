import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID/SANITY_STUDIO_DATASET (or PUBLIC_SANITY_PROJECT_ID/PUBLIC_SANITY_DATASET) in studio env.'
  );
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
