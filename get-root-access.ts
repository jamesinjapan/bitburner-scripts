import * as helpers from './shared.ts';

import { NS } from '@ns';

interface ProgramPortMap {
  filename: string;
  portKey: string;
  callableFn: Function;
}

function openPortsCount(target: helpers.Server): number {
  const ports = [target.sshPortOpen, target.ftpPortOpen, target.smtpPortOpen, target.httpPortOpen, target.sqlPortOpen];
  return ports.filter(Boolean).length;
}

function openRequiredPorts(ns: NS, target: helpers.Server): boolean {
  const requiredPorts = target.numOpenPortsRequired || ns.getServerNumPortsRequired(target.hostname);
  let openPorts = openPortsCount(target);
  // ns.tprint(`${target.hostname}: Required open ports: ${requiredPorts} Current open ports: ${openPorts}`)

  const programPortMap: ProgramPortMap[] = [
    { filename: 'BruteSSH.exe', portKey: 'sshPortOpen', callableFn: ns.brutessh },
    { filename: 'FTPCrack.exe', portKey: 'ftpPortOpen', callableFn: ns.ftpcrack },
    { filename: 'relaySMTP.exe', portKey: 'smtpPortOpen', callableFn: ns.relaysmtp },
    { filename: 'HTTPWorm.exe', portKey: 'httpPortOpen', callableFn: ns.httpworm },
    { filename: 'SQLInject.exe', portKey: 'sqlPortOpen', callableFn: ns.sqlinject },
  ];

  for (const map of programPortMap) {
    if (ns.fileExists(map.filename, 'home') && !target[map.portKey]) {
      map.callableFn(target.hostname);
      openPorts++;
    }

    if (openPorts >= requiredPorts) return true;
  }

  return false;
}

function getRootAccess(ns: NS, target: helpers.Server): boolean {
  const readyToNuke = openRequiredPorts(ns, target);
  if (!readyToNuke) return false;

  ns.tprint(target.hostname, ': Acquiring root access');
  ns.nuke(target.hostname);
  return true;
}

function canInstallBackdoor(server: helpers.Server, currentHackingLevel: number): boolean {
  if (!server.requiredHackingSkill) return false;

  return (
    !server.backdoorInstalled &&
    !server.purchasedByPlayer &&
    currentHackingLevel > server.requiredHackingSkill &&
    server.hasAdminRights
  );
}

export async function main(ns: NS): Promise<void> {
  let serverList: Record<string, helpers.Server> = {};
  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }

    const backdoorNotifications = [];
    const currentHackingLevel = ns.getHackingLevel();
    const serverList: Record<string, helpers.Server> = JSON.parse(serverListRaw);
    for (const hostname of Object.keys(serverList)) {
      const server = serverList[hostname];
      if (server.hasAdminRights && server.backdoorInstalled) continue;

      if (!server.hasAdminRights) {
        getRootAccess(ns, server);
      }

      if (canInstallBackdoor(server, currentHackingLevel)) {
        backdoorNotifications.push(server);
      }
    }

    localStorage.setItem('notificationsBackdoor', JSON.stringify(backdoorNotifications));
    await helpers.sleep(100);
  }
}
