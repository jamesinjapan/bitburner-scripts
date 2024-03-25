import * as helpers from './shared.ts';

import { NS } from '@ns';

function cleanText(text: string): string {
  return text.replace(/[\n\r]+|[\s]{2,}/g, '');
}

export async function main(ns: NS): Promise<void> {
  while (true) {
    const doc = eval('document');
    const targets: Record<string, string[]> = {
      'Sector-12': ['MegaCorp', 'Blade Industries', 'Four Sigma'],
      Aevum: ['ECorp', 'ClarkeIncorporated', 'Bachman & Associates', 'Fulcrum Technologies'],
      Chongqing: ['KuaiGong International'],
      Volhaven: ['NWO', 'OmniTek Incorporated'],
      'New Tokyo': ['DefComm'],
      Ishima: ['Storm Technologies'],
    };

    try {
      const maximumLevelHeading = doc.getElementsByTagName('h6')[0]?.getElementsByTagName('b')[0];
      if (maximumLevelHeading && maximumLevelHeading.innerText == 'Maximum Level: ') {
        const startButton =
          maximumLevelHeading.parentElement.parentElement.parentElement.getElementsByTagName('button')[0];
        if (startButton.innerText !== 'Start') continue;

        startButton.click();
      }
    } catch (error) {
      console.error('Error clicking into target: ', error);
    }

    try {
      const cityHeading = doc.getElementsByClassName('MuiBox-root')[6]?.getElementsByTagName('p')[0];
      if (cityHeading && Object.keys(targets).includes(cleanText(cityHeading.innerText))) {
        const cityName = cleanText(cityHeading.innerText);
        if (typeof cityName != 'string') continue;

        const target = targets[cityName][Math.floor(Math.random() * targets[cityName].length)];
        const targetLink: HTMLElement | null = document.querySelector(`[aria-label="${target}"]`);
        if (!targetLink) continue;

        targetLink.click();
      }
    } catch (error) {
      console.error('Error clicking into target: ', error);
    }

    try {
      const targetHeading = doc.getElementsByTagName('h4')[0];
      if (targetHeading && Object.values(targets).flat().includes(cleanText(targetHeading.innerText))) {
        const infiltrateText = "//button[text()='Infiltrate Company']";
        const infiltrateButton = doc.evaluate(
          infiltrateText,
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
        infiltrateButton[Object.keys(infiltrateButton)[1]].onClick({ isTrusted: true });
        infiltrateButton.click();
      }
    } catch (error) {
      console.error('Error infiltrating: ', error);
    }

    try {
      const successHeading = doc.getElementsByTagName('h4')[1];
      if (successHeading && cleanText(successHeading.innerText) == 'Infiltration successful!') {
        const reputationTarget = successHeading.nextElementSibling.nextElementSibling.firstChild.firstChild.innerText;
        if (reputationTarget != 'none') {
          successHeading.nextElementSibling.nextElementSibling.getElementsByTagName('button')[0].click();
        } else {
          successHeading.nextElementSibling.nextElementSibling.getElementsByTagName('button')[1].click();
        }
      }
      await helpers.sleep(15000);
    } catch (error) {
      console.error('Error getting reputation: ', error);
    }
    await helpers.sleep(100);
  }
}
