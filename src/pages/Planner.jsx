import {useState} from 'react'
import {Link} from 'react-router-dom'
import {ChevronLeft,ChevronRight,Plus,Pencil,Trash2,AlertTriangle} from 'lucide-react'
import Modal from '../components/Modal'
import {useStore,todayStr} from '../context/Store'
import {addDays,weekStart,toDate,byTime,hours,mins,overlaps,r1} from '../utils/stats'
function Form({s,date,onSave,onClose}){
const {subjects,sessions}=useStore(),[f,setF]=useState(s||{subjectId:subjects[0]?.id||'',date,start:'09:00',end:'10:00',notes:''}),[err,setErr]=useState('')
const set=k=>e=>setF({...f,[k]:e.target.value})
const valid=f.date&&f.start&&f.end&&mins(f.end)>mins(f.start)
const clash=valid?sessions.filter(x=>overlaps({...f,id:s?.id},x)):[]
const submit=e=>{e.preventDefault();if(!f.subjectId)return setErr('Choose a subject.');if(!valid)return setErr('Enter a date, and an end time after the start time.');onSave(f)}
return(<form onSubmit={submit} className="space-y-3" noValidate>
<div><label className="label" htmlFor="ps">Subject</label><select id="ps" className="input" value={f.subjectId} onChange={set('subjectId')}>{subjects.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
<div><label className="label" htmlFor="pd">Date</label><input id="pd" type="date" className="input" value={f.date} onChange={set('date')}/></div>
<div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="pa">Start</label><input id="pa" type="time" className="input" value={f.start} onChange={set('start')}/></div><div><label className="label" htmlFor="pb">End</label><input id="pb" type="time" className="input" value={f.end} onChange={set('end')}/></div></div>
<div><label className="label" htmlFor="pn">Notes (optional)</label><input id="pn" className="input" value={f.notes} onChange={set('notes')}/></div>
{clash.length>0&&<p role="alert" className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"><AlertTriangle size={16}/>Overlaps {clash.length} existing session(s). You can still save.</p>}
{err&&<p role="alert" className="text-sm text-red-600">{err}</p>}
<div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn">Save session</button></div></form>)}
export default function Planner(){
const {sessions,subjects,add,update,remove,notify}=useStore(),today=todayStr()
const [anchor,setAnchor]=useState(today),[view,setView]=useState('week'),[modal,setModal]=useState(null)
const ws=weekStart(anchor),days=view==='week'?Array.from({length:7},(_,i)=>addDays(ws,i)):[anchor]
const step=n=>setAnchor(addDays(anchor,n*(view==='week'?7:1)))
const sub=id=>subjects.find(x=>x.id===id)
const close=()=>setModal(null)
const save=f=>{if(modal.id){update('sessions',modal.id,f);notify('Session updated')}else{add('sessions',f);notify('Session added')};close()}
const del=s=>{if(confirm('Delete this study session?')){remove('sessions',s.id);notify('Session deleted')}}
const title=view==='week'?`${toDate(ws).toLocaleDateString('en',{month:'short',day:'numeric'})} – ${toDate(addDays(ws,6)).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}`:toDate(anchor).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})
return(<div className="space-y-4">
<div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-extrabold">Study Planner</h1>
<button className="btn" disabled={!subjects.length} onClick={()=>setModal({date:anchor})}><Plus size={16}/>Add session</button></div>
{!subjects.length&&<div className="card text-sm text-slate-500">Create a subject first, then schedule study sessions. <Link to="/app/subjects" className="text-brand-600 hover:underline">Go to Subjects</Link></div>}
{subjects.length>0&&!sessions.length&&<p className="text-sm text-slate-500">Block out study time with Add session. Sessions that overlap are flagged so you can fix clashes.</p>}
<div className="flex flex-wrap items-center gap-2"><button className="btn-ghost !p-2" aria-label="Previous" onClick={()=>step(-1)}><ChevronLeft size={16}/></button>
<button className="btn-ghost" onClick={()=>setAnchor(today)}>Today</button><button className="btn-ghost !p-2" aria-label="Next" onClick={()=>step(1)}><ChevronRight size={16}/></button>
<p className="flex-1 font-semibold">{title}</p>
<div className="flex gap-1" role="tablist">{['week','day'].map(v=><button key={v} role="tab" aria-selected={view===v} onClick={()=>setView(v)} className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${view===v?'bg-brand-700 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{v}</button>)}</div></div>
<div className={`grid gap-3 ${view==='week'?'sm:grid-cols-2 lg:grid-cols-7':''}`}>{days.map(d=>{const list=sessions.filter(s=>s.date===d).sort(byTime),total=r1(list.reduce((t,s)=>t+hours(s),0)),isToday=d===today
return(<section key={d} aria-label={d} className={`card !p-3 ${isToday?'border-brand-500 ring-1 ring-brand-500':''}`}>
<div className="mb-2 flex items-baseline justify-between"><p className={`text-sm font-bold ${isToday?'text-brand-600 dark:text-brand-500':''}`}>{toDate(d).toLocaleDateString('en',{weekday:'short',day:'numeric'})}{isToday&&' · Today'}</p><span className="text-xs text-slate-500">{total}h</span></div>
{list.length?<ul className="space-y-2">{list.map(s=>{const sb=sub(s.subjectId),clash=sessions.some(x=>overlaps(s,x));return(
<li key={s.id} className="rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800" style={{borderLeft:`4px solid ${sb?.color||'#94a3b8'}`}}>
<p className="font-semibold">{s.start}–{s.end}</p><p className="truncate">{sb?.name||'No subject'}</p>{s.notes&&<p className="text-xs text-slate-500">{s.notes}</p>}
{clash&&<p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600"><AlertTriangle size={12}/>Overlaps another session</p>}
<div className="mt-1 flex gap-1"><button className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit session" onClick={()=>setModal(s)}><Pencil size={14}/></button>
<button className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Delete session" onClick={()=>del(s)}><Trash2 size={14}/></button></div></li>)})}</ul>
:<p className="text-xs text-slate-500">No sessions</p>}</section>)})}</div>
{modal&&<Modal title={modal.id?'Edit session':'Add session'} onClose={close}><Form s={modal.id?modal:null} date={modal.date||anchor} onSave={save} onClose={close}/></Modal>}</div>)}
