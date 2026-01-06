// control/commands.js
import { Command, Option } from 'commander';
import { profiles } from '../profiles/profiles.client.js';
import { up, down } from './dev.service.js';
import path from 'path';

export function registerDevCommands(program) {
	const devCmd = new Command('dev').description('🛠️  Start Gnar Engine Development Environment');

	devCmd
		.command('up')
		.description('🛠️  Up Development Containers')
		.option('-b, --build', 'Build without cache')
        .option('-d, --detach', 'Run containers in background')
        .option('-t --test', 'Run the tests with ephemeral databases')
        .option('--test-service <service>', 'Run the tests for the specified service with ephemeral databases (e.g. --test-service user)')
        .addOption(new Option('--core-dev').hideHelp())
        .action(async (options) => {
			let response = {};

			// Get active profile directory
			const { profile: activeProfile } = profiles.getActiveProfile();

			if (!activeProfile) {
				response.error = 'No active profile found';
				return;
			}

			// Change to the active profile directory
			const projectDir = activeProfile.PROJECT_DIR;

            if (options.testService) {
                options.test = true;
            }

			try {
				up({
                    projectDir: projectDir,
                    build: options.build || false,
                    detach: options.detach || false,
                    coreDev: options.coreDev || false,
                    test: options.test || false,
                    testService: options.testService || ''
                 });
			} catch (err) {
				console.error("❌ Error running containers:", err.message);
				process.exit(1);
			}
		});

    devCmd
        .command('down')
        .description('🛠️  Down Development Containers')
        .option('-a, --all-containers', 'Stop all running containers (not just Gnar Engine ones)')
        .action(async (options) => {
            // Get active profile directory
            const { profile: activeProfile } = profiles.getActiveProfile();

            if (!activeProfile) {
                console.error('No active profile found');
                return;
            }

            // Change to the active profile directory
            const projectDir = activeProfile.PROJECT_DIR;

            try {
				down({
                    projectDir: projectDir,
                    allContainers: options.allContainers || false 
                });
			} catch (err) {
				console.error("❌ Error running containers:", err.message);
				process.exit(1);
			}
        });

	program.addCommand(devCmd);
}
