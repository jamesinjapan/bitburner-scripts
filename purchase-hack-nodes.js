import * as helpers from './shared.ts';

/** @param {NS} ns */

const minMoney = 100000;
let purchasedNodes;
let leveledUpNodes;
let upgradedRamNodes;
let upgradedCoreNodes;

function enoughMoney(ns) {
  const moneyAvailable = ns.getServerMoneyAvailable('home');
  return moneyAvailable > minMoney;
}

function buyNewNodeIfEnoughMoney(ns) {
  const moneyAvailable = ns.getServerMoneyAvailable('home');
  const purchaseCost = ns.hacknet.getPurchaseNodeCost();
  if (purchaseCost > moneyAvailable * 0.1 || purchaseCost > 500_000_000) return false;

  purchasedNodes++;
  return ns.hacknet.purchaseNode();
}

function upgradeNodeLevelIfEnoughMoney(ns, i) {
  const moneyAvailable = ns.getServerMoneyAvailable('home');
  const upgradeCost = ns.hacknet.getLevelUpgradeCost(i, 10);

  if (upgradeCost > moneyAvailable * 0.1) return false;

  leveledUpNodes++;
  return ns.hacknet.upgradeLevel(i, 10);
}

function upgradeNodeRamIfEnoughMoney(ns, i) {
  const moneyAvailable = ns.getServerMoneyAvailable('home');
  const upgradeCost = ns.hacknet.getRamUpgradeCost(i, 4);

  if (upgradeCost > moneyAvailable * 0.1) return false;

  upgradedRamNodes++;
  return ns.hacknet.upgradeRam(i, 4);
}

function upgradeNodeCoresIfEnoughMoney(ns, i) {
  const moneyAvailable = ns.getServerMoneyAvailable('home');
  const upgradeCost = ns.hacknet.getCoreUpgradeCost(i, 4);

  if (upgradeCost > moneyAvailable * 0.1) return false;

  upgradedCoreNodes++;
  return ns.hacknet.upgradeCore(i, 4);
}

export async function main(ns) {
  while (true) {
    purchasedNodes = 0;
    leveledUpNodes = 0;
    upgradedRamNodes = 0;
    upgradedCoreNodes = 0;

    while (enoughMoney(ns)) {
      let didSomething = false;
      didSomething = buyNewNodeIfEnoughMoney(ns);
      if (didSomething) continue;

      const nodeCount = ns.hacknet.numNodes();
      let i = 0;
      while (i < nodeCount) {
        didSomething = upgradeNodeLevelIfEnoughMoney(ns, i);
        if (didSomething) continue;
        didSomething = upgradeNodeRamIfEnoughMoney(ns, i);
        if (didSomething) continue;
        didSomething = upgradeNodeCoresIfEnoughMoney(ns, i);
        if (didSomething) continue;
        i++;
      }

      if (!didSomething) break;
    }

    if (Math.max(purchasedNodes, leveledUpNodes, upgradedRamNodes, upgradedCoreNodes) > 0) {
      ns.tprint(
        `[${helpers.timestamp()}] Hacknet Node changes -- Purchased: ${purchasedNodes}  Leveled Up: ${leveledUpNodes}  Upgraded RAM: ${upgradedRamNodes}  Upgraded Cores: ${upgradedCoreNodes}`,
      );
    }

    await helpers.sleep(30_000);
  }
}
