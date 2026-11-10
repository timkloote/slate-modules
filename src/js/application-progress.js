import { steps, scenarios, statusLabels } from './application-progress-data.js';
const picker=document.querySelector('#scenario'), list=document.querySelector('#steps'), detail=document.querySelector('#step-detail');
let selectedStep=0;
const currentScenario=()=>scenarios.find(s=>s.id===picker.value)||scenarios[0];
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
for(const s of scenarios){const option=element('option',s.title);option.value=s.id;picker.append(option);}
function renderDetail(){
 const scenario=currentScenario(), step=steps[selectedStep], state=scenario.states[selectedStep];
 detail.replaceChildren(element('p',statusLabels[state],'detail-status'),element('h3',state==='complete'&&step.doneTitle?step.doneTitle:step.title),element('p',scenario[step.id]||step.description));
 if(state==='waived')detail.append(element('p','Your deposit requirement has been waived. No payment is required.'));
 if(state==='skipped')detail.append(element('p','This step does not apply to this illustrative scenario.'));
 if(step.action&&!['upcoming','skipped','waived'].includes(state)){
  const button=element('button',step.action,'step-action arrow-link');button.type='button';button.addEventListener('click',()=>{const note=detail.querySelector('.mock-destination');if(note)return;const message=element('p','Preview only — the destination for this step will be added once confirmed.','mock-destination');message.setAttribute('role','status');detail.append(message);});detail.append(button);
 }
}
function render(){
 const scenario=currentScenario();list.replaceChildren();
 steps.forEach((step,i)=>{const state=scenario.states[i], li=element('li','');li.dataset.state=state;const button=element('button','');button.type='button';button.setAttribute('aria-pressed',String(i===selectedStep));if(state==='current')button.setAttribute('aria-current','step');button.append(element('span',state==='complete'?'✓':state==='waived'?'✓':state==='skipped'?'–':String(i+1),'node'),element('span',state==='complete'&&step.doneTitle?step.doneTitle:step.title,'step-label'),element('span',statusLabels[state],'step-status'));button.addEventListener('click',()=>{selectedStep=i;render();list.querySelectorAll('button')[i].focus();});li.append(button);list.append(li);});
 document.querySelector('#scenario-title').textContent=scenario.title;document.querySelector('#scenario-note').textContent=scenario.note;renderDetail();
}
function selectScenario(){const s=currentScenario();selectedStep=s.states.findIndex(state=>state==='action'||state==='current');if(selectedStep<0)selectedStep=steps.length-1;render();}
picker.addEventListener('change',()=>{history.replaceState(null,'',`#${picker.value}`);document.querySelector('#share-status').textContent='';selectScenario();});
function fromHash(){picker.value=scenarios.some(s=>s.id===location.hash.slice(1))?location.hash.slice(1):'missing';selectScenario();}
window.addEventListener('hashchange',fromHash);fromHash();
document.querySelector('#copy-link').addEventListener('click',async()=>{const url=new URL(location.href);url.hash=picker.value;try{await navigator.clipboard.writeText(url.href);document.querySelector('#share-status').textContent='Scenario link copied.';}catch{document.querySelector('#share-status').textContent=`Copy this link: ${url.href}`;}});
