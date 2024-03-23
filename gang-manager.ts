import * as helpers from './shared.ts';

import { GangGenInfo, GangMemberAscension, GangMemberInfo, NS } from '@ns';

const skills = ['agi', 'cha', 'def', 'dex', 'hack', 'str'];

const HACKING_DEFAULT = 'Identity Theft';
const COMBAT_DEFAULT = 'Mug People';
const HACKING_TRAIN = 'Train Hacking';
const COMBAT_TRAIN = 'Train Combat';
const CHARISMA_TRAIN = 'Train Charisma';
const HACKING_WANTED = 'Ethical Hacking';
const COMBAT_WANTED = 'Vigilante Justice';
const HACKING_RESPECT = 'Cyberterrorism';
const COMBAT_RESPECT = 'Terrorism';
const HACKING_MONEY = 'Money Laundering';
const COMBAT_MONEY = 'Human Trafficking';
const WAR = 'Territory Warfare';

const hackingUpgrades = [
  'NUKE Rootkit',
  'Soulstealer Rootkit',
  'Demon Rootkit',
  'Hmap Node',
  'Jack the Ripper',
  'Neuralstimulator',
  'DataJack',
  'Ford Flex V20',
  'ATX1070 Superbike',
  'Mercedes-Benz S9001',
  'White Ferrari',
];

