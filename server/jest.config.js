const { createDefaultPreset } = require('ts-jest');
const tsJest = createDefaultPreset();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: tsJest.transform,
};
