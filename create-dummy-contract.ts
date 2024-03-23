import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const contractTypes = ns.codingcontract.getContractTypes();
  const contractType = await ns.prompt('Select the dummy coding contract to generate: ', {
    type: 'select',
    choices: contractTypes,
  });
  if (typeof contractType !== 'string') return;

  const hostname = ns.getHostname();
  const contractFile = ns.codingcontract.createDummyContract(contractType);
  ns.run('solve-contracts.js', 1, hostname, contractFile);
}
