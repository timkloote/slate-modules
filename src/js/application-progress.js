import { steps, scenarios, statusLabels } from './application-progress-data.js';
const picker=document.querySelector('#scenario'), list=document.querySelector('#steps'), detail=document.querySelector('#step-detail');
let selectedStep=0;
const currentScenario=()=>scenarios.find(s=>s.id===picker.value)||scenarios[0];
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
for(const s of scenarios){const option=element('option',s.title);option.value=s.id;picker.append(option);}
function fillDetail(detail,index,scenario=currentScenario()){
 const step=steps[index], state=scenario.states[index];
 detail.dataset.state=state;
 detail.replaceChildren(element('p',statusLabels[state],'detail-status'),element('h3',state==='complete'&&step.doneTitle?step.doneTitle:step.title),element('p',scenario[step.id]||step.description));
 if(state==='waived')detail.append(element('p','Your deposit requirement has been waived. No payment is required.'));
 if(state==='skipped')detail.append(element('p','This step does not apply to this illustrative scenario.'));
 if(step.action&&!['upcoming','skipped','waived'].includes(state)){
  const button=element('button',step.action,'step-action arrow-link');button.type='button';button.addEventListener('click',()=>{const note=detail.querySelector('.mock-destination');if(note)return;const message=element('p','Preview only — the destination for this step will be added once confirmed.','mock-destination');message.setAttribute('role','status');detail.append(message);});detail.append(button);
 }
}

const displayMode=document.querySelector('#display-mode'), allTrackers=document.querySelector('#all-trackers'), singleTracker=document.querySelector('section.tracker');
const activeStep=scenario=>{const index=scenario.states.findIndex(state=>state==='action'||state==='current');return index<0?steps.length-1:index;};
function renderSteps(target,scenario,selected,onSelect){
 target.replaceChildren();
 steps.forEach((step,i)=>{
  const state=scenario.states[i], li=element('li','');li.dataset.state=state;
  const button=element('button','');button.type='button';button.setAttribute('aria-pressed',String(i===selected));
  if(state==='current')button.setAttribute('aria-current','step');
  button.append(element('span',['complete','waived'].includes(state)?'✓':state==='skipped'?'–':String(i+1),'node'),element('span',state==='complete'&&step.doneTitle?step.doneTitle:step.title,'step-label'),element('span',statusLabels[state],'step-status'));
  button.addEventListener('click',()=>onSelect(i));li.append(button);target.append(li);
 });
}
function render(){
 const showAll=displayMode.value==='all';singleTracker.hidden=showAll;allTrackers.hidden=!showAll;picker.disabled=showAll;
 if(!showAll){
  renderSteps(list,currentScenario(),selectedStep,i=>{selectedStep=i;render();list.querySelectorAll('button')[i].focus();});
  fillDetail(detail,selectedStep);return;
 }
 allTrackers.replaceChildren();
 scenarios.forEach(scenario=>{
  const wrapper=element('div','','scenario-module');
  wrapper.append(element('h2',scenario.title,'scenario-module-title'));
  const section=element('section','','tracker');
  const heading=element('h2','Track your application');heading.id=`tracker-title-${scenario.id}`;section.setAttribute('aria-labelledby',heading.id);
  const header=element('div','','tracker-heading');header.append(heading);
  const row=element('ol','','tracker-steps');row.setAttribute('aria-label','Application progress');
  const content=element('div','','step-detail');content.setAttribute('aria-live','polite');
  const update=index=>{renderSteps(row,scenario,index,i=>{update(i);row.querySelectorAll('button')[i].focus();});fillDetail(content,index,scenario);};
  update(activeStep(scenario));
  section.append(header,element('p','Follow your progress and explore each step for more information.','tracker-intro'),row,content);
  wrapper.append(section);allTrackers.append(wrapper);
 });
}
displayMode.addEventListener('change',render);

function selectScenario(){const s=currentScenario();selectedStep=s.states.findIndex(state=>state==='action'||state==='current');if(selectedStep<0)selectedStep=steps.length-1;render();}
picker.addEventListener('change',()=>{history.replaceState(null,'',`#${picker.value}`);selectScenario();});
function fromHash(){picker.value=scenarios.some(s=>s.id===location.hash.slice(1))?location.hash.slice(1):'missing';selectScenario();}
window.addEventListener('hashchange',fromHash);fromHash();