function getName(): string {
  const names = [
    'Noah',
    'Theo',
    'Oliver',
    'George',
    'Leo',
    'Freddie',
    'Arthur',
    'Archie',
    'Alfie',
    'Charlie',
    'Oscar',
    'Henry',
    'Harry',
    'Jack',
    'Teddy',
    'Finley',
    'Arlo',
    'Luca',
    'Jacob',
    'Tommy',
    'Lucas',
    'Theodore',
    'Max',
    'Isaac',
    'Albie',
    'James',
    'Mason',
    'Rory',
    'Thomas',
    'Rueben',
    'Roman',
    'Logan',
    'Harrison',
    'William ',
    'Elijah',
    'Ethan',
    'Joshua',
    'Hudson',
    'Jude',
    'Louie',
    'Jaxon',
    'Reggie',
    'Oakley',
    'Hunter',
    'Alexander',
    'Toby',
    'Adam',
    'Sebastian',
    'Daniel',
    'Ezra',
    'Rowan',
    'Alex',
    'Dylan',
    'Ronnie',
    'Kai',
    'Hugo',
    'Louis',
    'Riley',
    'Edward',
    'Finn',
    'Grayson',
    'Elliot',
    'Caleb',
    'Benjamin',
    'Bobby',
    'Frankie',
    'Zachary',
    'Brody',
    'Jackson',
    'Ollie',
    'Jasper',
    'Liam',
    'Stanley',
    'Sonny',
    'Blake',
    'Albert',
    'Joseph',
    'Chester',
    'Carter',
    'David',
    'Milo',
    'Ellis',
    'Jenson',
    'Samuel',
    'Gabriel',
    'Eddie',
    'It is',
    'Rupert',
    'Eli',
    'Myles',
    'Brodie',
    'Parker',
    'Ralph',
    'Miles',
    'Jayden',
    'Billy',
    'Elliott',
    'Jax',
    'Ryan',
    'Joey',
    'Ada',
    'Alice',
    'Amber',
    'Amelia',
    'Amelie',
    'Anna',
    'Arabella',
    'Aria',
    'Aurora',
    'Ava',
    'Ayla',
    'Beatrice',
    'Bella',
    'Bonnie',
    'Camila',
    'Charlotte',
    'Chloe',
    'Clara',
    'Daisy',
    'Darcie',
    'Delilah',
    'Eden',
    'Edith',
    'Eleanor',
    'Eliza',
    'Elizabeth',
    'Ella',
    'Ellie',
    'Elodie',
    'Elsie',
    'Emilia',
    'Emily',
    'Emma',
    'Erin',
    'Esme',
    'Eva',
    'Evelyn',
    'Evie',
    'Florence',
    'Freya',
    'Grace',
    'Gracie',
    'Hallie',
    'Hannah',
    'Harper',
    'Harriet',
    'Hazel',
    'Heidi',
    'Holly',
    'Imogen',
    'Iris',
    'Isabella',
    'Isabelle',
    'Isla',
    'Ivy',
    'Jasmine',
    'Jessica',
    'Lara',
    'Layla',
    'Lilly',
    'Lily',
    'Lola',
    'Lottie',
    'Lucy',
    'Luna',
    'Lyla',
    'Lyra',
    'Mabel',
    'Maeve',
    'Maisie',
    'Margot',
    'Maria',
    'Maryam',
    'Matilda',
    'Maya',
    'Mia',
    'Mila',
    'Millie',
    'Molly',
    'Myla',
    'Nancy',
    'Nova',
    'Olive',
    'Olivia',
    'Orla',
    'Penelope',
    'Phoebe',
    'Poppy',
    'Robyn',
    'Rose',
    'Rosie',
    'Ruby',
    'Sara',
    'Scarlett',
    'Sienna',
    'Sofia',
    'Sophia',
    'Sophie',
    'Summer',
    'Thea',
    'Violet',
    'Willow',
    'Zara',
    'Adam',
    'Alfred',
    'Asher',
    'Charles',
    'Felix',
    'Frederick',
    'Harvey',
    'Jesse',
    'Julian',
    'Levi',
    'Michael',
    'Mohammad',
    'Mohammed',
    'Muhammad',
    'Nathan',
    'Otis',
    'Reuben',
    'Tobias',
    'Waylon',
    'William',
    'Yusuf',
    'Ema',
    'Mei',
    'Sana',
    'Mio',
    'Ichika',
    'Yui',
    'Aoi',
    'Koharu',
    'Tsumugi',
    'Himari',
    'Honoka',
    'Hina',
    'Akari',
    'Hinata',
    'Sakura',
    'Rio',
    'Yuna',
    'Rin',
    'Uta',
    'Ena',
    'Iroha',
    'Yua',
    'Nagisa',
    'Noa',
    'Riko',
    'Hiyori',
    'Hana',
    'Yuno',
    'Kanon',
    'Miyu',
    'Fuuka',
    'Ito',
    'Rei',
    'Kotoha',
    'Sui',
    'Sena',
    'Hinano',
    'Kann-na',
    'Yuina',
    'Yuzuha',
    'Rino',
    'Suzu',
    'Sumire',
    'Yuzuki',
    'Rinka',
    'Oto',
    'Sora',
    'Yuika',
    'Momoka',
    'Haruto',
    'Aoto',
    'Riku',
    'Minato',
    'Haruki',
    'Yuito',
    'Haru',
    'Souta',
    'Itsuki',
    'Souma',
    'Yuuto',
    'Taiga',
    'Yuuma',
    'Kanata',
    'Kaito',
    'Ao',
    'Kanato',
    'Sousuke',
    'Rui',
    'Saku',
    'Hayato',
    'Kouki',
    'Toa',
    'Ayato',
    'Yuusei',
    'Renn',
    'Asahi',
    'Reo',
    'Ibuki',
    'Rito',
    'Akito',
    'Iori',
    'Hiroto',
    'Kairi',
    'Nagi',
    'Yuuri',
    'Sakuto',
    'Ritsuki',
    'Ritsu',
    'Kotarou',
    'Sou',
    'Mitsuki',
    'Yamato',
    'Eito',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function willDoubleStats(isHacking: boolean, ascensionResult: GangMemberAscension) {
  if (!ascensionResult) return false;

  let notReady = false;
  for (const skill of Object.keys(ascensionResult)) {
    if (isHacking && !['cha', 'hack'].includes(skill)) {
      continue;
    } else if (isHacking && skill == 'hack') {
      continue;
    }

    if (ascensionResult[skill] < 2) {
      notReady = true;
    }
  }

  return !notReady;
}

function shouldBuyUpgrade(ns: NS, memberInfo: GangMemberInfo, upgrade: string): boolean {
  if (memberInfo.upgrades.includes(upgrade)) return false;

  return ns.getServerMoneyAvailable('home') * 0.1 > ns.gang.getEquipmentCost(upgrade);
}

function chooseTask(ns: NS, gangInfo: GangGenInfo, memberInfo: GangMemberInfo): string {
  const vetoRoll = Math.random() * 10 > 8;

  let weakSkill;
  for (const skill of skills) {
    if (gangInfo.isHacking && !['cha', 'hack'].includes(skill)) {
      continue;
    }

    const skillLevel = memberInfo[skill];
    if (typeof skillLevel == 'number' && skillLevel < 1000) {
      weakSkill = skill;
    }
  }

  if (weakSkill && !vetoRoll && weakSkill == 'hack') return HACKING_TRAIN;
  if (weakSkill && !vetoRoll && weakSkill == 'cha') return CHARISMA_TRAIN;
  if (weakSkill && !vetoRoll) return COMBAT_TRAIN;

  const trainingRoll = Math.random() * 10 > 8;
  if (!vetoRoll && trainingRoll) return gangInfo.isHacking ? HACKING_TRAIN : COMBAT_TRAIN;

  const reduceWantedRoll = (1 - gangInfo.wantedPenalty) * 100 > 10;
  if (!vetoRoll && reduceWantedRoll) return gangInfo.isHacking ? HACKING_WANTED : COMBAT_WANTED;

  if (vetoRoll) return gangInfo.isHacking ? HACKING_MONEY : COMBAT_MONEY;

  return gangInfo.isHacking ? HACKING_RESPECT : COMBAT_RESPECT;
}

export async function main(ns: NS): Promise<void> {
  while (true) {
    if (!ns.gang.inGang()) {
      await helpers.sleep(300_000);
      continue;
    }

    const gangInfo = ns.gang.getGangInformation();

    if (ns.gang.canRecruitMember()) {
      const name = getName();
      ns.gang.recruitMember(name);
    }

    const gangMembers = ns.gang.getMemberNames();
    for (const member of gangMembers) {
      const memberInfo = ns.gang.getMemberInformation(member);

      const ascensionResult = ns.gang.getAscensionResult(member);
      if (ascensionResult) {
        const shouldAscend = willDoubleStats(gangInfo.isHacking, ascensionResult);
        if (shouldAscend) {
          ns.gang.ascendMember(member);
        }
      }

      const task = chooseTask(ns, gangInfo, memberInfo);
      if (Math.random() * 10 > 2) {
        ns.gang.setMemberTask(member, task);
      }

      for (const upgrade of hackingUpgrades) {
        if (shouldBuyUpgrade(ns, memberInfo, upgrade)) {
          ns.gang.purchaseEquipment(member, upgrade);
          break;
        }
      }
    }
    await helpers.sleep(60_000);
  }
}
