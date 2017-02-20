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
        this.aliases = {};
    }
    maybeAddAlias(source, alias) {
        if (source === this.explore) {
            this.aliases[alias] = source;
            if (!this.stats[source]) {
                this.stats[source] = {};
            }
        }
    }
    getAlias(name) {
        return this.aliases[name];
    }
    updateSource(source, member) {
        if (this.stats[source]) {
            if (!this.stats[source][member]) {
                this.stats[source][member] = { count: 0 };
            }
            this.stats[source][member].count += 1;
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
                const alias = pluginState.getAlias(name);
                if (alias) {
                    pluginState.updateSource(alias, nodePath.node.property.name);
                }
            },
            ImportDeclaration: (nodePath, state) => {
                const specifiers = nodePath.node.specifiers;
                const sourceName = nodePath.node.source.value;
                specifiers.forEach((specifier) => {
                    if (specifier.type === 'ImportDefaultSpecifier') {
                        pluginState.maybeAddAlias(sourceName, specifier.local.name);
                    }
                })
            },
        },
    };
}