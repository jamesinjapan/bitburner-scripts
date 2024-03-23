/** @param {NS} ns */
export async function main(ns) {
  const result = ns.formulas.work.factionGains("hacking").reputation.toFixed(2)
  ns.tprint("Formulas Test: ", result)
}