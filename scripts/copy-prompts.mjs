import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM 방식으로 __dirname과 __filename 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src', 'prompts');
const destDir = path.join(__dirname, '..', '.next', 'standalone', 'src', 'prompts');

async function copyFiles() {
  try {
    await fs.mkdir(destDir, { recursive: true });

    const files = await fs.readdir(srcDir);
    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      await fs.copyFile(srcFile, destFile);
    }
  } catch (error) {
    console.error('Failed to copy files:', error);
  }
}

copyFiles();
