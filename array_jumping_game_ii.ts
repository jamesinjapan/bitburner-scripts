import { NS } from '@ns';

function doJump(
  input: number[],
  cache: [number, number][],
  min_jumps: number[],
  current_index: number,
  jump_count: number,
): void {
  if (cache.some(([index, count]) => index === current_index && count === jump_count)) {
    return;
  }
  cache.push([current_index, jump_count]);
  if (current_index === input.length - 1) {
    min_jumps.push(jump_count);
    return;
  }
  if (current_index > input.length - 1) {
    return;
  }
  const max_jump: number = input[current_index];
  for (let thisJump = 0; thisJump <= max_jump; thisJump++) {
    if (thisJump === 0) {
      continue;
    }
    doJump(input, cache, min_jumps, current_index + thisJump, jump_count + 1);
  }
}

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[[\d+,]+\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);

  const input: number[] = JSON.parse(rawInput);
  const min_jumps: number[] = [];
  if (input[0] === 0) {
    min_jumps.push(0);
    return;
  }
  const cache: [number, number][] = [];
  doJump(input, cache, min_jumps, 0, 0);
  localStorage.setItem(filename, JSON.stringify(Math.min(...min_jumps)));
}
