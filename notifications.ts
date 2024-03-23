import { createSidebarItem } from './box.js';
import * as helpers from './shared.ts';

const notificationsBoxId = 'notifications-box';
const notificationsBoxTitle = 'Notifications';
const notificationsBoxIcon = '\uea6c';
const position = 1;
const notificationsBoxClasses = `custom-box-${position} custom-box`;

function autoLinkedName(server: helpers.ServerFull): string {
  const parents = server.parents;
  const path = [...parents, server.hostname].join(';connect '); // Generate command to reach server
  const fullCmd = `connect ${path}; backdoor`;
  return `<a title='${server.hostname}' onClick="runTerminalCommand('${fullCmd}');">${server.hostname}</a>`;
}

function rowHTML(uniqueId: string, server: helpers.ServerFull): string {
  return `
    <div id="${uniqueId}" class="custom-box-item-start">
      <div id="${uniqueId}Remove" class="custom-box-remove-button" onClick="removeParent(this);">✖</div>
      <div id="${uniqueId}Notification" class="custom-box-autolink">Backdoor: ${autoLinkedName(server)}</div>
  </div>`;
}

async function addNotificationToList(server: helpers.ServerFull, notificationType: string): Promise<string> {
  const uniqueId = `${helpers.alphanumericOnly(server.hostname)}${notificationType}`;
  const html = rowHTML(uniqueId, server);

  const doc = eval('document');
  const exists = doc.getElementById(uniqueId);
  if (exists) return '';

  const range = new Range().createContextualFragment(html).firstElementChild;
  const box = doc.getElementById(notificationsBoxId);
  box.appendChild(range);
  return html;
}

async function removeFileFromList(uniqueId: string): Promise<boolean> {
  const doc = eval('document');
  const existingElement = doc.getElementById(uniqueId);
  if (!existingElement) return false;

  existingElement.remove();
  return true;
}

export async function main(): Promise<void> {
  helpers.removeOldBox(notificationsBoxId);
  createSidebarItem(
    notificationsBoxTitle,
    helpers.initialBoxHTML(notificationsBoxId),
    notificationsBoxIcon,
    `custom-box-${position - 1}`,
    notificationsBoxClasses,
  );
  helpers.autoResizeBox(notificationsBoxId);

  function getChildren(): number {
    const doc = eval('document');
    const box = doc.getElementById(notificationsBoxId);
    return box.childElementCount;
  }

  const currentNotifications: Array<string> = [];
  while (true) {
    const backdoorNotificationsRaw = localStorage.getItem('notificationsBackdoor');
    if (!backdoorNotificationsRaw) {
      await helpers.sleep(1000);
      continue;
    }

    const backdoorNotifications = JSON.parse(backdoorNotificationsRaw);
    const addedNotifications = [];
    for (let i = 0; i < backdoorNotifications.length; i++) {
      const notificationType = 'Backdoor';
      const server = backdoorNotifications[i];

      const addedNotification = await addNotificationToList(server, notificationType);
      if (addedNotification) {
        addedNotifications.push(`${helpers.alphanumericOnly(server.hostname)}${notificationType}`);
      }
    }

    let currentIndex = 0;
    while (currentIndex < currentNotifications.length) {
      const notification: string = currentNotifications[currentIndex];
      const existingIndex = backdoorNotifications.findIndex(
        (server: helpers.ServerFull) => notification == `${helpers.alphanumericOnly(server.hostname)}Backdoor`,
      );
      if (existingIndex === -1) {
        await removeFileFromList(notification);
        currentNotifications.splice(currentIndex, 1);
      }
    }

    const notificationCount = getChildren();
    helpers.updateBoxTitle(notificationsBoxId, notificationsBoxTitle, notificationCount);
    await helpers.sleep(500);
  }
}
