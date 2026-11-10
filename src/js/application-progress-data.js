/** Review mockup only. Edit steps and scenarios here; no applicant data or Slate logic. */
export const steps = [
 { id:'application', title:'Submit Your Application', doneTitle:'Application Received', action:'View application', description:'Submit your application to begin the admissions process.' },
 { id:'checklist', title:'Complete Your Checklist', action:'View checklist', description:'We are awaiting materials such as official transcripts, recommendations, or English language test scores.' },
 { id:'review', title:'Application Under Review', description:'Your application is complete and waiting for an admission decision. We’ll contact you if we need anything else.' },
 { id:'decision', title:'Review Decision Letter', action:'View decision letter', description:'Your decision letter is available in your portal.' },
 { id:'award', title:'Review Award Letter', action:'View award letter', description:'Review the scholarships listed in your award letter. A revised award may require another review.' },
 { id:'confirm', title:'Confirm Your Enrollment', action:'Reply to your offer', description:'Select your primary program and submit your enrollment response.' },
 { id:'deposit', title:'Pay Your Deposit', action:'View deposit details', description:'Pay your enrollment deposit, or review your deposit waiver.' },
 { id:'registration', title:'Register for Classes', action:'View registration', description:'Registration details will appear here when registration opens.' },
];
const scenario = (id,title,states,note,options={}) => ({id,title,states,note,...options});
export const scenarios = [
 scenario('started','Application started',['current','upcoming','upcoming','upcoming','upcoming','upcoming','upcoming','upcoming'],'An application has been started but not submitted. EDGE/FastApps may need a separate path.'),
 scenario('missing','Missing documents',['complete','action','upcoming','upcoming','upcoming','upcoming','upcoming','upcoming'],'Application received; checklist materials are outstanding.'),
 scenario('review','Under review',['complete','complete','current','upcoming','upcoming','upcoming','upcoming','upcoming'],'Application complete; awaiting a decision.'),
 scenario('decision','Decision available · admit',['complete','complete','complete','action','upcoming','upcoming','upcoming','upcoming'],'An admit decision is available. This example proceeds to enrollment; other decisions branch below.'),
 scenario('award','Award letter available',['complete','complete','complete','complete','action','upcoming','upcoming','upcoming'],'Award viewing and revised-award detection are proposed behavior; Slate support is unconfirmed.'),
 scenario('revised-award','Revised award · review again',['complete','complete','complete','complete','action','complete','complete','upcoming'],'A new award returns this step to action required, even after later steps are complete.'),
 scenario('confirm','Confirm enrollment',['complete','complete','complete','complete','complete','action','upcoming','upcoming'],'Enrollment confirmation and deposit are shown separately for review. Their completion rules still need agreement.'),
 scenario('deposit','Deposit due',['complete','complete','complete','complete','complete','complete','action','upcoming'],'Enrollment response submitted; deposit remains due.'),
 scenario('waived','Deposit waived · no award',['complete','complete','complete','complete','skipped','complete','waived','upcoming'],'A waiver completes the deposit requirement. No award letter is applicable in this example.'),
 scenario('registration','Registration open',['complete','complete','complete','complete','complete','complete','complete','current'],'Registration is available; this step becomes complete after registration is confirmed.'),
 scenario('registered','Registered for classes',['complete','complete','complete','complete','complete','complete','complete','complete'],'All illustrated steps complete.'),
 scenario('deny','Decision available · deny',['complete','complete','complete','action','skipped','skipped','skipped','skipped'],'Enrollment steps do not apply to this decision. Exact wording and visibility remain under review.',{decision:'Your decision letter is available. Please review your letter for the outcome of your application.'}),
 scenario('redirect','Decision available · redirect',['complete','complete','complete','action','skipped','skipped','skipped','skipped'],'A redirect may require its own next steps; they have not been defined.',{decision:'Please review your decision letter for information about your application and any next steps.'}),
];
export const statusLabels = { complete:'Complete', current:'Current step', action:'Action required', upcoming:'Not yet available', skipped:'Not applicable', waived:'Waived' };
