import * as helpers from './shared.ts';

/** @param {NS} ns */
const self = 'auto-hack-controller.js';

function usableThreads(ns, hostname, script) {
  const freeRam = helpers.availableRam(ns, hostname);
  const scriptRam = ns.getScriptRam(script);
  return Math.floor(freeRam / scriptRam);
}

async function startHackController(ns, hostname, target, threadSplitter) {
  // ns.tprint('Starting hack controller for ', hostname, ' against ', target.hostname);
  while (ns.isRunning(helpers.weaken) || ns.isRunning(helpers.grow) || ns.isRunning(helpers.hack)) {
    await helpers.sleep(1000);
  }

  while (true) {
    const script = helpers.decideAction(ns, target);
    if (action == helpers.unhackable) return -1;

    let threads = usableThreads(ns, hostname, script);
    if (threadSplitter) {
      threads = Math.floor(threads / threadSplitter);
    }
    if (threads < 1) {
      threads = 1;
    }

    let pid = 0;
    try {
      pid = ns.exec(script, hostname, threads, target.hostname);
    } catch (error) {
      ns.tprint('Cannot hack ', hostname, '. Error: ', error);
      // ns.tprint(hostname, " details:", JSON.stringify(target, null, 2))
    }

    if (pid == 0) {
      await helpers.sleep(10000);
      return -1;
    }

    while (ns.isRunning(pid)) {
      await helpers.sleep(100);
    }
  }
}

export async function main(ns) {
  const hostname = ns.args[0];
  const target = JSON.parse(ns.args[1]);
  const threadSplitter = ns.args[2];

  helpers.uploadHackingFiles(ns, hostname);
  const controller = await startHackController(ns, hostname, target, threadSplitter);
  if (controller === -1) {
    await helpers.sleep(60_000);
    ns.args[3]++;
    ns.spawn(self, 1, ...ns.args);
  }
}
