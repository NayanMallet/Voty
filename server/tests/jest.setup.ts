process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config({ node_env: 'test', silent: true });
