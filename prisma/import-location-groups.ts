import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

type CsvRow = Record<string, string>;

type LocationGroupImportRow = {
  readonly groupName: string;
  readonly latitude: number;
  readonly longitude: number;
};

const prismaClient = new PrismaClient();

async function main(): Promise<void> {
  const commandArguments = process.argv.slice(2);
  const shouldReset = commandArguments.includes('--reset');
  const csvFilePath = commandArguments.find(commandArgument => !commandArgument.startsWith('--'));

  if (!csvFilePath) {
    throw new Error('CSVファイルのパスを指定してください。例: npm run import:location-groups -- "./data/location-groups.csv"');
  }

  const resolvedCsvFilePath = path.resolve(csvFilePath);

  if (!fs.existsSync(resolvedCsvFilePath)) {
    throw new Error(`CSVファイルが見つかりません: ${resolvedCsvFilePath}`);
  }

  const csvText = fs.readFileSync(resolvedCsvFilePath, 'utf8').replace(/^\uFEFF/, '');
  const csvRows = parseCsv(csvText);
  const importRows = toLocationGroupImportRows(csvRows);

  console.log(`CSV rows: ${csvRows.length}`);
  console.log(`Valid import rows: ${importRows.length}`);

  if (shouldReset) {
    await prismaClient.locationGroup.deleteMany();
    console.log('Existing LocationGroup rows were deleted.');
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const importRow of importRows) {
    const existingLocationGroup = await prismaClient.locationGroup.findFirst({
      where: {
        groupName: importRow.groupName,
        latitude: importRow.latitude,
        longitude: importRow.longitude
      }
    });

    if (existingLocationGroup) {
      skippedCount++;
      continue;
    }

    await prismaClient.locationGroup.create({
      data: {
        groupName: importRow.groupName,
        latitude: importRow.latitude,
        longitude: importRow.longitude,
        isActive: true
      }
    });

    insertedCount++;
  }

  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

function toLocationGroupImportRows(csvRows: readonly CsvRow[]): readonly LocationGroupImportRow[] {
  return csvRows.map((csvRow, rowIndex) => {
    const groupName = getRequiredValue(csvRow, 'Campfire Group Name', rowIndex);

    // 添付CSVのヘッダーは "Lng 緯度" / "Lat 経度" ですが、実データは
    // "Lng 緯度" 側が日本の緯度(例: 35.x)、"Lat 経度" 側が日本の経度(例: 139.x)として入っています。
    // そのため、DBの latitude には "Lng 緯度"、longitude には "Lat 経度" を入れます。
    const latitude = parseRequiredNumber(getRequiredValue(csvRow, 'Lng 緯度', rowIndex), 'Lng 緯度', rowIndex);
    const longitude = parseRequiredNumber(getRequiredValue(csvRow, 'Lat 経度', rowIndex), 'Lat 経度', rowIndex);

    return {
      groupName,
      latitude,
      longitude
    };
  });
}

function getRequiredValue(csvRow: CsvRow, columnName: string, rowIndex: number): string {
  const value = csvRow[columnName]?.trim();

  if (!value) {
    throw new Error(`CSV ${rowIndex + 2}行目: ${columnName} が空です。`);
  }

  return value;
}

function parseRequiredNumber(value: string, columnName: string, rowIndex: number): number {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`CSV ${rowIndex + 2}行目: ${columnName} が数値ではありません。value=${value}`);
  }

  return parsedValue;
}

function parseCsv(csvText: string): CsvRow[] {
  const records = parseCsvRecords(csvText);

  if (records.length === 0) {
    return [];
  }

  const headers = records[0].map(header => header.trim());

  return records.slice(1)
    .filter(record => record.some(value => value.trim().length > 0))
    .map(record => {
      const row: CsvRow = {};

      for (let index = 0; index < headers.length; index++) {
        row[headers[index]] = record[index] ?? '';
      }

      return row;
    });
}

function parseCsvRecords(csvText: string): string[][] {
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentValue = '';
  let isInsideQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const currentCharacter = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (currentCharacter === '"') {
      if (isInsideQuotes && nextCharacter === '"') {
        currentValue += '"';
        index++;
        continue;
      }

      isInsideQuotes = !isInsideQuotes;
      continue;
    }

    if (currentCharacter === ',' && !isInsideQuotes) {
      currentRecord.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((currentCharacter === '\n' || currentCharacter === '\r') && !isInsideQuotes) {
      if (currentCharacter === '\r' && nextCharacter === '\n') {
        index++;
      }

      currentRecord.push(currentValue);
      records.push(currentRecord);
      currentRecord = [];
      currentValue = '';
      continue;
    }

    currentValue += currentCharacter;
  }

  if (currentValue.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentValue);
    records.push(currentRecord);
  }

  return records;
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
