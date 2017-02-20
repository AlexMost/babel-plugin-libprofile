import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

class State {
    constructor(config) {
        // initialization
        this.explore = config.explore;
        this.stats = {};
        this.dir = config.dir;
        this.fname = config.filename || 'result.json';
        this.clear();
    }
    clear() {
        this.importAliases = {};
    }
    addImportAlias(importName, alias) {
        this.importAliases[alias] = importName;
        if (!this.stats[importName]) {
            this.stats[importName] = {};
        }
    }
    getImportAlias(name) {
        return this.importAliases[name];
    }
    updateImportMemberInfo(importName, member) {
        if (this.stats[importName]) {
            if (!this.stats[importName][member]) {
                this.stats[importName][member] = { count: 0 };
            }
            this.stats[importName][member].count += 1;
        }
    }
    getDistPath() {
        if (this.dir) {
            return path.join(this.dir, this.fname);
        }
        return this.fname;
    }
    dumpStats() {
        return JSON.stringify(this.stats);
    }
    isExploredImport(importName) {
        return importName === this.explore;
    }
}

export default function () {
    let pluginState;
    return {
        post() {
            mkdirp(path.dirname(pluginState.getDistPath()));
            fs.writeFileSync(pluginState.getDistPath(), pluginState.dumpStats());
        },
        visitor: {
            Program(nodePath, state){
                if (!pluginState) {
                    pluginState = new State(state.opts);
                }
                pluginState.clear();
            },
            MemberExpression(nodePath) {
                const name = nodePath.node.object.name;
                const alias = pluginState.getImportAlias(name);
                if (alias) {
                    pluginState.updateImportMemberInfo(alias, nodePath.node.property.name);
                }
            },
            ImportDeclaration: (nodePath, state) => {
                const importName = nodePath.node.source.value;
                if (! pluginState.isExploredImport(importName)) {
                    return;
                }
                nodePath.node.specifiers.forEach((specifier) => {
                    if (specifier.type === 'ImportDefaultSpecifier') {
                        pluginState.addImportAlias(importName, specifier.local.name);
                    }
                })
            },
        },
    };
}