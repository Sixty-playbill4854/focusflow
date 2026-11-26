import {Link} from 'react-router-dom'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts'
import StudyOverview from '../components/StudyOverview'
import {useStore,todayStr} from '../context/Store'
export default function Dashboard(){
const {tasks,focus,sessions,loadDemo}=useStore(),today=todayStr(),h=new Date().getHours()
const done=tasks.filter(t=>t.status==='completed').length,pending=tasks.length-done
const overdue=tasks.filter(t=>t.status!=='completed'&&t.due&&t.due<today).length
const dayTasks=tasks.filter(t=>t.due===today),dayDone=dayTasks.filter(t=>t.status==='completed').length
const pct=dayTasks.length?Math.round(dayDone/dayTasks.length*100):0
const upcoming=tasks.filter(t=>t.status!=='completed'&&t.due>=today).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,5)
const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=todayStr(d)
return{day:d.toLocaleDateString('en',{weekday:'short'}),minutes:focus.filter(f=>todayStr(new Date(f.at))===k).reduce((s,f)=>s+f.minutes,0)}})
const stats=[['Total',tasks.length],['Completed',done],['Pending',pending],['Overdue',overdue]]
return(<div className="space-y-5">
<div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Good {h<12?'morning':h<18?'afternoon':'evening'}</h1>
<p className="text-sm text-slate-500">{new Date().toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div>
<div className="flex gap-2"><Link to="/app/tasks?new=1" className="btn">Add task</Link><Link to="/app/timer" className="btn-ghost">Start focus timer</Link></div></div>
{!tasks.length&&!focus.length&&!sessions.length&&<div className="card"><p className="font-semibold">Nothing here yet</p><p className="mb-2 text-sm text-slate-500">Get set up in three steps:</p>
<ol className="mb-3 list-decimal space-y-1 pl-5 text-sm"><li><Link to="/app/subjects" className="text-brand-600 hover:underline">Add a subject</Link> and set a weekly study goal.</li><li><Link to="/app/tasks?new=1" className="text-brand-600 hover:underline">Add a task</Link> with a due date.</li><li><Link to="/app/planner" className="text-brand-600 hover:underline">Schedule a study session</Link>, or <Link to="/app/timer" className="text-brand-600 hover:underline">start the focus timer</Link>.</li></ol>
<button className="btn-ghost" onClick={loadDemo}>Load demo data</button> <span className="text-xs text-slate-500">to explore with sample content</span></div>}
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([l,v])=><div key={l} className="card"><p className="text-sm text-slate-500">{l}</p><p className={`text-3xl font-extrabold ${l==='Overdue'&&v?'text-red-600':''}`}>{v}</p></div>)}</div>
<div className="grid gap-4 md:grid-cols-3">
<div className="card"><p className="text-sm text-slate-500">Today's completion</p><p className="text-3xl font-extrabold">{pct}%</p>
<div className="mt-2 h-2 rounded bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuenow={pct}><div className="h-2 rounded bg-emerald-500" style={{width:pct+'%'}}/></div>
<p className="mt-2 text-xs text-slate-500">{dayDone} of {dayTasks.length} tasks due today</p></div>
<div className="card md:col-span-2"><p className="mb-2 text-sm font-semibold">Focus minutes, last 7 days</p>
<div className="h-44"><ResponsiveContainer><BarChart data={week}><XAxis dataKey="day" fontSize={12} tickLine={false}/><YAxis fontSize={12} width={30} allowDecimals={false}/><Tooltip/><Bar dataKey="minutes" fill="#6366f1" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div></div>
<StudyOverview/>
<div className="card"><p className="mb-2 text-sm font-semibold">Upcoming deadlines</p>{upcoming.length?<ul className="divide-y divide-slate-100 dark:divide-slate-800">{upcoming.map(t=><li key={t.id} className="flex justify-between py-2 text-sm"><span>{t.title}</span><span className="text-slate-500">{t.due}</span></li>)}</ul>:<p className="text-sm text-slate-500">No upcoming deadlines.</p>}</div></div>)}
