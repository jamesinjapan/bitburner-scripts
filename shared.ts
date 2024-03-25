import { NS } from '@ns';
import { Server } from '../NetscriptDefinitions';
import { createSidebarItem } from './box.js';

/**
 * Shared Types
 */

export interface ServerFull {
  hostname: string;
  parents: string[];
  children?: string[];
  ip: string;
  sshPortOpen: boolean;
  ftpPortOpen: boolean;
  smtpPortOpen: boolean;
  httpPortOpen: boolean;
  sqlPortOpen: boolean;
  hasAdminRights: boolean;
  cpuCores: number;
  isConnectedTo: boolean;
  ramUsed: number;
  maxRam: number;
  organizationName: string;
  purchasedByPlayer: boolean;
  backdoorInstalled: boolean;
  baseDifficulty: number;
  hackDifficulty: number;
  minDifficulty: number;
  moneyAvailable: number;
  moneyMax: number;
  numOpenPortsRequired: number;
  openPortCount: number;
  requiredHackingSkill: number;
  serverGrowth: number;
  score: number;
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Shared Constants
 */

export const hack = 'hack.js';
export const grow = 'grow.js';
export const weaken = 'weaken.js';
export const unhackable = 'unhackable';
export const solvedContractTypes: Record<string, string> = {
  'Algorithmic Stock Trader I': 'algorithmic_stock_trader_i.js',
  'Algorithmic Stock Trader II': 'algorithmic_stock_trader_ii.js',
  'Array Jumping Game II': 'array_jumping_game_ii.js',
  'Encryption I: Caesar Cipher': 'encryption_i_caeser_cipher.js',
  'Encryption II: Vigenère Cipher': 'encryption_ii_vigenere_cipher.js',
  'Generate IP Addresses': 'generate_ip_addresses.js',
  'Total Ways to Sum II': 'total_ways_to_sum_ii.js',
  'Unique Paths in a Grid I': 'unique_paths_in_a_grid_i.js',
  'Unique Paths in a Grid II': 'unique_paths_in_a_grid_ii.js',
};

/**
 * Shared formatting
 */

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function prettyCurrency(number: number): string {
  return USDollar.format(number);
}

const BigNumber = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function prettyNumber(number: number): string {
  return BigNumber.format(number);
}

/**
 * Shared Utilty Functions
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timestamp(): string {
  return new Date().toLocaleTimeString('en-gb');
}

export function timeConversion(millisec: number): string {
  var seconds = millisec / 1000;
  var minutes = millisec / (1000 * 60);
  var hours = millisec / (1000 * 60 * 60);
  var days = millisec / (1000 * 60 * 60 * 24);

  if (seconds < 60) {
    return `${seconds.toFixed(1)} secs`;
  } else if (minutes < 60) {
    return `${minutes.toFixed(1)} mins`;
  } else if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  } else {
    return `${days.toFixed(1)} days`;
  }
}

export function formatGigabytes(gigabytes: number): string {
  if (gigabytes == 0) return '0GB';
  var k = 1024,
    sizes = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(gigabytes) / Math.log(k));
  return parseFloat((gigabytes / Math.pow(k, i)).toFixed(0)) + sizes[i];
}

export function alphanumericOnly(string: string): string {
  return string.replace(/[^A-Za-z0-9]/g, '-');
}

/**
 * Shared Hacking Functions
 */

export function uploadHackingFiles(ns: NS, hostname: string): void {
  ns.scp(hack, hostname, 'home');
  ns.scp(grow, hostname, 'home');
  ns.scp(weaken, hostname, 'home');
}

export function cannotTarget(ns: NS, server: ServerFull | Server): boolean {
  const currentHackingLevel = ns.getHackingLevel();
  return (
    server.hostname == 'home' ||
    server.purchasedByPlayer ||
    !server.moneyMax ||
    server.moneyMax < 1 ||
    !server.requiredHackingSkill ||
    server.requiredHackingSkill > currentHackingLevel
  );
}

export function getTargetScore(ns: NS, server: Server): number {
  const currentHackingLevel = ns.getHackingLevel();
  if (!server.moneyMax || !server.requiredHackingSkill || !server.minDifficulty) return 0;
  if (cannotTarget(ns, server)) return 0;

  return (
    (server.moneyMax / server.minDifficulty) *
    Math.log2(Math.abs(server.requiredHackingSkill + 2 - currentHackingLevel))
  );
}

export function availableRam(ns: NS, hostname: string): number {
  const maxRam = ns.getServerMaxRam(hostname);
  const usedRam = ns.getServerUsedRam(hostname);
  const buffer = hostname == 'home' ? 128 : 0;
  return maxRam - usedRam - buffer;
}

export function decideAction(ns: NS, server: ServerFull): string {
  if (!server.moneyMax || !server.requiredHackingSkill || !server.minDifficulty || !server.hasAdminRights) {
    return unhackable;
  }
  const moneyMax = server.moneyMax;
  const minDifficulty = server.minDifficulty;
  const currentSecurity = ns.getServerSecurityLevel(server.hostname);
  const currentMoney = ns.getServerMoneyAvailable(server.hostname);

  if (currentSecurity > minDifficulty) {
    return weaken;
  } else if (currentMoney < moneyMax) {
    return grow;
  } else {
    return hack;
  }
}

export function usableThreads(ns: NS, hostname: string, script: string): number {
  const freeRam = availableRam(ns, hostname);
  const scriptRam = ns.getScriptRam(script);
  return Math.floor(freeRam / scriptRam);
}

export function requiredRamToHack(ns: NS): number {
  return Math.max(ns.getScriptRam(grow), ns.getScriptRam(weaken), ns.getScriptRam(hack));
}

/**
 * Shared sidebar functions
 */

export function initialBoxHTML(id: string): string {
  return `<div id="${id}" class="custom-box-container"></div>`;
}

export function autoResizeBox(id: string): void {
  const doc = eval('document');
  const node = doc.getElementById(id);
  const container = node.parentNode.parentNode;
  container.style.height = '';
  container.style.height = `${container.style.offsetHeight} px`;
}

export function removeOldBox(id: string): void {
  const doc = eval('document');
  const box = doc.getElementById(id);
  if (box) {
    box.parentNode.parentNode.remove();
  }
}

export function runTerminalCommand(cmd: string) {
  const doc = eval('document');
  const terminalInput = doc.getElementById('terminal-input');
  terminalInput.value = `${cmd}`;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}

export function removeParent(element: HTMLElement): void {
  const parent = element.parentNode as HTMLElement;
  parent.remove();
}

export function addSidebarFunctions() {
  const doc = eval('document');
  const id = 'sharedScripts';
  const existingElement = doc.getElementById(id);
  if (existingElement) return false;

  const node = doc.getElementsByTagName('head')[0];
  const html = [`<script id=${id}>`, runTerminalCommand.toString(), removeParent.toString(), '</script>'];
  const range = new Range().createContextualFragment(html.join('\n')).firstElementChild;
  node.appendChild(range);
}

export function updateBoxTitle(id: string, title: string, value: number): void {
  const doc = eval('document');
  const box = doc.getElementById(id);
  box.parentNode.parentNode.getElementsByClassName('title')[0].innerHTML = `${title} (${value})`;
}

export function refreshBox(
  boxId: string,
  boxTitle: string,
  boxIcon: string,
  boxPosition: number,
  boxClasses: string,
): void {
  const doc = eval('document');
  const box = doc.getElementById(boxId);
  let currentClasses;
  if (box) {
    const existingClasses: string[] = box.parentNode.parentNode.className.split(' ');
    currentClasses = existingClasses.filter((existingClass) => existingClass != 'sbitem').join(' ');
  } else {
    currentClasses = boxClasses;
  }
  removeOldBox(boxId);
  createSidebarItem(boxTitle, initialBoxHTML(boxId), boxIcon, `custom-box-${boxPosition - 1}`, boxClasses);
  autoResizeBox(boxId);
}
