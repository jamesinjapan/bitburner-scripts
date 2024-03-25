import * as helpers from './shared.ts';
import { NS } from '@ns';

function shouldBuyRamUpgrade(ns: NS): boolean {
  return ns.getServerMoneyAvailable('home') * 0.1 > ns.singularity.getUpgradeHomeRamCost();
}

function shouldBuyCpuUpgrade(ns: NS): boolean {
  return ns.getServerMoneyAvailable('home') * 0.1 > ns.singularity.getUpgradeHomeCoresCost();
}

export async function main(ns: NS): Promise<void> {
  while (true) {
    if (ns.singularity.purchaseTor()) {
      const availablePrograms = ns.singularity.getDarkwebPrograms();
      for (const program of availablePrograms) {
        const installedFiles = ns.ls('home');
        if (installedFiles.includes(program)) continue;

        const currentMoney = ns.getServerMoneyAvailable('home');
        const programCost = ns.singularity.getDarkwebProgramCost(program);
        if (currentMoney > programCost) {
          ns.singularity.purchaseProgram(program);
          ns.tprint('Got Formulas.exe, restarting...');
          if (program === 'Formulas.exe') ns.spawn('startup.js', 1, 'true');
        }
      }
    }

    if (shouldBuyRamUpgrade(ns)) ns.singularity.upgradeHomeRam();
    if (shouldBuyCpuUpgrade(ns)) ns.singularity.upgradeHomeCores();

    await helpers.sleep(60_000);
  }
}
