import { createSidebarItem } from './box.js';
import * as helpers from './shared.ts';

import { NS } from '@ns';

const contractBoxId = 'contracts-box';
const contractBoxTitle = 'Contract Files';
const contractBoxIcon = '\ueb67';
const position = 2;
const contractBoxClasses = `custom-box-${position} custom-box`;

interface FileData {
  hostname: string;
  filename: string;
  contractType: string;
  parents: string[];
  solveable: boolean;
  [key: string]: string | string[] | boolean;
}

function autoLinkedName(file: FileData): string {
  let cmd;
  if (file.solveable) {
    cmd = `connect home; run solve-contracts.js ${file.hostname} ${file.filename}`;
  } else {
    cmd = [...file.parents, file.hostname].join(';connect ') + ';' + `run ${file.filename}`;
  }

  return `<a title='${file.filename}' onClick="runTerminalCommand('${cmd}');">${file.contractType}</a>`;
}

function rowHTML(uniqueId: string, file: FileData): string {
  let mark;
  if (file.solveable) {
    mark = '[✔]';
  } else {
    mark = '[?]';
  }

  return `
    <div id="${uniqueId}" class="custom-box-item-start">
      <div id="${uniqueId}Remove" class="custom-box-remove-button" onClick="removeParent(this);">✖</div>
      <div id="${uniqueId}File" class="custom-box-autolink"> ${mark} ${autoLinkedName(file)}</div>
  </div>`;
}

async function addFileToList(file: FileData): Promise<boolean> {
  const uniqueId = helpers.alphanumericOnly(file.filename);
  const html = rowHTML(uniqueId, file);

  const doc = eval('document');
  const exists = doc.getElementById(uniqueId);
  if (exists) return false;

  const range = new Range().createContextualFragment(html).firstElementChild;
  const box = doc.getElementById(contractBoxId);
  box.appendChild(range);
  return true;
}

function getChildren(): number {
  const doc = eval('document');
  const box = doc.getElementById(contractBoxId);
  return box.childElementCount;
}

async function removeFileFromList(filename: string): Promise<boolean> {
  const uniqueId = helpers.alphanumericOnly(filename);
  const doc = eval('document');
  const existingElement = doc.getElementById(uniqueId);
  if (!existingElement) return false;

  existingElement.remove();
  return true;
}

function findContractFiles(ns: NS, serverList: Record<string, helpers.ServerFull>): FileData[] {
  const filesFound = [];
  for (const hostname of Object.keys(serverList)) {
    const serverFiles = ns.ls(hostname);
    const contractFiles = serverFiles.filter((file) => {
      const filetype = file.split('.').pop();
      return filetype == 'cct';
    });
    for (const file of contractFiles) {
      const contractType = ns.codingcontract.getContractType(file, hostname);
      filesFound.push({
        hostname: hostname,
        contractType: contractType,
        solveable: !!helpers.solvedContractTypes[contractType],
        filename: file,
        parents: serverList[hostname].parents,
      });
    }
  }
  return filesFound;
}

export async function main(ns: NS): Promise<void> {
  helpers.removeOldBox(contractBoxId);
  createSidebarItem(
    contractBoxTitle,
    helpers.initialBoxHTML(contractBoxId),
    contractBoxIcon,
    `custom-box-${position - 1}`,
    contractBoxClasses,
  );
  helpers.autoResizeBox(contractBoxId);

  const fileList: FileData[] = [];
  while (true) {
    const serverListRaw = localStorage.getItem('serverListData');
    if (!serverListRaw) {
      await helpers.sleep(1000);
      continue;
    }
    const serverList: Record<string, helpers.ServerFull> = JSON.parse(serverListRaw);

    const filesFound = findContractFiles(ns, serverList);
    for (let i = 0; i < filesFound.length; i++) {
      const file: FileData = filesFound[i];

      const addedFile = await addFileToList(file);
      if (addedFile) {
        fileList.push(file);
      }
    }

    let currentFileIndex = 0;
    while (currentFileIndex < fileList.length) {
      const file: FileData = fileList[currentFileIndex];
      const existingIndex = filesFound.findIndex((newFile) => file.filename == newFile.filename);
      if (existingIndex === -1) {
        await removeFileFromList(file.filename);
        fileList.splice(currentFileIndex, 1);
      } else {
        currentFileIndex++;
      }
    }

    const contractCount = getChildren();
    helpers.updateBoxTitle(contractBoxId, contractBoxTitle, contractCount);
    await helpers.sleep(500);
  }
}
