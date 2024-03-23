import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[[\d+,]+\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);

  const input: number[] = JSON.parse(rawInput);
  let highest_profit: number = 0;

  for (let i = 0; i < input.length; i++) {
    const buy_price: number = input[i];
    const remaining_days: number[] = input.slice(i + 1);

    if (remaining_days.length < 1) {
      break;
    }

    const max_selling_price: number = Math.max(...remaining_days);
    const diff: number = max_selling_price - buy_price;

    if (diff > highest_profit) {
      highest_profit = diff;
    }
  }

  localStorage.setItem(filename, JSON.stringify(highest_profit));
}
