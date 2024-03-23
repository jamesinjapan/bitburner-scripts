import * as helpers from './shared.ts';

import { NS } from '@ns';

export async function main(ns: NS) {
  const playerData = {};
  let serverData: Record<string, helpers.ServerFull> = {};
  let targets = [];

  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }

    serverData = { ...serverData, ...JSON.parse(serverListRaw) };
    targets = Object.keys(serverData).sort((a, b) => serverData[b].score - serverData[a].score);

    for (const hostname of Object.keys(serverData)) {
      const server = serverData[hostname];
      let target;
      if (helpers.cannotTarget(ns, server)) {
        target = targets[Math.floor(Math.random() * 10)];
      } else {
        target = hostname;
      }
      const freeRam = helpers.availableRam(ns, server.hostname);
      const action = helpers.decideAction(ns, serverData[target]);
      if (action == helpers.unhackable) continue;

      if (freeRam > ns.getScriptRam(action)) {
        if (!ns.fileExists(action, server.hostname)) {
          helpers.uploadHackingFiles(ns, server.hostname);
        }
        const threads = helpers.usableThreads(ns, server.hostname, action);
        ns.exec(action, server.hostname, threads, target);
      }
    }
    await helpers.sleep(10);
  }
}
