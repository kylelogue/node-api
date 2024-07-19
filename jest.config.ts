export default {
    clearMocks: true,
    resetMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./src/db/mock.ts'],
};