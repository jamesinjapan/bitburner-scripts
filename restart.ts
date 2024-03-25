import { NS } from '@ns';

function getElementByXpath(path: string) {
  const doc = eval('document');
  return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

export async function main(ns: NS): Promise<void> {
  ns.tprint('Restarting scripts...');
  const cityTab = getElementByXpath("//*[@data-testid='LocationCityIcon']");
  if (cityTab) cityTab.parentNode.parentNode.parentNode.click();
  ns.spawn('startup.js', 1, 'true');
}
