import { createSidebarItem } from './box.js';
import * as helpers from './shared.ts';

const targetBoxId = 'target-box';
const targetBoxTitle = 'Target Status';
const targetBoxIcon = '\uea6a';
const position = 6;
const targetBoxClasses = ['custom-box'];

interface TargetData {
  hostname: string;
  updateTime: string;
  moneyMax: string;
  moneyAvailable: string;
  hackDifficulty: string;
  hackTime: string;
  growTime: string;
  weakenTime: string;
  score: string;
  [key: string]: string;
}

function updateSpan(key: string, value: string): void {
  const doc = eval('document');
  const span = doc.getElementById(`target-${key}`);
  if (!span) return;

  span.innerHTML = value;
}

function initialHTML(id: string): string {
  return `
    <div id="${id}" class="custom-box-container">
      <div id="target-box-header" class="custom-box-item-justified"><div class="custom-box-item-left">Target:</div><div id="target-hostname" class="custom-box-item-right">TBD</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">Updated at:</div><div id="target-updateTime" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">Money (Max):</div><div id="target-moneyMax" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">Money (Now):</div><div id="target-moneyAvailable" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">Security:</div><div id="target-hackDifficulty" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">hack() Time:</div><div id="target-hackTime" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">grow() Time:</div><div id="target-growTime" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">weaken() Time:</div><div id="target-weakenTime" class="custom-box-item-right">N/A</div></div>
      <div class="custom-box-item-justified"><div class="custom-box-item-left">Score:</div><div id="target-score" class="custom-box-item-right">N/A</div></div>
    </div>`;
}

export async function main(): Promise<void> {
  helpers.removeOldBox(targetBoxId);
  createSidebarItem(
    targetBoxTitle,
    initialHTML(targetBoxId),
    targetBoxIcon,
    `custom-box-${position - 1}`,
    targetBoxClasses,
  );
  helpers.autoResizeBox(targetBoxId);

  while (true) {
    const targetDataRaw = localStorage.getItem('targetData');
    if (!targetDataRaw) {
      await helpers.sleep(1000);
      continue;
    }

    const targetData: TargetData = JSON.parse(targetDataRaw);
    for (const key of Object.keys(targetData)) {
      updateSpan(key, targetData[key]);
    }
    await helpers.sleep(1000);
  }
}
