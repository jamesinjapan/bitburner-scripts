/** @param {NS} ns */
const scriptName = 'update-server-list.js';

class Server {
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
    const servers = ns.scan(this.hostname);
    this.children = servers.filter((x) => !this.parentsAsSet().has(x));
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

async function propagate(ns, server) {
  ns.scp(scriptName, server.hostname, 'home');
  ns.killall(server.hostname);
  ns.exec(scriptName, server.hostname, 1, server.hostname, server.parents.join(','));
}

async function listFiles(ns, server) {
  const remoteFiles = ns.ls(server);
  const otherFiles = {};
  for (const file of remoteFiles) {
    if (ns.fileExists(file, 'home')) continue;
    try {
      ns.scp(file, 'home', server);
    } catch {
      if (!otherFiles.hasOwnProperty(server)) {
        otherFiles[server] = [file];
      } else {
        otherFiles[server].push(file);
      }
    }
  }

  if (Object.keys(otherFiles).length > 0) {
    const port = ns.getPortHandle(4);
    port.write(JSON.stringify(otherFiles));
  }
}

export async function main(ns) {
  const self = new Server(ns);
  self.setChildren(ns);

  const servers = [];
  for (const server of self.children) {
    const child = new Child(self, server);
    servers.push(self.dataOut());
    servers.push(child.dataOut());
    await listFiles(ns, server);
    await propagate(ns, child);
  }

  const port = ns.getPortHandle(3);
  port.write(JSON.stringify(servers));
}
