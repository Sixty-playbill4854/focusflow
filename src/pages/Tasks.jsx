import {useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {Plus,Pencil,Trash2} from 'lucide-react'
import Modal from '../components/Modal'
import {useStore,todayStr} from '../context/Store'
const P={high:3,medium:2,low:1}
function Form({task,onSave,onClose}){
const {subjects}=useStore(),[f,setF]=useState(task||{title:'',description:'',subjectId:'',due:'',priority:'medium',status:'pending'}),[err,setErr]=useState({})
const set=k=>e=>setF({...f,[k]:e.target.value})
const submit=e=>{e.preventDefault();const er={};if(!f.title.trim())er.title='Title is required.';if(!f.due)er.due='Choose a due date.';setErr(er);if(!Object.keys(er).length)onSave({...f,title:f.title.trim()})}
return(<form onSubmit={submit} className="space-y-3" noValidate>
<div><label className="label" htmlFor="t">Title</label><input id="t" className="input" value={f.title} onChange={set('title')} aria-invalid={!!err.title}/>{err.title&&<p className="mt-1 text-xs text-red-600">{err.title}</p>}</div>
<div><label className="label" htmlFor="d">Description</label><textarea id="d" className="input" rows={2} value={f.description} onChange={set('description')}/></div>
<div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="s">Subject</label><select id="s" className="input" value={f.subjectId} onChange={set('subjectId')}><option value="">None</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
<div><label className="label" htmlFor="p">Priority</label><select id="p" className="input" value={f.priority} onChange={set('priority')}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div>
<div><label className="label" htmlFor="du">Due date</label><input id="du" type="date" className="input" value={f.due} onChange={set('due')}/>{err.due&&<p className="mt-1 text-xs text-red-600">{err.due}</p>}</div>
<div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn">Save task</button></div></form>)}
export default function Tasks(){
const {tasks,subjects,add,update,remove,notify}=useStore(),[sp,setSp]=useSearchParams()
const [modal,setModal]=useState(sp.get('new')?{}:null),[q,setQ]=useState(''),[fs,setFs]=useState(''),[fp,setFp]=useState(''),[fst,setFst]=useState(''),[sort,setSort]=useState('due')
const today=todayStr(),sub=id=>subjects.find(s=>s.id===id)
const list=tasks.filter(t=>t.title.toLowerCase().includes(q.toLowerCase())&&(!fs||t.subjectId===fs)&&(!fp||t.priority===fp)&&(!fst||t.status===fst))
.sort((a,b)=>sort==='due'?a.due.localeCompare(b.due):sort==='priority'?P[b.priority]-P[a.priority]:b.createdAt-a.createdAt)
const done=tasks.filter(t=>t.status==='completed').length
const close=()=>{setModal(null);sp.delete('new');setSp(sp)}
const save=f=>{if(modal.id){update('tasks',modal.id,f);notify('Task updated')}else{add('tasks',f);notify('Task added')};close()}
return(<div className="space-y-4">
<div className="flex items-center justify-between"><div><h1 className="text-2xl font-extrabold">My Tasks</h1><p className="text-sm text-slate-500">{done} of {tasks.length} completed</p></div><button className="btn" onClick={()=>setModal({})}><Plus size={16}/>Add task</button></div>
{tasks.length>0&&<div className="h-2 rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded bg-emerald-500" style={{width:done/tasks.length*100+'%'}}/></div>}
<div className="grid grid-cols-2 gap-2 md:grid-cols-5"><input aria-label="Search tasks" placeholder="Search title" className="input col-span-2 md:col-span-1" value={q} onChange={e=>setQ(e.target.value)}/>
<select aria-label="Filter by subject" className="input" value={fs} onChange={e=>setFs(e.target.value)}><option value="">All subjects</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
<select aria-label="Filter by priority" className="input" value={fp} onChange={e=>setFp(e.target.value)}><option value="">Any priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
<select aria-label="Filter by status" className="input" value={fst} onChange={e=>setFst(e.target.value)}><option value="">Any status</option><option value="pending">Pending</option><option value="completed">Completed</option></select>
<select aria-label="Sort" className="input" value={sort} onChange={e=>setSort(e.target.value)}><option value="due">Sort: due date</option><option value="priority">Sort: priority</option><option value="created">Sort: newest</option></select></div>
{!list.length?<div className="card text-center text-sm text-slate-500">{tasks.length?'No tasks match these filters.':'No tasks yet. Add your first task to get started.'}</div>:
<ul className="space-y-2">{list.map(t=>{const od=t.status!=='completed'&&t.due<today,s=sub(t.subjectId);return(
<li key={t.id} className={`card flex items-center gap-3 !p-3 ${od?'border-red-300 dark:border-red-900':''}`}>
<input type="checkbox" aria-label={`Mark ${t.title} complete`} className="h-4 w-4 accent-emerald-600" checked={t.status==='completed'} onChange={e=>update('tasks',t.id,{status:e.target.checked?'completed':'pending',completedAt:e.target.checked?Date.now():null})}/>
<div className="min-w-0 flex-1"><p className={`truncate font-medium ${t.status==='completed'?'text-slate-400 line-through':''}`}>{t.title}</p>
<p className="text-xs text-slate-500"><span className={od?'font-semibold text-red-600':''}>{od?'Overdue · ':''}{t.due}</span> · {t.priority}{s&&<> · <span style={{color:s.color}}>{s.name}</span></>}</p></div>
<button className="btn-ghost !p-2" aria-label={`Edit ${t.title}`} onClick={()=>setModal(t)}><Pencil size={15}/></button>
<button className="btn-ghost !p-2" aria-label={`Delete ${t.title}`} onClick={()=>{if(confirm(`Delete "${t.title}"?`)){remove('tasks',t.id);notify('Task deleted')}}}><Trash2 size={15}/></button></li>)})}</ul>}
{modal&&<Modal title={modal.id?'Edit task':'Add task'} onClose={close}><Form task={modal.id?modal:null} onSave={save} onClose={close}/></Modal>}</div>)}
