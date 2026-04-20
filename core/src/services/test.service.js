import { loggerService } from "./logger.service.js";
import { resetMongoDb, resetMysqlDb, dbType, resetAllMysqlTables } from '../db/db.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

/**
 * Run tests
 */
export const testService = {
    testsDirectory: `${process.env.GLOBAL_SERVICE_BASE_DIR}/tests`,
    failed: 0,
    beforeEachFns: [],
    afterEachFns: [],
    tests: [],
    testResults: [],

    // register beforeEach function
    beforeEach: (fn) => {
        testService.beforeEachFns.push(fn);
    },

    // register test function
    run: (name, fn) => {
        testService.tests.push({ name, fn });
    },

    // register afterEach function
    afterEach: (fn) => {
        testService.afterEachFns.push(fn);
    },

    assert: assert,

    runCommandTests: async ({ config }) => {
        console.log('==============================');
        console.log('Running command tests...');

        testService.testsDirectory += `/${config.runTests || 'ephemeral'}`;

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

            // Foreach test
            let testNum = 0;
            for (const t of testService.tests) {
                testNum++;

                // Run beforeEach prep functions
                for (const fn of testService.beforeEachFns) {
                    try {
                        await fn();
                    } catch (err) {
                        testService.failed++;
                        console.error(`❌ Test preparation failed - ${err.message}`);
                        break;
                    }
                }

                // run test
                try {
                    await t.fn();
                    testService.testResults.push({ name: t.name, error: null });
                } catch (err) {
                    testService.failed++;
                    testService.testResults.push({ name: t.name, error: err });
                }

                // Run afterEach tidy up functions
                for (const fn of testService.afterEachFns) {
                    try {
                        await fn();
                    } catch (err) {
                        testService.failed++;
                        console.error(`❌ Test tidy up failed - ${err.message}`);
                        break;
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
    }
}
