import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const filename = ns.args[0];
  if (typeof filename != 'string') return console.error('filename is not a string: ', filename);

  const rawInput = ns.args[1];
  if (typeof rawInput != 'string' || !rawInput.match(/\["[A-Z ]+",\s?"[A-Z ]+"\]/)) {
    return console.error('rawInput is not a stringified array: ', rawInput);
  }
  const base_alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const vigenereSquare = [];
  for (let i = 0; i < base_alphabet.length; i++) {
    const shifted_alphabet: string = base_alphabet.slice(i) + base_alphabet.slice(0, i);
    vigenereSquare.push(shifted_alphabet);
  }

  const [plaintext, keyword]: [string, string] = JSON.parse(rawInput);
  const ciphertext: string[] = [];
  let keywordIndex = 0;
  let plaintextIndex = 0;
  while (true) {
    const plaintextLetter = plaintext[plaintextIndex];
    const plaintextLookup = base_alphabet.split('').indexOf(plaintextLetter);
    const keywordLetter = keyword[keywordIndex];
    const keywordLookup = base_alphabet.split('').indexOf(keywordLetter);
    ciphertext.push(vigenereSquare[plaintextLookup][keywordLookup]);

    plaintextIndex++;
    if (plaintextIndex >= plaintext.length) {
      break;
    }
    keywordIndex++;
    if (keywordIndex >= keyword.length) {
      keywordIndex = 0;
    }
  }

  localStorage.setItem(filename, ciphertext.join(''));
}
