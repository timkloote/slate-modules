import { steps, scenarios, statusLabels } from './application-progress-data.js';
const picker=document.querySelector('#scenario'), list=document.querySelector('#steps'), detail=document.querySelector('#step-detail');
let selectedStep=0;
const currentScenario=()=>scenarios.find(s=>s.id===picker.value)||scenarios[0];
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
for(const s of scenarios){const option=element('option',s.title);option.value=s.id;picker.append(option);}
function fillDetail(detail,index){
 const scenario=currentScenario(), step=steps[index], state=scenario.states[index];
 detail.dataset.state=state;
 detail.replaceChildren(element('p',statusLabels[state],'detail-status'),element('h3',state==='complete'&&step.doneTitle?step.doneTitle:step.title),element('p',scenario[step.id]||step.description));
 if(state==='waived')detail.append(element('p','Your deposit requirement has been waived. No payment is required.'));
 if(state==='skipped')detail.append(element('p','This step does not apply to this illustrative scenario.'));
 if(step.action&&!['upcoming','skipped','waived'].includes(state)){
  const button=element('button',step.action,'step-action arrow-link');button.type='button';button.addEventListener('click',()=>{const note=detail.querySelector('.mock-destination');if(note)return;const message=element('p','Preview only — the destination for this step will be added once confirmed.','mock-destination');message.setAttribute('role','status');detail.append(message);});detail.append(button);
 }
}
const displayMode=document.querySelector('#display-mode'), allDetails=document.querySelector('#all-step-details');
function renderDetail(){
 const showAll=displayMode.value==='all';
 detail.hidden=showAll;allDetails.hidden=!showAll;
 if(!showAll){fillDetail(detail,selectedStep);return;}
 allDetails.replaceChildren();
 steps.forEach((step,index)=>{
  const card=element('section','','step-detail step-module');
  fillDetail(card,index);
  card.prepend(element('p',`Step ${index+1}`,'module-number'));
  allDetails.append(card);
 });
}
displayMode.addEventListener('change',renderDetail);

function render(){
 const scenario=currentScenario();list.replaceChildren();
 steps.forEach((step,i)=>{const state=scenario.states[i], li=element('li','');li.dataset.state=state;const button=element('button','');button.type='button';button.setAttribute('aria-pressed',String(i===selectedStep));if(state==='current')button.setAttribute('aria-current','step');button.append(element('span',state==='complete'?'✓':state==='waived'?'✓':state==='skipped'?'–':String(i+1),'node'),element('span',state==='complete'&&step.doneTitle?step.doneTitle:step.title,'step-label'),element('span',statusLabels[state],'step-status'));button.addEventListener('click',()=>{selectedStep=i;render();list.querySelectorAll('button')[i].focus();});li.append(button);list.append(li);});
 renderDetail();
}
function selectScenario(){const s=currentScenario();selectedStep=s.states.findIndex(state=>state==='action'||state==='current');if(selectedStep<0)selectedStep=steps.length-1;render();}
picker.addEventListener('change',()=>{history.replaceState(null,'',`#${picker.value}`);selectScenario();});
function fromHash(){picker.value=scenarios.some(s=>s.id===location.hash.slice(1))?location.hash.slice(1):'missing';selectScenario();}
window.addEventListener('hashchange',fromHash);fromHash();
