import dotenv from 'dotenv';

import { CodegenConfig } from '@graphql-codegen/cli';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

const config: CodegenConfig = {
  require: ['ts-node/register'],
  schema: {
    'http://localhost:4000/dev/graphql': {
      headers: {
        'x-api-key': API_KEY
      }
    }
  },
  documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client'
    }
  }
};

export default config;
