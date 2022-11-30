module.exports = {
    'preset': 'ts-jest',
    'testEnvironment': 'node',
    'testMatch': ['**/test/**/?(*.)+(spec|test).[jt]s?(x)'],
    'collectCoverage': true,
    'collectCoverageFrom': ['src/**/*.ts'],
    'coverageReporters': ['text-summary', 'json', 'html', 'cobertura'],
    'reporters': [
        'default',
        [ 'jest-junit', {
            suiteName: 'Notification jest tests',
            outputName: 'TEST-junit.xml'
        } ]
    ],
    'verbose': true,
    'setupFiles': [
        '<rootDir>/test/setup-tests.ts'
    ],
};
