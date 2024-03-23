import * as helpers from './shared.ts';

import { NS } from '@ns';

function fillServerDetails(ns: NS, hostname: string, parents: string[], children: string[]): helpers.ServerFull {
  const serverDetails = ns.getServer(hostname);
  return {
    hostname: hostname,
    parents: parents,
    children: children,
    ip: serverDetails.ip,
    sshPortOpen: serverDetails.sshPortOpen,
    ftpPortOpen: serverDetails.ftpPortOpen,
    smtpPortOpen: serverDetails.smtpPortOpen,
    httpPortOpen: serverDetails.httpPortOpen,
    sqlPortOpen: serverDetails.sqlPortOpen,
    hasAdminRights: serverDetails.hasAdminRights,
    cpuCores: serverDetails.cpuCores,
    isConnectedTo: serverDetails.isConnectedTo,
    ramUsed: serverDetails.ramUsed,
    maxRam: serverDetails.maxRam,
    organizationName: serverDetails.organizationName,
    purchasedByPlayer: serverDetails.purchasedByPlayer,
    backdoorInstalled: serverDetails.backdoorInstalled || false,
    baseDifficulty: serverDetails.baseDifficulty || 0,
    hackDifficulty: serverDetails.hackDifficulty || 0,
    minDifficulty: serverDetails.minDifficulty || 0,
    moneyAvailable: serverDetails.moneyAvailable || 0,
    moneyMax: serverDetails.moneyMax || 0,
    numOpenPortsRequired: serverDetails.numOpenPortsRequired || 0,
    openPortCount: serverDetails.openPortCount || 0,
    requiredHackingSkill: serverDetails.requiredHackingSkill || 0,
    serverGrowth: serverDetails.serverGrowth || 0,
    score: helpers.getTargetScore(ns, serverDetails),
  };
}

function scan(
  ns: NS,
  serverList: Record<string, helpers.ServerFull>,
  hostname: string = 'home',
  parents: string[] = [],
): void {
  const children = ns.scan(hostname).filter((child) => !parents.includes(child));
  const serverDetails = (serverList[hostname] = fillServerDetails(ns, hostname, parents, children));

  const newParents = [...parents, hostname];
  for (const child of children) {
    scan(ns, serverList, child, newParents);
  }
}

export async function main(ns: NS) {
  const serverList = {};
  while (true) {
    scan(ns, serverList);
    localStorage.setItem('serverListData', JSON.stringify(serverList));
    await helpers.sleep(10);
  }
}
