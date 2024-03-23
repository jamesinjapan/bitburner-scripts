import * as helpers from './shared.ts';

/** @param {NS} ns */

const SHORT_SLEEP = 10;
const NO_TARGET = 'none';
let TARGET;
let currentState;
let currentHackingLevel;
let startTime;
let serverList;

const identifyTargetServer = 'identifyTargetServer';
const hackTargetFromAllServers = 'hackTargetFromAllServers';
const hackAllServersFromHome = 'hackAllServersFromHome';
const printTargetStatus = 'printTargetStatus';
const checkHackingLevel = 'checkHackingLevel';
const wait = 'wait';
const STATES = {
  identifyTargetServer: {},
  hackTargetFromAllServers: {
    script: 'auto-hack-controller.js',
  },
  hackAllServersFromHome: {
    script: 'auto-hack-controller.js',
  },
  printTargetStatus: {},
  checkHackingLevel: {},
  wait: {},
};

function newState(newState) {
  currentState = newState;
  console.debug('Changed State: ', currentState);
}

function confirmTarget(ns, currentHackingLevel) {
  const oldTargetHostname = TARGET.hostname;
  if (TARGET.score === Infinity) {
    // This happens sometimes?!
    TARGET.score = 0;
  }
  for (const server of Object.keys(serverList)) {
    const targetScore = helpers.getTargetScore(serverList[server], currentHackingLevel);
    serverList[server].score = targetScore;
    if (targetScore > TARGET.score) {
      TARGET.hostname = server;
      TARGET.score = targetScore;
    }
  }

  if (oldTargetHostname != TARGET.hostname) {
    ns.tprint(
      `[${helpers.timestamp()}] Target acquired: ${TARGET.hostname}` +
        `   Score: ${helpers.prettyNumber(TARGET.score)}` +
        `   Max Money: ${helpers.prettyCurrency(serverList[TARGET.hostname].moneyMax)}`,
    );
    return true;
  }

  return false;
}

function filterTargetsForHome(ns, targets) {
  return targets.filter((target) => !helpers.cannotTarget(ns, serverList[target]));
}

function updateTargetStatus() {
  const targetDetails = serverList[TARGET.hostname];
  const targetPanel = {
    hostname: TARGET.hostname || 'TBD',
    updateTime: helpers.timestamp() || 'N/A',
    moneyMax: helpers.prettyCurrency(targetDetails.moneyMax) || 'N/A',
    moneyAvailable: helpers.prettyCurrency(targetDetails.moneyAvailable) || 'N/A',
    hackDifficulty: targetDetails.hackDifficulty.toFixed(2) || 'N/A',
    hackTime: helpers.timeConversion(targetDetails.hackTime) || 'N/A',
    growTime: helpers.timeConversion(targetDetails.growTime) || 'N/A',
    weakenTime: helpers.timeConversion(targetDetails.weakenTime) || 'N/A',
    score: helpers.prettyNumber(TARGET.score) || 'N/A',
  };
  localStorage.setItem('targetData', JSON.stringify(targetPanel));
}

export async function main(ns) {
  TARGET = { hostname: 'none', score: 0 };
  currentState = 'start';
  currentHackingLevel = ns.getHackingLevel();
  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }

    serverList = JSON.parse(serverListRaw);

    switch (currentState) {
      case identifyTargetServer:
        const targetChanged = confirmTarget(ns, currentHackingLevel);
        if (TARGET.hostname == NO_TARGET || targetChanged) {
          newState(hackTargetFromAllServers);
        } else {
          newState(printTargetStatus);
        }
        break;
      case hackTargetFromAllServers:
        ns.scriptKill(STATES[currentState].script, 'home');
        for (const server of Object.keys(serverList)) {
          if (helpers.cannotTarget(ns, serverList[server])) continue;
          if (serverList[server].maxRam < 1) continue;
          ns.run(STATES[currentState].script, 1, server, JSON.stringify(serverList[TARGET.hostname]), 1, 0);
          await helpers.sleep(SHORT_SLEEP);
        }
        newState(hackAllServersFromHome);
        break;
      case hackAllServersFromHome:
        const targets = filterTargetsForHome(ns, Object.keys(serverList));
        let iterator = targets.length;
        for (const target of targets) {
          ns.run(STATES[currentState].script, 1, 'home', JSON.stringify(serverList[target]), iterator, 0);
          iterator--;
          await helpers.sleep(SHORT_SLEEP);
        }
        newState(printTargetStatus);
        break;
      case printTargetStatus:
        if (TARGET) {
          updateTargetStatus();
        }
        newState(checkHackingLevel);
        break;
      case checkHackingLevel:
        const newHackingLevel = ns.getHackingLevel();
        if (newHackingLevel > currentHackingLevel && performance.now() - startTime > 300000) {
          ns.tprint(`[${helpers.timestamp()}] Hack skill leveled up to ${newHackingLevel}`);
          currentHackingLevel = newHackingLevel;
          newState('Restart');
          break;
        }
        newState(wait);
        break;
      case wait:
        if (performance.now() - startTime > 900000) {
          const killedScripts = await ns.scriptKill(STATES[hackAllServersFromHome].script, 'home');
          ns.tprint(`[${helpers.timestamp()}] Checkpoint hit. Restarting hack controllers: ${killedScripts}`);
          await helpers.sleep(1000);
          TARGET.hostname = NO_TARGET;
          TARGET.score = 0;
          newState('Restart');
          break;
        }
        await helpers.sleep(10);
        newState(identifyTargetServer);
        break;
      default:
        startTime = performance.now();
        newState(identifyTargetServer);
        break;
    }
    await helpers.sleep(SHORT_SLEEP);
  }
}
