import * as path from 'path';
import * as fs from 'fs';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
    // Create the mocha test with spec reporter for console
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        reporter: 'spec'
    });

    const testsRoot = path.resolve(__dirname, '..');

    // Find test files
    const files = await glob('**/**.test.js', { cwd: testsRoot });

    // Add files to the test suite
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    // Run the mocha test
    return new Promise<void>((resolve, reject) => {
        try {
            const runner = mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });

            // Collect test results for JSON report
            const results: any = {
                stats: {},
                tests: [],
                passes: [],
                failures: [],
                pending: []
            };

            runner.on('pass', (test: any) => {
                const testResult = {
                    title: test.title,
                    fullTitle: test.fullTitle(),
                    duration: test.duration,
                    state: 'passed'
                };
                results.passes.push(testResult);
                results.tests.push(testResult);
            });

            runner.on('fail', (test: any, err: any) => {
                const testResult = {
                    title: test.title,
                    fullTitle: test.fullTitle(),
                    duration: test.duration,
                    state: 'failed',
                    error: err.message,
                    stack: err.stack
                };
                results.failures.push(testResult);
                results.tests.push(testResult);
            });

            runner.on('end', () => {
                results.stats = {
                    suites: runner.stats?.suites,
                    tests: runner.stats?.tests,
                    passes: runner.stats?.passes,
                    pending: runner.stats?.pending,
                    failures: runner.stats?.failures,
                    duration: runner.stats?.duration
                };

                // Write JSON report
                const reportPath = path.resolve(__dirname, '../../../test-results.json');
                try {
                    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
                    console.log(`\nTest report written to: ${reportPath}`);
                } catch (err) {
                    console.error('Failed to write test report:', err);
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}
