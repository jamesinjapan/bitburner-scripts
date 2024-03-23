import * as helpers from './shared.ts';

import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const hostname = ns.args[0];
  const filename = ns.args[1];
  if (typeof hostname !== 'string' || typeof filename !== 'string') return;

  const inputData = ns.codingcontract.getData(filename, hostname);
  const triesLeft = ns.codingcontract.getNumTriesRemaining(filename, hostname);
  const contractType = ns.codingcontract.getContractType(filename, hostname);
  const solveScript = helpers.solvedContractTypes[contractType];
  if (!solveScript) {
    ns.tprint('This contract type is not solveable yet: ', contractType);
    return;
  }

  ns.tprint('Solving ', filename);
  ns.tprint('Contract Type: ', contractType);
  ns.tprint('Attempts Left: ', triesLeft);
  ns.tprint('Input: ', inputData);
  ns.run(solveScript, 1, filename, JSON.stringify(inputData));

  let waited = 0;
  let answer;
  while (waited < 10) {
    answer = localStorage.getItem(filename);
    if (answer) break;

    waited++;
    await helpers.sleep(1000);
  }

  ns.tprint('Answer: ', answer);
  if (typeof answer !== 'string') {
    ns.tprint(`Unexpected answer, rerun: run ${solveScript} ${filename} "${JSON.stringify(inputData)}"`);
    return;
  }

  const reward = ns.codingcontract.attempt(answer, filename, hostname);
  ns.tprint('Reward: ', reward);
}
