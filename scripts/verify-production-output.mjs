import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';

const projectDirectory = resolve(import.meta.dirname, '..');
const outputDirectory = resolve(projectDirectory, 'dist');

const forbiddenPathPatterns = [
  /mockserviceworker/i,
  /(^|[\\/])mocks?([\\/]|$)/i,
  /(^|[\\/])fixtures?([\\/]|$)/i,
];

const forbiddenContentMarkers = [
  'mockServiceWorker',
  'setupWorker',
  'Mock Service Worker',
  'mswjs.io',
  'x-msw-scenario',
  '/fixtures/products/',
  'src/mocks',
];

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.xml']);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function verifyProductionOutput() {
  const outputStats = await stat(outputDirectory).catch(() => undefined);

  if (!outputStats?.isDirectory()) {
    throw new Error('Production output dist/ не найден. Сначала выполните npm run build.');
  }

  const files = await collectFiles(outputDirectory);
  const violations = [];

  for (const file of files) {
    const relativePath = relative(outputDirectory, file);

    if (forbiddenPathPatterns.some((pattern) => pattern.test(relativePath))) {
      violations.push(`${relativePath}: запрещённое имя файла или каталога`);
    }

    if (!textExtensions.has(extname(file).toLowerCase())) {
      continue;
    }

    const content = await readFile(file, 'utf8');

    for (const marker of forbiddenContentMarkers) {
      if (content.includes(marker)) {
        violations.push(`${relativePath}: найден маркер ${JSON.stringify(marker)}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Production output содержит MSW, handlers или fixtures:\n${violations.join('\n')}`,
    );
  }

  process.stdout.write(
    `Production output проверен: ${String(files.length)} файлов, MSW/handlers/fixtures не найдены.\n`,
  );
}

await verifyProductionOutput();
