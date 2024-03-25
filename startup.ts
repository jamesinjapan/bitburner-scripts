import * as helpers from './shared.ts';

import { NS } from '@ns';

async function restart(ns: NS, script: string): Promise<void> {
  ns.scriptKill(script, 'home');
  ns.tprint(`[${helpers.timestamp()}] Running ${script}`);
  const process = ns.run(script);
  if (!process) ns.tprint("Couldn't run ", script);
  await helpers.sleep(100);
}

export async function main(ns: NS) {
  ns.tprint(`[${helpers.timestamp()}] Starting scripts.`);
  const flushLocalStorage = !!ns.args[0];
  if (flushLocalStorage) {
    ns.tprint(`[${helpers.timestamp()}] Flushing local storage.`);
    localStorage.clear();
  }

  helpers.addSidebarFunctions();

  ns.scriptKill('hack.js', 'home');
  ns.scriptKill('grow.js', 'home');
  ns.scriptKill('weaken.js', 'home');

  if (ns.fileExists('Formulas.exe')) {
    ns.scriptKill('hack-maximizer.js', 'home');
    await restart(ns, 'hack-orchestrator.js');
  } else {
    ns.scriptKill('hack-orchestrator.js', 'home');
    await restart(ns, 'hack-maximizer.js');
  }

  const scripts = [
    'grow-capabilities.js',
    'scan.js',
    'get-root-access.js',
    'infiltrate.js',
    'auto-infiltrate.js',
    'purchase-hack-nodes.js',
    'purchase-servers.js',
    'work-manager.js',
    'gang-manager.js',
    'overview.js',
    'server-list.js',
    'local-files.js',
    'contract-files.js',
    'extra-stats.js',
  ];
  for (const script of scripts) {
    await restart(ns, script);
  }

  ns.tprint(`[${helpers.timestamp()}] Startup complete.`);
}
