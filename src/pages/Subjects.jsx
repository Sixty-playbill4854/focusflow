import {useState} from 'react'
import {Trash2,Pencil} from 'lucide-react'
import Modal from '../components/Modal'
import {useStore,todayStr} from '../context/Store'
import {weekStart,weekHours} from '../utils/stats'
function Form({s,onSave,onClose}){
const [f,setF]=useState(s||{name:'',color:'#4338ca',goal:5,description:''}),[err,setErr]=useState('')
const set=k=>e=>setF({...f,[k]:e.target.value})
const submit=e=>{e.preventDefault();if(!f.name.trim())return setErr('Enter a subject name.');onSave({...f,name:f.name.trim(),goal:Math.max(0,Number(f.goal)||0)})}
return(<form onSubmit={submit} className="space-y-3" noValidate>
<div><label className="label" htmlFor="sn">Name</label><input id="sn" className="input" value={f.name} onChange={set('name')}/>{err&&<p className="mt-1 text-xs text-red-600">{err}</p>}</div>
<div><label className="label" htmlFor="sd">Description (optional)</label><input id="sd" className="input" value={f.description} onChange={set('description')}/></div>
<div className="flex gap-3"><div><label className="label" htmlFor="sc">Color</label><input id="sc" type="color" className="h-9 w-14 rounded" value={f.color} onChange={set('color')}/></div>
<div className="flex-1"><label className="label" htmlFor="sg">Weekly goal (hours)</label><input id="sg" type="number" min="0" className="input" value={f.goal} onChange={set('goal')}/></div></div>
<div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn">Save subject</button></div></form>)}
export default function Subjects(){
const {subjects,tasks,sessions,add,update,reassign,notify}=useStore(),[modal,setModal]=useState(null),ws=weekStart(todayStr())
const save=f=>{if(modal.id){update('subjects',modal.id,f);notify('Subject updated')}else{add('subjects',f);notify('Subject added')};setModal(null)}
const del=s=>{const nt=tasks.filter(t=>t.subjectId===s.id).length,ns=sessions.filter(x=>x.subjectId===s.id).length
if(!confirm(`Delete "${s.name}"?`))return
const rm=nt+ns>0&&confirm(`This subject has ${nt} task(s) and ${ns} study session(s).\n\nOK = delete them too.\nCancel = keep them, with no subject.`)
reassign(s.id,rm?'delete':'keep');notify('Subject deleted')}
return(<div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Subjects</h1><button className="btn" onClick={()=>setModal({})}>Add subject</button></div>
{!subjects.length?<div className="card text-center text-sm text-slate-500">No subjects yet. Add one to organise tasks and study sessions.</div>:
<div className="grid gap-3 sm:grid-cols-2">{subjects.map(s=>{const ts=tasks.filter(t=>t.subjectId===s.id),d=ts.filter(t=>t.status==='completed').length,h=weekHours(sessions,ws,s.id),p=s.goal?Math.min(100,h/s.goal*100):0
return(<div key={s.id} className="card"><div className="flex items-center justify-between"><p className="flex items-center gap-2 font-bold"><span className="h-3 w-3 rounded-full" style={{background:s.color}}/>{s.name}</p>
<div className="flex gap-1"><button className="btn-ghost !p-2" aria-label={`Edit ${s.name}`} onClick={()=>setModal(s)}><Pencil size={15}/></button><button className="btn-ghost !p-2" aria-label={`Delete ${s.name}`} onClick={()=>del(s)}><Trash2 size={15}/></button></div></div>
{s.description&&<p className="mt-1 text-sm text-slate-500">{s.description}</p>}
<p className="mt-2 text-sm text-slate-500">Tasks done: {d}/{ts.length}</p>
<p className="mt-1 text-sm text-slate-500">This week: {h}h of {s.goal}h goal</p><div className="mt-1 h-2 rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded" style={{width:p+'%',background:s.color}}/></div></div>)})}</div>}
{modal&&<Modal title={modal.id?'Edit subject':'Add subject'} onClose={()=>setModal(null)}><Form s={modal.id?modal:null} onSave={save} onClose={()=>setModal(null)}/></Modal>}</div>)}
