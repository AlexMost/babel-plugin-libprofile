import { expect } from 'chai';
import * as babel from 'babel-core';
import plugin from 'src/plugin';
import fs from 'fs';

const options = {
    plugins: [[plugin, { explore: 'rx', dir: 'dist' }]],
};

describe('Basic test', () => {
    it('ImportDefaultSpecifier test', () => {
        const input = `
        import Rx from 'rx';
        Rx.map();
        Rx.flatMap();
        Rx.map();
        `;

        babel.transform(input, options).code;
        const result = fs.readFileSync('./dist/result.json').toString();
        const expected = { rx: { map: { count: 2 }, flatMap: { count: 1 } } };
        expect(JSON.parse(result)).to.eql(expected)
    });
});