process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config({ node_env: 'test' });

// Silence warnings spécifiques à dotenv-flow en CI
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('[dotenv-flow@')
        ) return;
        originalWarn(...args);
    };
});
