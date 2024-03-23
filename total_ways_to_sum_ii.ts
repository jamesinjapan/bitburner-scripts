import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[[\d+,]+\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);

  const input = JSON.parse(rawInput);
  const numberSet: number[] = input[1];
  numberSet.sort();
  const goal: number = input[0];
  const countCombinations = (numberSet: number[], goal: number): number => {
    const dp: number[] = Array(goal + 1).fill(0);
    dp[0] = 1;
    numberSet.forEach((num: number) => {
      for (let j = num; j <= goal; j++) {
        dp[j] += dp[j - num];
      }
    });
    return dp[goal];
  };
  const combinations = countCombinations(numberSet, goal);
  localStorage.setItem(filename, JSON.stringify(combinations));
}
