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
 let copied='';
 runInNewContext(script,{document,steps,scenarios,statusLabels,location,URL,history:{replaceState(a,b,hash){location.hash=hash;}},window:{addEventListener(type,fn){callbacks[type]=fn;}},navigator:{clipboard:{async writeText(text){copied=text;}}}});
 const picker=document.querySelector('#scenario');
 assert.equal(picker.querySelectorAll('option').length,13);
 for(const scenario of scenarios){
  assert.equal(scenario.states.length,steps.length);
  picker.value=scenario.id;picker.dispatchEvent(new window.Event('change'));
  assert.equal(document.querySelectorAll('#steps li').length,8);
  assert.equal(document.querySelector('#scenario-title').textContent,scenario.title);
  scenario.states.forEach((state,i)=>assert.equal(document.querySelectorAll('#steps li')[i].dataset.state,state));
 }
 picker.value='revised-award';picker.dispatchEvent(new window.Event('change'));
 assert.match(document.querySelector('#step-detail').textContent,/Review Award Letter/);
 assert.equal(document.querySelectorAll('#steps button')[4].getAttribute('aria-pressed'),'true');
 document.querySelector('.step-action').click();
 assert.match(document.querySelector('.mock-destination').textContent,/Preview only/);
 document.querySelectorAll('#steps button')[6].click();
 assert.match(document.querySelector('#step-detail').textContent,/Pay Your Deposit/);
 document.querySelector('#copy-link').click();await new Promise(resolve=>setImmediate(resolve));
 assert.match(copied,/#revised-award$/);
 location.hash='#invalid';callbacks.hashchange();
 assert.equal(picker.value,'missing');
});
