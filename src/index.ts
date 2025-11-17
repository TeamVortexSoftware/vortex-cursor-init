#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import * as readline from 'readline';

async function main() {
  const command = process.argv[2];

  if (command === 'init') {
    await initVortexCursor();
  } else {
    console.log('Usage: npx @teamvortexsoftware/vortex-cursor init');
    process.exit(1);
  }
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function initVortexCursor() {
  const cwd = process.cwd();
  const templatesDir = path.join(__dirname, 'templates');
  const targetDir = path.join(cwd, '.cursor');

  console.log('🚀 Setting up Vortex AI integration for Cursor...\n');

  // Prompt for API key and component ID
  console.log('First, we need your Vortex credentials:\n');

  const apiKey = await promptUser('Vortex API Key (from https://admin.vortexsoftware.com/members/api-keys): ');
  if (!apiKey) {
    console.error('❌ API key is required');
    process.exit(1);
  }

  const componentId = await promptUser('Component ID (from https://admin.vortexsoftware.com): ');
  if (!componentId) {
    console.error('❌ Component ID is required');
    process.exit(1);
  }

  console.log('\n✅ Credentials received\n');

  // Create .cursor/prompts directory
  await fs.ensureDir(path.join(targetDir, 'prompts'));

  // Read the template
  const templateFile = path.join(templatesDir, 'integrate-vortex.md');
  let content = await fs.readFile(templateFile, 'utf-8');

  // Inject the API key and component ID into the template
  content = content.replaceAll('{{VORTEX_API_KEY}}', apiKey);
  content = content.replaceAll('{{VORTEX_COMPONENT_ID}}', componentId);

  // Write the customized prompt file
  const targetFile = path.join(targetDir, 'prompts', 'integrate-vortex.md');
  await fs.writeFile(targetFile, content);

  console.log('✅ Created .cursor/prompts/integrate-vortex.md\n');

  // Also add to .env if it exists (or create it)
  const envPath = path.join(cwd, '.env.local');
  const envExists = await fs.pathExists(envPath);

  let shouldUpdateEnv = true;
  if (envExists) {
    const existingEnv = await fs.readFile(envPath, 'utf-8');
    if (existingEnv.includes('VORTEX_API_KEY')) {
      const answer = await promptUser('\n.env.local already contains VORTEX_API_KEY. Overwrite? (y/N): ');
      shouldUpdateEnv = answer.toLowerCase() === 'y';
    }
  }

  if (shouldUpdateEnv) {
    const envContent = envExists ? await fs.readFile(envPath, 'utf-8') : '';
    const newEnvContent = envContent.includes('VORTEX_API_KEY')
      ? envContent.replace(/VORTEX_API_KEY=.*/g, `VORTEX_API_KEY=${apiKey}`)
      : `${envContent}\n# Vortex Configuration\nVORTEX_API_KEY=${apiKey}\n`;

    await fs.writeFile(envPath, newEnvContent);
    console.log('✅ Added VORTEX_API_KEY to .env.local\n');
  }

  console.log('🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('');
  console.log('📋 In Cursor, type:');
  console.log('   @integrate-vortex');
  console.log('');
  console.log('   Cursor will use your credentials and implement Vortex!\n');
  console.log('Your API key: ' + apiKey.substring(0, 20) + '...');
  console.log('Your Component ID: ' + componentId + '\n');

  console.log('💡 Tip: Cursor already has your API key and component ID.');
  console.log('   You can just focus on answering questions about your codebase.\n');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
