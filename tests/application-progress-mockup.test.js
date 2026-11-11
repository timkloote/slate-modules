import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {parseHTML} from 'linkedom';
import page from '../src/application-progress.11ty.js';
import {steps,scenarios,statusLabels} from '../src/js/application-progress-data.js';

test('review mockup renders all scenarios and lets reviewers inspect steps', async()=>{
 const {document,window}=parseHTML(page());
 const proto=Object.getPrototypeOf(document.createElement('select'));
 Object.defineProperty(proto,'value',{configurable:true,get(){return this._value;},set(value){this._value=value;}});
 const location={href:'https://example.com/slate-modules/drafts/application-progress/',hash:'#revised-award'};
 const callbacks={};
 const script=readFileSync('src/js/application-progress.js','utf8').replace(/^import .*;\n/,'');
 runInNewContext(script,{document,steps,scenarios,statusLabels,location,URL,history:{replaceState(a,b,hash){location.hash=hash;}},window:{addEventListener(type,fn){callbacks[type]=fn;}}});
 const picker=document.querySelector('#scenario');
 assert.equal(picker.querySelectorAll('option').length,13);
 for(const scenario of scenarios){
  assert.equal(scenario.states.length,steps.length);
  picker.value=scenario.id;picker.dispatchEvent(new window.Event('change'));
  assert.equal(document.querySelectorAll('#steps li').length,8);
  scenario.states.forEach((state,i)=>assert.equal(document.querySelectorAll('#steps li')[i].dataset.state,state));
 }
 picker.value='revised-award';picker.dispatchEvent(new window.Event('change'));
 assert.match(document.querySelector('#step-detail').textContent,/Review Award Letter/);
 assert.equal(document.querySelectorAll('#steps button')[4].getAttribute('aria-pressed'),'true');
 document.querySelector('.step-action').click();
 assert.match(document.querySelector('.mock-destination').textContent,/Preview only/);
 document.querySelectorAll('#steps button')[6].click();
 assert.match(document.querySelector('#step-detail').textContent,/Pay Your Deposit/);
 assert.equal(location.hash,'#revised-award');
 const mode=document.querySelector('#display-mode');
 mode.value='all';mode.dispatchEvent(new window.Event('change'));
 assert.equal(document.querySelector('section.tracker').hidden,true);
 assert.equal(document.querySelectorAll('#all-trackers section.tracker').length,scenarios.length);
 assert.equal(document.querySelectorAll('#all-trackers .tracker-steps li').length,scenarios.length*steps.length);
 assert.equal(document.querySelectorAll('#all-trackers .eyebrow').length,0);
 const waived=[...document.querySelectorAll('.scenario-module')].find(node=>node.querySelector('h2').textContent==='Deposit waived · no award');
 waived.querySelectorAll('.tracker-steps button')[6].click();
 assert.match(waived.querySelector('.step-detail').textContent,/No payment is required/);
 assert.equal(new Set([...document.querySelectorAll('[id]')].map(node=>node.id)).size,document.querySelectorAll('[id]').length);
 mode.value='single';mode.dispatchEvent(new window.Event('change'));
 assert.equal(document.querySelector('section.tracker').hidden,false);
 assert.equal(document.querySelector('#all-trackers').hidden,true);
 location.hash='#invalid';callbacks.hashchange();
 assert.equal(picker.value,'missing');
});
