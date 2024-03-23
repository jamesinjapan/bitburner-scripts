import { sleep } from './shared.ts';
import { NS } from '@ns';

function leadingZeroes(pertubation: string) {
  return (
    (pertubation.length > 1 && pertubation[0] === '0') ||
    (pertubation.length > 2 && pertubation.substring(0, 2) === '00')
  );
}

async function pertubate(combinations: string[], input: string, prevOctets = ''): Promise<void> {
  if (input.length < 1) {
    if (prevOctets.split('.').length < 4) return;

    combinations.push(prevOctets.slice(0, -1));
    return;
  }
  if (prevOctets.split('.').length > 4) {
    return;
  }
  const pertubations = [input[0], input.substring(0, 2), input.substring(0, 3)];
  pertubations
    .filter((pertubation) => !leadingZeroes(pertubation) && parseInt(pertubation) <= 255)
    .forEach((pertubation) => {
      const newOctets = prevOctets + pertubation + '.';
      const remainingString = input.substring(pertubation.length);
      pertubate(combinations, remainingString, newOctets);
    });
}

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);
  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\"\d+\"/)) {
    return console.error('rawInput is not a string of numbers: ', rawInput);
  }
  const input = JSON.parse(rawInput);

  const combinations: string[] = [];
  await pertubate(combinations, input);
  const combinationsUniq = Array.from(new Set(combinations));
  localStorage.setItem(filename, JSON.stringify(combinationsUniq));
}
