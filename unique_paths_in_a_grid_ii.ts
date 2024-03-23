import { NS } from '@ns';

const PATHS: string[] = [];
let ROW_COUNT: number;
let COLUMN_COUNT: number;
let FINISH: string;

function node(grid: number[][], x: number, y: number, pathToNow: string[]): void {
  if (`${x},${y}` === FINISH) {
    PATHS.push(pathToNow.join(','));
  }

  if (grid[x][y] === 1) return;

  const newX = x + 1;
  const newY = y + 1;
  if (grid[newX] && typeof grid[newX][y] === 'number') {
    const downPath = [...pathToNow, `${newX},${y}`];
    node(grid, newX, y, downPath);
  }
  if (typeof grid[x][newY] === 'number') {
    const rightPath = [...pathToNow, `${x},${newY}`];
    node(grid, x, newY, rightPath);
  }
}

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[[\[01,\]]*\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);

  const grid: number[][] = JSON.parse(rawInput);
  ROW_COUNT = grid.length;
  COLUMN_COUNT = grid[0].length;
  FINISH = `${ROW_COUNT - 1},${COLUMN_COUNT - 1}`;

  node(grid, 0, 0, ['0,0']);
  const answer = [...new Set(PATHS)].length;
  localStorage.setItem(filename, JSON.stringify(answer));
}
