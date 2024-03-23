import * as helpers from './shared.ts';

/** @param {NS} ns */

function enoughMoney(ns, ram) {
  return ns.getServerMoneyAvailable('home') * 0.1 > ns.getPurchasedServerCost(ram);
}

export async function main(ns) {
  while (true) {
    let maxRAM = ns.getPurchasedServerMaxRam(); // 1048576 GB
    let serverLimit = ns.getPurchasedServerLimit();
    let purchasedServers = ns.getPurchasedServers();
    let serverCount = purchasedServers.length;

    // First, scale out: it's cheap
    let ram = 8;
    while (enoughMoney(ns, ram) && serverLimit > serverCount) {
      const hostname = 'pserv-' + serverCount;
      ns.tprint(`Purchasing ${helpers.formatGigabytes(ram)} server: ${hostname}`);
      ns.purchaseServer(hostname, ram);
      serverCount++;
    }

    if (serverCount < serverLimit) {
      await helpers.sleep(30_000);
      continue;
    }

    /// Now we have the maximum number of servers, it is time to scale up
    serverCount = 0;
    while (serverLimit > serverCount && ns.getServerMoneyAvailable('home') > 100_000_000_000) {
      const hostname = 'pserv-' + serverCount;
      const ttlKey = `upgradeLock${hostname}`;
      const cooldown = localStorage.getItem(ttlKey);
      if (cooldown && new Date().getTime() > cooldown) {
        localStorage.removeItem(ttlKey);
      } else if (cooldown) {
        serverCount++;
        continue;
      }

      let serverRam = ns.getServerMaxRam(hostname);
      ram = maxRAM;
      while (ram > serverRam) {
        if (enoughMoney(ns, ram)) {
          ns.killall(hostname);
          const serverDeleted = ns.deleteServer(hostname);
          if (serverDeleted) {
            const serverPurchase = ns.purchaseServer(hostname, ram);
            if (serverDeleted && serverPurchase.length > 0) {
              ns.tprint(
                `Upgraded ${hostname} RAM from ${serverRam} GB to ${ram} GB for ${helpers.prettyNumber(
                  ns.getPurchasedServerCost(ram),
                )}`,
              );
            }
          }

          localStorage.setItem(ttlKey, new Date().getTime() + 900000);
          break; // Let's only upgrade one server per session
        }
        ram = ram / 2;
      }
      serverCount++;
    }

    await helpers.sleep(30_000);
  }
}
