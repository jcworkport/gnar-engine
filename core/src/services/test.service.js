import { loggerService } from "./logger.service.js";
import { resetMongoDb, resetMysqlDb, dbType } from '../db/db.js';
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

    // register prep function
    prep: (fn) => {
        testService.prepFns.push(fn);
    },

    // register test function
    run: (name, fn) => {
        testService.tests.push({ name, fn });
    },

    assert: assert,

    runCommandTests: async () => {
        console.log('==============================');
        console.log('Running command tests...');

        // find all test files in the tests directory
        const testFiles = fs.readdirSync(testService.testsDirectory)
            .filter(file => file.endsWith('.js'))
            .sort();

        for (const file of testFiles) {
            testService.prepFns = [];
            testService.tests = [];

            const fullPath = path.join(testService.testsDirectory, file);

            // import the test file (registers the tests)
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
                    await t.fn();
                    testService.testResults.push({ name: t.name, error: null });
                } catch (err) {
                    testService.failed++;
                    testService.testResults.push({ name: t.name, error: err });
                }
            }
        }

        // Summary
        console.table(testService.testResults.map(result => ({
            Test: result.name,
            Result: result.error ? `❌ Failed - ${result.error.message}` : '✅ Passed'
        })));

        if (testService.failed > 0) {
            console.error(`❌ Some Integration tests failed: ${testService.failed} error(s)`);
        } else {
            console.log('✅ All integration tests passed!');
        }

        // Reset test databases
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
