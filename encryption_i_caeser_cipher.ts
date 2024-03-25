import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\["[A-Z ]+",\s?\d+\]/)) {
    return console.error('rawInput is not a stringified array: ', rawInput);
  }
  const base_alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const [plaintext, left_shift]: [string, number] = JSON.parse(rawInput);
  const shifted_alphabet: string = base_alphabet.slice(left_shift) + base_alphabet.slice(0, left_shift);
  const words: string[] = plaintext.split(' ');
  const ciphertext: string[] = [];
  words.forEach((word: string) => {
    const ciphertext_word: string[] = [];
    word.split('').forEach((letter: string) => {
      const index: number = shifted_alphabet.indexOf(letter);
      ciphertext_word.push(base_alphabet[index]);
    });
    ciphertext.push(ciphertext_word.join(''));
  });
  localStorage.setItem(filename, ciphertext.join(' '));
}
