import {BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer} from 'recharts'
import {useStore,todayStr} from '../context/Store'
import {addDays,weekStart,toDate,hours,r1,inRange,weekHours} from '../utils/stats'
const TT={contentStyle:{background:'#1e293b',color:'#fff',border:0,borderRadius:6,fontSize:12},itemStyle:{color:'#fff'}}
const tick={fill:'#94a3b8',fontSize:12}
const Card=({title,empty,children})=><div className="card"><p className="mb-2 text-sm font-semibold">{title}</p>{empty?<p className="flex h-44 items-center justify-center text-center text-sm text-slate-500">Not enough data yet. Add tasks, sessions or run a focus timer.</p>:<div className="h-52"><ResponsiveContainer>{children}</ResponsiveContainer></div>}</div>
export default function Analytics(){
const {tasks,subjects,sessions,focus,loadDemo}=useStore(),today=todayStr(),ws=weekStart(today)
const dk=ts=>todayStr(new Date(ts))
const days=n=>Array.from({length:n},(_,i)=>addDays(today,i-n+1))
const lbl=d=>toDate(d).toLocaleDateString('en',{weekday:'short'})
const wk=days(7).map(d=>({day:lbl(d),hours:r1(sessions.filter(s=>s.date===d).reduce((t,s)=>t+hours(s),0))}))
const fm=days(14).map(d=>({day:toDate(d).getDate(),minutes:focus.filter(f=>dk(f.at)===d).reduce((t,f)=>t+f.minutes,0)}))
const tc=days(7).map(d=>({day:lbl(d),completed:tasks.filter(t=>t.completedAt&&dk(t.completedAt)===d).length}))
const trend=[3,2,1,0].map(i=>{const a=addDays(ws,-7*i),b=addDays(a,6);return{week:toDate(a).toLocaleDateString('en',{month:'short',day:'numeric'}),'Focus min':focus.filter(f=>inRange(dk(f.at),a,b)).reduce((t,f)=>t+f.minutes,0),'Study h':weekHours(sessions,a),'Tasks done':tasks.filter(t=>t.completedAt&&inRange(dk(t.completedAt),a,b)).length}})
const dist=subjects.map(s=>({name:s.name,color:s.color,value:weekHours(sessions,ws,s.id)})).filter(x=>x.value>0)
const done=tasks.filter(t=>t.status==='completed').length,rate=tasks.length?Math.round(done/tasks.length*100):0
if(!tasks.length&&!sessions.length&&!focus.length)return(<div className="space-y-4"><h1 className="text-2xl font-extrabold">Analytics</h1><div className="card text-center"><p className="font-semibold">No data to analyse yet</p><p className="mb-3 text-sm text-slate-500">Charts appear as you add tasks, schedule sessions and complete focus timers.</p><button className="btn" onClick={loadDemo}>Load demo data</button></div></div>)
return(<div className="space-y-4"><h1 className="text-2xl font-extrabold">Analytics</h1>
<div className="grid gap-3 sm:grid-cols-3"><div className="card"><p className="text-sm text-slate-500">Task completion rate</p><p className="text-3xl font-extrabold">{rate}%</p><p className="text-xs text-slate-500">{done} of {tasks.length} tasks</p></div>
<div className="card"><p className="text-sm text-slate-500">Study hours this week</p><p className="text-3xl font-extrabold">{weekHours(sessions,ws)}h</p></div>
<div className="card"><p className="text-sm text-slate-500">Focus minutes today</p><p className="text-3xl font-extrabold">{focus.filter(f=>dk(f.at)===today).reduce((t,f)=>t+f.minutes,0)}</p></div></div>
<div className="grid gap-4 md:grid-cols-2">
<Card title="Weekly study hours (scheduled, last 7 days)" empty={!wk.some(x=>x.hours)}><BarChart data={wk}><XAxis dataKey="day" tick={tick} tickLine={false}/><YAxis tick={tick} width={30}/><Tooltip {...TT}/><Bar dataKey="hours" fill="#4338ca" radius={[4,4,0,0]}/></BarChart></Card>
<Card title="Daily focus minutes (last 14 days)" empty={!fm.some(x=>x.minutes)}><BarChart data={fm}><XAxis dataKey="day" tick={tick} tickLine={false}/><YAxis tick={tick} width={30}/><Tooltip {...TT}/><Bar dataKey="minutes" fill="#8b5cf6" radius={[4,4,0,0]}/></BarChart></Card>
<Card title="Tasks completed (last 7 days)" empty={!tc.some(x=>x.completed)}><BarChart data={tc}><XAxis dataKey="day" tick={tick} tickLine={false}/><YAxis tick={tick} width={30} allowDecimals={false}/><Tooltip {...TT}/><Bar dataKey="completed" fill="#10b981" radius={[4,4,0,0]}/></BarChart></Card>
<Card title="Study distribution by subject (this week)" empty={!dist.length}><PieChart><Pie data={dist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75}>{dist.map(d=><Cell key={d.name} fill={d.color}/>)}</Pie><Tooltip {...TT}/><Legend/></PieChart></Card></div>
<Card title="Weekly productivity trend (last 4 weeks)" empty={trend.every(t=>!t['Focus min']&&!t['Study h']&&!t['Tasks done'])}><LineChart data={trend}><XAxis dataKey="week" tick={tick}/><YAxis tick={tick} width={30}/><Tooltip {...TT}/><Legend/><Line dataKey="Focus min" stroke="#8b5cf6" strokeWidth={2}/><Line dataKey="Study h" stroke="#4338ca" strokeWidth={2}/><Line dataKey="Tasks done" stroke="#10b981" strokeWidth={2}/></LineChart></Card>
<div className="card"><p className="mb-3 text-sm font-semibold">Study goal progress (this week)</p>{subjects.length?<ul className="space-y-3">{subjects.map(s=>{const h=weekHours(sessions,ws,s.id),p=s.goal?Math.min(100,h/s.goal*100):0;return<li key={s.id} className="text-sm"><div className="flex justify-between"><span>{s.name}</span><span className="text-slate-500">{h} / {s.goal}h</span></div><div className="mt-1 h-2 rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded" style={{width:p+'%',background:s.color}}/></div></li>})}</ul>:<p className="text-sm text-slate-500">Add subjects with weekly goals to track progress.</p>}</div></div>)}
