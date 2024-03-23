import { NS } from '@ns';

const PATHS: string[] = [];
let ROW_COUNT: number;
let COLUMN_COUNT: number;
let FINISH: string;

function setupGrid(): string[][] {
  const grid: string[][] = [];
  for (let x = 0; x < ROW_COUNT; x++) {
    const row: string[] = [];
    for (let y = 0; y < COLUMN_COUNT; y++) {
      row.push(`${x},${y}`);
    }
    grid.push(row);
  }
  return grid;
}

function node(grid: string[][], x: number, y: number, pathToNow: string[]): void {
  if (grid[x][y] === FINISH) {
    PATHS.push(pathToNow.join(','));
  }
  const newX = x + 1;
  const newY = y + 1;
  if (grid[newX] && grid[newX][y]) {
    const downPath = [...pathToNow, `${newX},${y}`];
    node(grid, newX, y, downPath);
  }
  if (grid[x][newY]) {
    const rightPath = [...pathToNow, `${x},${newY}`];
    node(grid, x, newY, rightPath);
  }
}

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[\d+,\d+\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);

  [ROW_COUNT, COLUMN_COUNT] = JSON.parse(rawInput);
  FINISH = `${ROW_COUNT - 1},${COLUMN_COUNT - 1}`;

  const grid: string[][] = setupGrid();
  node(grid, 0, 0, ['0,0']);
  const answer = [...new Set(PATHS)].length;
  localStorage.setItem(filename, JSON.stringify(answer));
}
