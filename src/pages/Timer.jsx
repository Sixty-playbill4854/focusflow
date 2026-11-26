import {useEffect,useState} from 'react'
import {Play,Pause,RotateCcw} from 'lucide-react'
import {useStore,todayStr} from '../context/Store'
const TK='focusflow:timer'
const MODES={focus:'Focus',short:'Short break',long:'Long break'}
export default function Timer(){
const {settings,tasks,focus,add,notify}=useStore()
const total=m=>settings[m]*60000
const [t,setT]=useState(()=>{try{const s=JSON.parse(localStorage.getItem(TK));if(s&&s.mode)return s}catch{}return{mode:'focus',running:false,endsAt:0,left:null,taskId:''}})
const [now,setNow]=useState(Date.now())
useEffect(()=>{localStorage.setItem(TK,JSON.stringify(t))},[t])
const left=t.running?Math.max(0,t.endsAt-now):(t.left??total(t.mode))
useEffect(()=>{if(!t.running)return;const i=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(i)},[t.running])
useEffect(()=>{if(t.running&&left<=0){if(t.mode==='focus')add('focus',{minutes:settings.focus,at:Date.now(),taskId:t.taskId})
if(settings.notify)notify(`${MODES[t.mode]} finished`);setT({...t,running:false,left:null})}},[left,t.running])
const start=()=>{const n=Date.now();setNow(n);setT({...t,running:true,endsAt:n+left})}
const pause=()=>setT({...t,running:false,left:Math.max(0,t.endsAt-Date.now())})
const reset=()=>setT({...t,running:false,left:null})
const mode=m=>setT({...t,mode:m,running:false,left:null})
const mm=String(Math.floor(left/60000)).padStart(2,'0'),ss=String(Math.floor(left/1000)%60).padStart(2,'0')
const pct=100-left/total(t.mode)*100,today=todayStr()
const todays=focus.filter(f=>todayStr(new Date(f.at))===today)
return(<div className="mx-auto max-w-md space-y-4"><h1 className="text-2xl font-extrabold">Focus Timer</h1>
<div className="card text-center">
<div className="mb-4 flex justify-center gap-1" role="tablist">{Object.entries(MODES).map(([k,l])=><button key={k} role="tab" aria-selected={t.mode===k} onClick={()=>mode(k)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${t.mode===k?'bg-brand-700 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{l}</button>)}</div>
<p className="text-6xl font-extrabold tabular-nums">{mm}:{ss}</p>
<div className="mx-auto mt-4 h-2 max-w-xs rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded bg-accent" style={{width:pct+'%'}}/></div>
<div className="mt-5 flex justify-center gap-2">{t.running?<button className="btn" onClick={pause}><Pause size={16}/>Pause</button>:<button className="btn" onClick={start}><Play size={16}/>{left<total(t.mode)?'Resume':'Start'}</button>}
<button className="btn-ghost" onClick={reset}><RotateCcw size={16}/>Reset</button></div>
<div className="mt-4 text-left"><label className="label" htmlFor="tk">Working on (optional)</label><select id="tk" className="input" value={t.taskId} onChange={e=>setT({...t,taskId:e.target.value})}><option value="">No task</option>{tasks.filter(x=>x.status!=='completed').map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></div></div>
<p className="text-sm text-slate-500">Choose a task if you like, press Start, and work until the timer ends. Finished focus sessions are logged on your dashboard and in Analytics. Change the durations in Settings.</p>
<div className="card text-sm">Today: <b>{todays.length}</b> focus sessions · <b>{todays.reduce((s,f)=>s+f.minutes,0)}</b> minutes</div></div>)}
