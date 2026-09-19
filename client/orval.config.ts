import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../server/openapi.json',
      filters: {
        mode: 'exclude',
        tags: [/^admin\//, 'health'],
      },
    },
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
