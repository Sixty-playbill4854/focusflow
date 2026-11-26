import {Link} from 'react-router-dom'
import {useStore,todayStr} from '../context/Store'
import {byTime,weekStart,weekHours,r1} from '../utils/stats'
export default function StudyOverview(){
const {sessions,subjects}=useStore(),today=todayStr(),ws=weekStart(today)
const name=id=>subjects.find(s=>s.id===id)?.name||'No subject'
const todays=sessions.filter(s=>s.date===today).sort(byTime),next=sessions.filter(s=>s.date>today).sort(byTime).slice(0,4)
const total=weekHours(sessions,ws),goal=subjects.reduce((t,s)=>t+(s.goal||0),0),pct=goal?Math.min(100,total/goal*100):0
const List=({items,date})=>items.length?<ul className="space-y-1 text-sm">{items.map(s=><li key={s.id} className="flex justify-between gap-2"><span className="truncate">{name(s.subjectId)}</span><span className="shrink-0 text-slate-500">{date&&s.date.slice(5)+' '}{s.start}–{s.end}</span></li>)}</ul>:null
return(<div className="grid gap-4 md:grid-cols-2">
<div className="card"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Today's study schedule</p><Link to="/app/planner" className="text-sm text-brand-600 hover:underline">Open planner</Link></div>
{todays.length?<List items={todays}/>:<p className="text-sm text-slate-500">Nothing scheduled today.</p>}
{next.length>0&&<><p className="mb-1 mt-3 text-sm font-semibold">Upcoming sessions</p><List items={next} date/></>}</div>
<div className="card"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Weekly study progress</p><Link to="/app/analytics" className="text-sm text-brand-600 hover:underline">View analytics</Link></div>
<p className="text-2xl font-extrabold">{total}h <span className="text-sm font-normal text-slate-500">{goal?`of ${goal}h goal`:'scheduled this week'}</span></p>
{goal>0&&<div className="mt-2 h-2 rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded bg-brand-600" style={{width:pct+'%'}}/></div>}
<ul className="mt-3 space-y-2">{subjects.slice(0,4).map(s=>{const h=weekHours(sessions,ws,s.id),p=s.goal?Math.min(100,h/s.goal*100):0
return<li key={s.id} className="text-xs"><div className="flex justify-between"><span>{s.name}</span><span className="text-slate-500">{h}/{s.goal}h</span></div><div className="mt-1 h-1.5 rounded bg-slate-200 dark:bg-slate-800"><div className="h-1.5 rounded" style={{width:p+'%',background:s.color}}/></div></li>})}</ul></div></div>)}
