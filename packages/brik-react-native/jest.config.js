/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  passWithNoTests: true,
  moduleNameMapper: {
    '^@brik/core$': '<rootDir>/../brik-core/src',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2021',
          module: 'CommonJS',
          moduleResolution: 'Node',
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          jsx: 'react',
        },
      },
    ],
  },
};
