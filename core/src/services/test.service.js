import { loggerService } from "./logger.service.js";
import { resetMongoDb, resetMysqlDb, dbType, resetAllMysqlTables } from '../db/db.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

/**
 * Run tests
 */
export const testService = {
    testsDirectory: `${process.env.GLOBAL_SERVICE_BASE_DIR}/tests/commands`,
    failed: 0,
    prepFns: [],
    tests: [],
    testResults: [],
    beforeEachFns: [],   // functions to run before every test
    afterEachFns: [],    // functions to run after every test

    // skip table reset before each test flag
    skipResetBeforeEachTest: false,

    // register prep function
    prep: (fn) => {
        testService.prepFns.push(fn);
    },

    // register test function
    run: (name, fn) => {
        testService.tests.push({ name, fn });
    },

    // register beforeEach function
    beforeEach: (fn) => {
        testService.beforeEachFns.push(fn);
    },

    // register afterEach function
    afterEach: (fn) => {
        testService.afterEachFns.push(fn);
    },

    // Internal function to reset DB tables before each test
    resetDbTablesBeforeTest: async () => {
        try {
            switch (dbType) {
                case 'mongodb':
                    await resetMongoDb();
                    console.log('MongoDB test database reset before test');
                    break;
                case 'mysql':
                    await resetAllMysqlTables();
                    console.log('MySQL test database tables reset before test');
                    break;
            }
        } catch (err) {
            loggerService.error('Error resetting DB before test: ' + err.message);
            throw err;
        }
    },

    assert: assert,

    runCommandTests: async () => {
        console.log('==============================');
        console.log('Running command tests...');

        const testFiles = fs.readdirSync(testService.testsDirectory)
            .filter(file => file.endsWith('.js'))
            .sort();

        for (const file of testFiles) {
            testService.prepFns = [];
            testService.tests = [];

            const fullPath = path.join(testService.testsDirectory, file);

            try {
                await import(fullPath);
            } catch (err) {
                testService.failed++;
                console.error(`❌ Failed to load ${file}: ${err.message}`);
                continue;
            }

            // Run prep functions
            for (const fn of testService.prepFns) {
                try {
                    await fn();
                } catch (err) {
                    testService.failed++;
                    console.error(`❌ Test preparation failed - ${err.message}`);
                }
            }

            // Run tests
            for (const t of testService.tests) {
                try {
                    // reset DB before each test if the flag is not set
                    if (!testService.skipResetBeforeEachTest) {
                        await testService.resetDbTablesBeforeTest();
                    }
                    // run beforeEach functions
                    for (const beforeFn of testService.beforeEachFns) {
                        await beforeFn();
                    }

                    await t.fn();
                    testService.testResults.push({ name: t.name, error: null });
                } catch (err) {
                    testService.failed++;
                    testService.testResults.push({ name: t.name, error: err });
                } finally {
                    // run afterEach functions
                    for (const afterFn of testService.afterEachFns) {
                        try {
                            await afterFn();
                        } catch (err) {
                            console.error(`❌ afterEach failed: ${err.message}`);
                        }
                    }
                }
            }
        }

        console.table(testService.testResults.map(result => ({
            Test: result.name,
            Result: result.error ? `❌ Failed - ${result.error.message}` : '✅ Passed'
        })));

        if (testService.failed > 0) {
            console.error(`❌ Some Integration tests failed: ${testService.failed} error(s)`);
        } else {
            console.log('✅ All integration tests passed!');
        }

        try {
            switch (dbType) {
                case 'mongodb':
                    await resetMongoDb();
                    break;
                case 'mysql':
                    await resetMysqlDb();
                    break;
            }
        } catch (error) {
            loggerService.error('Error resetting test database: ' + error.message);
            throw error;
        }
    }
}
