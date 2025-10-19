/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  passWithNoTests: true,
  moduleNameMapper: {
    '^@brik/core$': '<rootDir>/../brik-core/src',
    '^@brik/schemas$': '<rootDir>/../brik-schemas/src',
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
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(fs-extra|@babel|glob)/)',
  ],
};
