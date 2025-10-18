/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@brik/core$': '<rootDir>/packages/brik-core/src',
    '^@brik/schemas$': '<rootDir>/packages/brik-schemas/src',
    '^@brik/compiler$': '<rootDir>/packages/brik-compiler/src',
    '^@brik/target-swiftui$': '<rootDir>/packages/brik-target-swiftui/src',
    '^@brik/target-compose$': '<rootDir>/packages/brik-target-compose/src',
    '^@brik/test-utils$': '<rootDir>/packages/brik-test-utils/src',
  },
};




