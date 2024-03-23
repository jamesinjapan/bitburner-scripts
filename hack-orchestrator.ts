import * as helpers from './shared.ts';

import { NS } from '@ns';

const playerData = {};
let serverData: Record<string, helpers.ServerFull> = {};
let targets: string[] = [];
let vectors: string[] = [];

function grow(
  ns: NS,
  targetData: helpers.ServerFull,
  vectorData: helpers.ServerFull,
  threadsLeft: number | undefined,
): number {
  const threadsNeeded = Math.ceil(
    threadsLeft ||
      ns.formulas.hacking.growThreads(targetData, ns.getPlayer(), targetData.moneyMax, vectorData.cpuCores),
  );
  const threadsAvailable = helpers.usableThreads(ns, vectorData.hostname, helpers.grow);
  const threadsToUse = Math.floor(Math.min(threadsNeeded, threadsAvailable));
  console.debug(
    `Grow ${targetData.hostname} from ${vectorData.hostname} -- money available: ${helpers.prettyCurrency(
      targetData.moneyAvailable,
    )}  max: ${helpers.prettyCurrency(targetData.moneyMax)}  diff: ${helpers.prettyCurrency(
      targetData.moneyMax - targetData.moneyAvailable,
    )}  Threads needed to grow to max money: ${threadsNeeded}  Threads available on vector: ${threadsAvailable}  diff: ${
      threadsNeeded - threadsAvailable
    }`,
  );
  ns.exec(helpers.grow, vectorData.hostname, threadsToUse, targetData.hostname);
  return threadsNeeded - threadsToUse;
}

function weaken(
  ns: NS,
  targetData: helpers.ServerFull,
  vectorData: helpers.ServerFull,
  threadsLeft: number | undefined,
): number {
  const weakenTime = ns.formulas.hacking.weakenTime(targetData, ns.getPlayer());
  const threadsNeeded = Math.ceil(threadsLeft || (targetData.hackDifficulty - targetData.minDifficulty) / 0.05);
  const threadsAvailable = helpers.usableThreads(ns, vectorData.hostname, helpers.weaken);
  const threadsToUse = Math.floor(Math.min(threadsNeeded, threadsAvailable));
  console.debug(
    `Weaken ${targetData.hostname} from ${vectorData.hostname} -- current security: ${targetData.hackDifficulty.toFixed(
      0,
    )}  min: ${targetData.minDifficulty.toFixed(0)}  diff: ${(
      targetData.hackDifficulty - targetData.minDifficulty
    ).toFixed(0)}  Time needed to weaken ${targetData.hostname}: ${helpers.timeConversion(
      weakenTime,
    )}  Threads needed to hack max money: ${threadsNeeded}  Threads available on vector: ${threadsAvailable}`,
  );
  ns.exec(helpers.weaken, vectorData.hostname, threadsAvailable, targetData.hostname);
  return threadsNeeded - threadsToUse;
}

function hack(
  ns: NS,
  targetData: helpers.ServerFull,
  vectorData: helpers.ServerFull,
  threadsLeft: number | undefined,
): number {
  const hackTime = ns.formulas.hacking.hackTime(targetData, ns.getPlayer());
  const threadsNeeded = Math.ceil(
    threadsLeft ||
      ns.hackAnalyzeThreads(targetData.hostname, targetData.moneyMax) * (1 / ns.hackAnalyzeChance(targetData.hostname)),
  );
  const threadsAvailable = helpers.usableThreads(ns, vectorData.hostname, helpers.hack);
  const threadsToUse = Math.floor(Math.min(threadsNeeded, threadsAvailable));
  console.debug(
    `Hack ${targetData.hostname} from ${vectorData.hostname}  Time needed to hack: ${helpers.timeConversion(
      hackTime,
    )}  Threads needed to hack max money: ${threadsNeeded}  Threads available on vector: ${threadsAvailable}  diff: ${
      threadsNeeded - threadsAvailable
    }`,
  );
  ns.exec(helpers.hack, vectorData.hostname, threadsToUse, targetData.hostname);
  return threadsNeeded - threadsToUse;
}

export async function main(ns: NS) {
  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }

    serverData = { ...serverData, ...JSON.parse(serverListRaw) };
    targets = Object.keys(serverData).sort((a, b) => serverData[b].score - serverData[a].score);
    vectors = Object.keys(serverData).sort((a, b) => serverData[b].maxRam - serverData[a].maxRam);

    for (const target of targets) {
      const ttlKey = `hackLock${target}`;
      const cooldown: number = Number(localStorage.getItem(ttlKey));
      if (new Date().getTime() > cooldown) {
        localStorage.removeItem(ttlKey);
      } else if (cooldown) {
        continue;
      }

      let threadsLeft;
      let action;
      let timeNeeded = 0;
      for (const vector of vectors) {
        helpers.uploadHackingFiles(ns, vector);
        const targetData = serverData[target];
        const vectorData = serverData[vector];

        if (helpers.cannotTarget(ns, targetData)) continue;

        if (helpers.availableRam(ns, vector) < helpers.requiredRamToHack(ns)) {
          continue;
        }

        targetData.moneyAvailable = ns.getServerMoneyAvailable(target);
        targetData.hackDifficulty = ns.getServerSecurityLevel(target);

        switch (action || helpers.decideAction(ns, targetData)) {
          case helpers.grow:
            threadsLeft = grow(ns, targetData, vectorData, threadsLeft);
            action = helpers.grow;
            timeNeeded = ns.formulas.hacking.growTime(targetData, ns.getPlayer());
            break;
          case helpers.weaken:
            threadsLeft = weaken(ns, targetData, vectorData, threadsLeft);
            action = helpers.weaken;
            timeNeeded = ns.formulas.hacking.weakenTime(targetData, ns.getPlayer());
            break;
          case helpers.hack:
            threadsLeft = hack(ns, targetData, vectorData, threadsLeft);
            action = helpers.hack;
            timeNeeded = ns.formulas.hacking.hackTime(targetData, ns.getPlayer());
            break;
          default:
            console.debug(`Cannot target ${target} from ${vector}: ${action}`);
        }

        if (threadsLeft == 0) break;
      }

      if (threadsLeft == 0) {
        const unlockAt = String(new Date().getTime() + timeNeeded);
        localStorage.setItem(ttlKey, unlockAt);
      }
    }

    await helpers.sleep(10);
  }
}
