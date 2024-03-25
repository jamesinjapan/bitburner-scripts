import { createSidebarItem, sidebar } from './box.js';
import * as helpers from './shared.ts';

import { NS } from '@ns';

// TODO: Sorting doesn't  work when new files are added

const fileBoxId = 'files-box';
const fileBoxTitle = 'Local Files';
const fileBoxIcon = '\ueaf0';
const position = 4;
const fileBoxClasses = `custom-box-${position} custom-box c`;

const categoryMessage = 'messages';
const cmdMessage = 'cat';
const categoryScript = 'scripts';
const cmdScript = 'nano';
const categoryOther = 'others';
const cmdOther = '';

interface Category {
  name: string;
  icon: string;
}

const fileBoxCategories: Category[] = [
  { name: categoryScript, icon: '🛠' },
  { name: categoryMessage, icon: '✉' },
  { name: categoryOther, icon: '🗎' },
];

interface FileData {
  uniqueId: string;
  filename: string;
  filetype: string;
  category: string;
  cmd: string;
  html: string;
  [key: string]: string;
}

function autoLinkedName(filename: string, cmd: string): string {
  const fullCmd = `connect home; ${[cmd, filename].join(' ')}`;
  return `<a title='${filename}' onClick="runTerminalCommand('${fullCmd}');">${filename}</a>`;
}

function addCategories() {
  const doc = eval('document');
  for (const category of fileBoxCategories) {
    const node = doc.getElementById(fileBoxId);
    const divider = new Range().createContextualFragment(
      `<div id="${category.name}Divider" class="custom-box-item">
        <details>
          <summary class="custom-box-divider"><span class="custom-box-icon">${category.icon}</span> ${category.name}</summary>
        </details>
      </div>`,
    ).firstElementChild;
    node.appendChild(divider);
  }
}

function rowHTML(uniqueId: string, filename: string, cmd: string): string {
  return `
    <div id="${uniqueId}" class="custom-box-item-start">
      <div id="${uniqueId}Remove" class="custom-box-remove-button" onClick="runTerminalCommand('connect home; rm ${filename}');">✖</div>
      <div id="${uniqueId}File" class="custom-box-autolink">${autoLinkedName(filename, cmd)}</div>
  </div>`;
}

async function addFileToFileBox(file: FileData, prevFile: FileData): Promise<void> {
  const doc = eval('document');
  const exists = doc.getElementById(file.uniqueId);
  if (exists) return;

  const categorySection = doc.querySelector(`#${file.category}Divider`);
  const categoryDetails = categorySection.getElementsByTagName('details')[0];
  const fileItem = new Range().createContextualFragment(file.html).firstElementChild;

  if (prevFile && prevFile.category == file.category) {
    const prevSibling = doc.getElementById(prevFile.uniqueId);
    prevSibling.after(fileItem);
  } else {
    categoryDetails.appendChild(fileItem);
  }
}

async function removeFileFromFileBox(uniqueId: string): Promise<boolean> {
  const doc = eval('document');
  const existingElement = doc.getElementById(uniqueId);
  if (!existingElement) return false;

  existingElement.remove();
  return true;
}

function constructFileData(filename: string): FileData {
  const uniqueId = helpers.alphanumericOnly(filename);
  const filenameParts = filename.split('.');
  const filetype = filenameParts[filenameParts.length - 1];
  if (filetype.match(/txt|lit|msg/)) {
    return {
      uniqueId: uniqueId,
      filename: filename,
      filetype: filetype,
      category: categoryMessage,
      cmd: cmdMessage,
      html: rowHTML(uniqueId, filename, cmdMessage),
    };
  } else if (filetype.match(/js/)) {
    return {
      uniqueId: uniqueId,
      filename: filename,
      filetype: filetype,
      category: categoryScript,
      cmd: cmdScript,
      html: rowHTML(uniqueId, filename, cmdScript),
    };
  } else {
    return {
      uniqueId: uniqueId,
      filename: filename,
      filetype: filetype,
      category: categoryOther,
      cmd: cmdOther,
      html: rowHTML(uniqueId, filename, cmdOther),
    };
  }
}

function sortFileList(left: FileData, right: FileData) {
  const desiredOrder = fileBoxCategories.map((category) => category.name);
  const categoryOrder = desiredOrder.indexOf(left.category) - desiredOrder.indexOf(right.category);
  const filenameOrder = left.filename.localeCompare(right.filename);
  return categoryOrder || filenameOrder;
}

export async function main(ns: NS): Promise<void> {
  helpers.refreshBox(fileBoxId, fileBoxTitle, fileBoxIcon, position, fileBoxClasses);
  addCategories();
  helpers.autoResizeBox(fileBoxId);

  const fileList: FileData[] = [];
  while (true) {
    const incomingFileList = ns.ls('home');

    const addedFiles: FileData[] = [];
    for (const filename of incomingFileList) {
      if (filename.match(/\.cct/)) continue;
      if (fileList.filter((file) => file.filename == filename).length == 0) {
        addedFiles.push(constructFileData(filename));
      }
    }

    const removedFiles: FileData[] = fileList.filter((file) => !incomingFileList.includes(file.filename));
    for (const removedFile of removedFiles) {
      const index = fileList.findIndex((file) => file == removedFile);
      fileList.splice(index, 1);
      await removeFileFromFileBox(removedFile.uniqueId);
    }

    fileList.push(...addedFiles);
    fileList.sort((a, b) => sortFileList(a, b));
    let newFileIndex = 0;
    while (newFileIndex < fileList.length) {
      const thisFile = fileList[newFileIndex];
      const prevFile = fileList[newFileIndex - 1];
      await addFileToFileBox(thisFile, prevFile);
      newFileIndex++;
    }

    helpers.updateBoxTitle(fileBoxId, fileBoxTitle, Object.keys(fileList).length);
    helpers.autoResizeBox(fileBoxId);
    await helpers.sleep(100);
  }
}
