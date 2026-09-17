import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inventory} from '../scripts/simulator.js';
import {moduleForSource,resolveLegacyCss} from '../src/js/simulator-preview.js';

test('all audited legacy files are matched and read without modification',()=>{
 const modules=inventory().views.flatMap(v=>v.modules);
 assert.equal(modules.filter(m=>m.legacySource).length,217);
 assert.equal(new Set(modules.map(m=>m.legacySource)).size,217);
 for(const module of modules)assert.equal(module.legacyHtml,readFileSync(module.legacySource,'utf8'));
});

test('legacy selection bypasses sanitized substitutions and fixtures and reports missing files',()=>{
 const module={type:'Static Content',html:'fixture',hasFixture:true,replacement:'header',legacySource:'old.html',legacyHtml:'original'};
 const legacy=moduleForSource(module,true);
 assert.equal(legacy.html,'original');assert.equal(legacy.replacement,null);assert.equal(legacy.hasFixture,false);
 assert.equal(moduleForSource(module,false),module);
 assert.equal(moduleForSource({...module,legacySource:null,legacyHtml:''},true).missingSource,true);
});

test('legacy CSS uses CDN paths while preserving absolute, data, and fragment URLs',()=>{
 assert.equal(resolveLegacyCss('a{background:url(/images/a.png)}'), 'a{background:url("https://enroll-northeastern-edu.cdn.technolutions.net/images/a.png")}');
 assert.equal(resolveLegacyCss('@import "/shared/build.css";'), '@import "https://enroll-northeastern-edu.cdn.technolutions.net/shared/build.css";');
 for(const css of ['a{background:url("https://example.com/a.png")}', 'a{mask:url(#mask)}', 'a{background:url(data:image/png;base64,abcd)}'])assert.equal(resolveLegacyCss(css),css);
});
