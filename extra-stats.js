import * as helpers from './shared.ts';

/** @param {NS} ns */

export async function main(ns) {
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');
  const hook2 = doc.getElementById('overview-extra-hook-2');
  while (true) {
    try {
      const headers = [];
      const values = [];

      headers.push('Script Income:');
      values.push(`${helpers.prettyCurrency(ns.getTotalScriptIncome()[1])}/sec`);
      headers.push('Script XP Gain:');
      values.push(`${helpers.prettyNumber(ns.getTotalScriptExpGain())}/sec`);
      headers.push('Augmentations Installed:');
      values.push(`${ns.getResetInfo().ownedAugs.size}`);
      headers.push('Servers Purchased:');
      values.push(`${ns.getPurchasedServers().length}/${ns.getPurchasedServerLimit()}`);
      headers.push('Hacknet Nodes Running:');
      values.push(`${ns.hacknet.numNodes()}`);
      headers.push('Time Since Last Augment:');
      values.push(((Date.now() - ns.getResetInfo().lastAugReset) / 1000 / 60 / 60).toFixed(1) + 'h ago');

      // Now drop it into the placeholder elements
      hook0.innerText = headers.join(' \n');
      hook1.innerText = values.join('\n');
    } catch (error) {
      // This might come in handy later
      ns.tprint(`[${helpers.timestamp()}] Error : `, error);
    }
    await helpers.sleep(100);
  }
}
