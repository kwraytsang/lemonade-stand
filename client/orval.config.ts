import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../server/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/lib/api/generated',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: 'src/lib/api/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
