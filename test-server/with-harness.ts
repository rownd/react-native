import { spawn } from 'node:child_process';
import { startIntegrationHarness } from '../../supertokens-rownd-android/test-server/server';

process.on('unhandledRejection', (reason) => {
  if (
    reason instanceof Error &&
    reason.message.startsWith('Failed to fetch app config')
  ) {
    return;
  }
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

function parseCommand() {
  const separatorIndex = process.argv.indexOf('--');
  const command =
    separatorIndex === -1
      ? process.argv.slice(2)
      : process.argv.slice(separatorIndex + 1);

  if (command.length === 0) {
    throw new Error(
      'Usage: tsx test-server/with-harness.ts -- <command> [args...]'
    );
  }

  return command;
}

async function main() {
  const [command, ...args] = parseCommand();
  const harness = await startIntegrationHarness();

  console.log('React Native integration harness ready');
  console.log(`  host:    ${harness.serverUrl}`);
  console.log(`  android: ${harness.androidUrl}`);
  console.log(`  public:  ${harness.publicUrl}`);
  console.log(`  hub:     ${harness.hubUrl}`);

  try {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        HARNESS_URL: process.env.HARNESS_URL || harness.serverUrl,
        ANDROID_HARNESS_URL:
          process.env.ANDROID_HARNESS_URL || harness.androidUrl,
        ANDROID_API_URL: process.env.ANDROID_API_URL || harness.androidUrl,
        ANDROID_HUB_URL: process.env.ANDROID_HUB_URL || harness.hubUrl,
        ANDROID_APP_KEY: process.env.ANDROID_APP_KEY || harness.appKey,
      },
    });

    const exitCode = await new Promise<number>((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (code, signal) => {
        if (signal) {
          console.error(`Command terminated by signal ${signal}`);
          resolve(1);
          return;
        }

        resolve(code ?? 1);
      });
    });

    process.exitCode = exitCode;
  } finally {
    await harness.stop();
  }
}

main().catch((error) => {
  console.error(
    'Failed to run command with React Native integration harness',
    error
  );
  process.exit(1);
});
