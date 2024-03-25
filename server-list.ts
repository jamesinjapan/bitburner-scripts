import * as helpers from './shared.ts';

import { NS } from '@ns';

const serverList: Record<string, helpers.ServerFull> = {};

const serverBoxId = 'servers-box';
const serverBoxTitle = 'Servers';
const serverBoxIcon = '\ueba3';
const position = 3;
const serverBoxClasses = `custom-box-${position} custom-box c`;

function getUniqueId(string: string): string {
  return `server-${string.replace(/[^A-Za-z0-9]/g, '-')}`;
}

function autoLinkedName(server: helpers.ServerFull): string {
  const parents = server.parents;
  const path = [...parents, server.hostname].join(';connect '); // Generate command to reach server
  const fullCmd = `connect ${path}`;
  return `<a title='${server.hostname}' onClick="runTerminalCommand('${fullCmd}');">${server.hostname}</a>`;
}

function rowHtml(uniqueId: string, server: helpers.ServerFull): string {
  return `<div id="${uniqueId}" class="custom-box-item">
    <div id="${uniqueId}Server" class="custom-box-autolink custom-box-item-server-leaf">└ ${autoLinkedName(
    server,
  )} <span id="${uniqueId}ServerDetails" class="custom-box-item-details">${helpers.formatGigabytes(
    server.maxRam,
  )}</span></div>
    <div id="${uniqueId}Children" class="custom-box-item-server-children"></div>
  </div>`;
}

function rowHtmlForParent(uniqueId: string, server: helpers.ServerFull): string {
  return `<div id="${uniqueId}" class="custom-box-item">
    <div id="${uniqueId}Server" class="custom-box-autolink custom-box-item-server-parent">▼ ${autoLinkedName(
    server,
  )} <span id="${uniqueId}ServerDetails" class="custom-box-item-details">${helpers.formatGigabytes(
    server.maxRam,
  )}</span></div>
    <div id="${uniqueId}Children" class="custom-box-item-server-children"></div>
  </div>`;
}

function addHomeIfMissing(server: helpers.ServerFull): boolean {
  const doc = eval('document');
  const uniqueId = getUniqueId(server.hostname);
  const html = rowHtmlForParent(uniqueId, server);

  const existingElement = doc.getElementById(uniqueId);
  if (existingElement) return false;

  const parent = doc.getElementById(serverBoxId);
  if (!parent) return false;

  const range = new Range().createContextualFragment(html).firstElementChild;
  parent.prepend(range);
  return true;
}

function addServerIfMissing(server: helpers.ServerFull, serverList: Record<string, helpers.ServerFull>): boolean {
  const doc = eval('document');
  const uniqueId = getUniqueId(server.hostname);

  let html;
  if (server.children && server.children.length > 0) {
    html = rowHtmlForParent(uniqueId, server);
  } else {
    html = rowHtml(uniqueId, server);
  }

  const existingElement = doc.getElementById(uniqueId);
  if (existingElement) return false;

  let lastParent = 'home';
  for (const parent of server.parents) {
    lastParent = parent;
    const parentUniqueId = getUniqueId(parent);
    const existingParent = doc.getElementById(parentUniqueId);
    if (existingParent) continue;

    const parentServer = serverList[parent];
    addServerIfMissing(parentServer, serverList);
  }

  const parentUniqueId = getUniqueId(lastParent);
  const parent = doc.getElementById(`${parentUniqueId}Children`);
  const range = new Range().createContextualFragment(html).firstElementChild;
  parent.appendChild(range);
  return true;
}

export async function main(ns: NS): Promise<void> {
  helpers.refreshBox(serverBoxId, serverBoxTitle, serverBoxIcon, position, serverBoxClasses);
  let loopCounter = 0;

  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }

    const serverList = JSON.parse(serverListRaw);
    addHomeIfMissing(serverList['home']);
    for (const hostname of Object.keys(serverList).sort()) {
      if (hostname == 'home') continue;

      const server = serverList[hostname];
      addServerIfMissing(server, serverList);
    }

    helpers.updateBoxTitle(serverBoxId, serverBoxTitle, Object.keys(serverList).length);
    helpers.autoResizeBox(serverBoxId);
    loopCounter++;
    if (loopCounter > 3000) {
      loopCounter = 0;
      helpers.refreshBox(serverBoxId, serverBoxTitle, serverBoxIcon, position, serverBoxClasses);
    }
    await helpers.sleep(100);
  }
}
