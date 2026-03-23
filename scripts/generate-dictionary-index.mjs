import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'DictionaryData-master');
const outputDir = path.join(projectRoot, 'src', 'public', 'data');
const outputFile = path.join(outputDir, 'dictionary-index.json');

const normalizeWord = (value) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const cleanText = (value) => value.trim().replace(/\s+/g, ' ');

const splitTranslation = (value) =>
  value
    .split(/[;；]+/g)
    .map((item) => cleanText(item))
    .filter(Boolean);

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const readDelimitedFile = async (filePath, delimiter, onRow) => {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const reader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let headers = null;

  for await (const line of reader) {
    if (!line) {
      continue;
    }

    if (!headers) {
      headers = line.split(delimiter);
      continue;
    }

    const rawValues = line.split(delimiter);
    const row = Object.fromEntries(headers.map((header, index) => [header, rawValues[index] ?? '']));
    onRow(row);
  }
};

const readCsvFile = async (filePath, onRow) => {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const reader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let headers = null;

  for await (const line of reader) {
    if (!line) {
      continue;
    }

    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    const rawValues = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, rawValues[index] ?? '']));
    onRow(row);
  }
};

const run = async () => {
  const wordMeta = new Map();
  const index = {};

  await readDelimitedFile(path.join(sourceDir, 'word.csv'), '>', (row) => {
    const word = cleanText(row.vc_vocabulary ?? '');
    const normalized = normalizeWord(word);
    if (!normalized) {
      return;
    }

    wordMeta.set(normalized, {
      us: cleanText(row.vc_phonetic_us ?? ''),
      uk: cleanText(row.vc_phonetic_uk ?? '')
    });
  });

  await readCsvFile(path.join(sourceDir, 'word_translation.csv'), (row) => {
    const word = cleanText(row.word ?? '');
    const normalized = normalizeWord(word);
    const translation = cleanText(row.translation ?? '');

    if (!normalized || !translation) {
      return;
    }

    const explains = splitTranslation(translation);
    if (explains.length === 0) {
      return;
    }

    const meta = wordMeta.get(normalized);
    index[normalized] = {
      e: explains,
      ...(meta?.us ? { us: meta.us } : {}),
      ...(meta?.uk ? { uk: meta.uk } : {})
    };
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(index));
  console.log(`Generated ${Object.keys(index).length} entries -> ${path.relative(projectRoot, outputFile)}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
