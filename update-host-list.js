/** @param {NS} ns */
const scriptName = 'update-host-list.js';

class Host {
  constructor(ns) {
    this.hostname = ns.args[0];
    this.parents = this.parentsFromArgs(ns);
  }

  parentsAsSet() {
    return new Set(this.parents);
  }

  parentsFromArgs(ns) {
    let parents = [];
    if (ns.args[1]) {
      parents = ns.args[1].split(',');
    }
    return parents;
  }

  setChildren(ns) {
    const hosts = ns.scan(this.hostname);
    this.children = hosts.filter((x) => !this.parentsAsSet().has(x));
  }

  dataOut() {
    return {
      hostname: this.hostname,
      parents: this.parents,
      children: this.children,
    };
  }
}

class Child {
  constructor(parent, hostname) {
    this.hostname = hostname;
    this.parents = [...parent.parents, parent.hostname];
  }

  dataOut() {
    return {
      hostname: this.hostname,
      parents: this.parents,
      children: this.children,
    };
  }
}

async function propagate(ns, host) {
  ns.scp(scriptName, host.hostname, 'home');
  ns.killall(host.hostname);
  ns.exec(scriptName, host.hostname, 1, host.hostname, host.parents.join(','));
}

export async function main(ns) {
  const self = new Host(ns);
  self.setChildren(ns);

  const hosts = [];
  for (const host of self.children) {
    const child = new Child(self, host);
    hosts.push(self.dataOut());
    hosts.push(child.dataOut());
    await propagate(ns, child);
  }

  const port = ns.getPortHandle(3);
  port.write(JSON.stringify(hosts));
}
