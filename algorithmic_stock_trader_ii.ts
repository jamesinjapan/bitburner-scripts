import { NS } from '@ns';

interface Memo {
  highestWhileHolding: number | null;
  highestWhileNot: number | null;
}

function getRightKey(holdingStock: boolean) {
  if (holdingStock) {
    return 'highestWhileHolding';
  } else {
    return 'highestWhileNot';
  }
}

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\[[\d+,]+\]/))
    return console.error('rawInput is not a stringified array: ', rawInput);
  const input: number[] = JSON.parse(rawInput);

  const memoized: Memo[] = Array.from(new Array(input.length + 1), function () {
    return {
      highestWhileHolding: null,
      highestWhileNot: null,
    };
  });

  function trade(currentIndex: number = 0, holdingStock: boolean = false, currentProfit: number = 0): void {
    console.log(`Params: ${currentIndex}, ${holdingStock}, ${currentProfit}`);

    const memo = memoized[currentIndex];
    console.log(`Memo for ${currentIndex}:`, JSON.stringify(memo));
    if (holdingStock) {
      if (!memo.highestWhileHolding || currentProfit > memo.highestWhileHolding) {
        memoized[currentIndex].highestWhileHolding = currentProfit;
      } else {
        return;
      }
    } else {
      if (!memo.highestWhileNot || currentProfit > memo.highestWhileNot) {
        memoized[currentIndex].highestWhileNot = currentProfit;
      } else {
        return;
      }
    }

    if (currentIndex >= input.length) return;

    if (holdingStock) {
      console.log(
        `Selling at ${currentIndex}: currentProfit = ${currentProfit} + ${input[currentIndex]} (${
          currentProfit + input[currentIndex]
        })`,
      );
      trade(currentIndex + 1, false, currentProfit + input[currentIndex]);
    } else {
      console.log(
        `Buying at ${currentIndex}: currentProfit = ${currentProfit} - ${input[currentIndex]} (${
          currentProfit - input[currentIndex]
        })`,
      );
      trade(currentIndex + 1, true, currentProfit - input[currentIndex]);
    }

    console.log(`Skipping at ${currentIndex}: currentProfit = ${currentProfit}`);
    trade(currentIndex + 1, holdingStock, currentProfit);
  }
  trade();

  let maxProfit = 0;
  const lastElement = memoized.pop();
  if (lastElement) {
    maxProfit = lastElement.highestWhileNot || 0;
  }

  localStorage.setItem(filename, JSON.stringify(maxProfit));
}
