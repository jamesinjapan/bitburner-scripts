import { createSidebarItem, doc, sidebar } from './box.js';
/** @param {NS} ns */

const overviewBoxId = 'overview-box';

let focusFn,
  saveBtn = doc.querySelector('button[aria-label="save game"]'),
  saveFn = saveBtn[Object.keys(saveBtn)[1]].onClick;

function removeOldSidebarItems() {
  const doc = eval('document');
  const box = doc.getElementById(overviewBoxId);
  if (box) {
    box.parentNode.parentNode.remove();
  }
}

function autoResizeBox() {
  const doc = eval('document');
  const node = doc.getElementById(overviewBoxId);
  const container = node.parentNode.parentNode;
  container.style.height = '';
  container.style.height = `${container.style.offsetHeight} px`;
}

export let main = (ns) => {
  removeOldSidebarItems();
  let item = createSidebarItem(
    'Overview</span><span class=icon name=save>\ueb4b',
    `<style>.react-draggable:first-of-type{display:none}.sb .overview{padding:10px;font-size:14px}.sb .overview table{display:table}</style><div id=${overviewBoxId} class=overview>${
      doc.querySelector('.react-draggable:first-of-type table').outerHTML
    }</div>`,
    '\ueb03',
  );
  item.querySelector('[name=save]').addEventListener('mousedown', (e) => e.stopPropagation() || saveFn());
  let overview = item.querySelector('.overview');
  let interval = setInterval(() => {
    if (!sidebar.contains(item)) return clearInterval(interval);
    overview.innerHTML = doc.querySelector('.react-draggable:first-of-type table').outerHTML;
    let focusBtn = overview.querySelector('button');
    if (focusBtn) {
      if (focusFn) return focusBtn.addEventListener('click', focusFn);
      let f = doc.querySelector('.react-draggable:first-of-type tbody tr:last-of-type button');
      focusFn = f[Object.keys(f)[1]].onClick;
      focusBtn.addEventListener('click', focusFn);
      autoResizeBox();
    }
  }, 500);
};
