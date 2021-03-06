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
        import test from 'test';
        Rx.map();
        Rx.flatMap();
        Rx.map();
        Rx.map;
        test.map();
        `;

        babel.transform(input, options).code;
        const result = fs.readFileSync('./dist/libprofile.json').toString();
        const expected = { rx: { map: { count: 2 }, flatMap: { count: 1 } } };
        expect(JSON.parse(result)).to.eql(expected)
    });
});