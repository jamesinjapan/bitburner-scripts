import * as helpers from './shared.ts';
import { NS } from '@ns';

let augmentationTooExpensive;
const CHANGE_CITY_COOLDOWN = 300_000;
const COMBAT_GANG_FACTION = 'Slum Snakes';

const factionWorkOrder = ['field', 'security', 'hacking'];

const cities = ['Aevum', 'Sector-12', 'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima'];

const universities = [
  { name: 'Summit University', city: 'Aevum' },
  { name: 'Rothman University', city: 'Sector-12' },
  { name: 'ZB Institute Of Technology', city: 'Volhaven' },
];

const companyFactions = [
  { name: 'MegaCorp', city: 'Sector-12' },
  { name: 'Four Sigma', city: 'Sector-12' },
  { name: 'Blade Industries', city: 'Sector-12' },
  { name: 'KuaiGong International', city: 'Chongqing' },
  { name: 'NWO', city: 'Volhaven' },
  { name: 'OmniTek Incorporated', city: 'Volhaven' },
  { name: 'ECorp', city: 'Aevum' },
  { name: 'Bachman & Associates', city: 'Aevum' },
  { name: 'Clarke Incorporated', city: 'Aevum' },
  { name: 'Fulcrum Technologies', city: 'Aevum' },
];

function joinFactionsForAugmentations(ns: NS) {
  const invitations = ns.singularity.checkFactionInvitations();
  for (const invitation of invitations) {
    const availableAugmentations = ns.singularity.getAugmentationsFromFaction(invitation);
    const ownedAugmentations = ns.singularity.getOwnedAugmentations(true);
    for (const augmentation of availableAugmentations) {
      if (augmentation.match('NeuroFlux Governor')) continue;

      if (!ownedAugmentations.includes(augmentation)) {
        ns.singularity.joinFaction(invitation);
        break;
      }
    }
  }
}

function studyForHackExp(ns: NS) {
  const university = universities[Math.floor(Math.random() * universities.length)];
  ns.singularity.travelToCity(university.city);
  ns.singularity.universityCourse('Summit University', 'Computer Science', false);
}

function shouldBuyAugmentation(ns: NS, augmentation: string): boolean {
  return ns.getServerMoneyAvailable('home') * 0.5 > ns.singularity.getAugmentationPrice(augmentation);
}

function buildFactionReputation(ns: NS, joinedFactions: string[]): boolean {
  for (const faction of joinedFactions) {
    const augmentationsAvailable = ns.singularity.getAugmentationsFromFaction(faction);
    for (const augmentation of augmentationsAvailable) {
      if (augmentation.match('NeuroFlux Governor')) continue;

      const reputationRequired = ns.singularity.getAugmentationRepReq(augmentation);
      const currentReputation = ns.singularity.getFactionRep(faction);
      if (currentReputation < reputationRequired) {
        for (const workType of Object.values(factionWorkOrder)) {
          if (ns.singularity.workForFaction(faction, workType, false)) {
            return true;
          }
        }
      } else {
        const augmentationPrice = ns.singularity.getAugmentationPrice(augmentation);
        const basePrice = ns.singularity.getAugmentationBasePrice(augmentation);
        if (augmentationPrice - basePrice > basePrice * 100) {
          augmentationTooExpensive = true;
          return false;
        }
        const buyAugmentation = shouldBuyAugmentation(ns, augmentation);
        if (buyAugmentation) ns.singularity.purchaseAugmentation(faction, augmentation);
      }
    }
  }
  return false;
}

function buildCompanyReputation(ns: NS): boolean {
  let companyToWorkFor;
  for (const company of companyFactions) {
    const availableAugmentations = ns.singularity.getAugmentationsFromFaction(company.name);
    const ownedAugmentations = ns.singularity.getOwnedAugmentations(true);
    for (const augmentation of availableAugmentations) {
      if (!ownedAugmentations.includes(augmentation)) {
        companyToWorkFor = company;
        break;
      }
    }
    if (companyToWorkFor) break;
  }

  if (!companyToWorkFor) return false;

  try {
    ns.singularity.applyToCompany(companyToWorkFor.name, 'Software');
    return ns.singularity.workForCompany(companyToWorkFor.name, false);
  } catch (error) {
    ns.tprint('Failed to work for company: ', error);
    return false;
  }
}

export async function main(ns: NS): Promise<void> {
  augmentationTooExpensive = false;
  let lastChange = new Date().getTime();
  while (true) {
    ns.singularity.hospitalize();

    if (lastChange > new Date().getTime() + CHANGE_CITY_COOLDOWN) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      ns.singularity.travelToCity(city);
    }

    if (Math.random() * 10 > 7) {
      ns.singularity.commitCrime('Traffick Arms', false);
      await helpers.sleep(300_000);
      continue;
    }

    joinFactionsForAugmentations(ns);
    const joinedFactions = ns.getPlayer().factions;
    const karma = ns.heart.break();
    if (karma < -54000) {
      if (joinedFactions.includes(COMBAT_GANG_FACTION)) ns.gang.createGang(COMBAT_GANG_FACTION);
    }

    let buildingReputation = false;
    if (joinedFactions.length) {
      buildingReputation = buildFactionReputation(ns, joinedFactions);
    } else {
      studyForHackExp(ns);
    }

    if (augmentationTooExpensive) {
      ns.singularity.installAugmentations('restart.js');
      return;
    }

    let workingForCompany = false;
    if (!buildingReputation) {
      workingForCompany = buildCompanyReputation(ns);
    }

    if (!workingForCompany) studyForHackExp(ns);

    await helpers.sleep(60_000);
  }
}
