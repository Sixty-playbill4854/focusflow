import {useRef,useState,useEffect} from 'react'
import {useStore} from '../context/Store'
const valid=v=>/^\d+$/.test(v.trim())&&+v>=1&&+v<=120
function Duration({id,label,value,onSave,extra}){
const [text,setText]=useState(String(value)),[err,setErr]=useState('')
useEffect(()=>{setText(String(value))},[value])
const commit=()=>{const bad=!valid(text)?`Enter a whole number from 1 to 120. Kept ${value}.`:extra(+text);if(bad){setErr(bad);setText(String(value))}else{setErr('');onSave(+text)}}
return(<div><label className="label" htmlFor={id}>{label}</label><input id={id} inputMode="numeric" className="input" value={text} aria-invalid={!!err} aria-describedby={err?id+'-e':undefined} onChange={e=>{setText(e.target.value);setErr('')}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit()}}}/>{err&&<p id={id+'-e'} role="alert" className="mt-1 text-xs text-red-600">{err}</p>}</div>)}
export default function Settings(){
const {settings,setSettings,exportData,importData,clearAll,loadDemo,tasks,notify}=useStore(),file=useRef()
const imp=async e=>{const f=e.target.files[0];if(!f)return;if(!confirm('Importing replaces your current data. Continue?'))return;notify(importData(await f.text())?'Data imported':'Import failed: invalid FocusFlow file');e.target.value=''}
const demo=()=>{if(!tasks.length||confirm('Demo data replaces your subjects, tasks and focus history. Continue?'))loadDemo()}
return(<div className="max-w-xl space-y-4"><h1 className="text-2xl font-extrabold">Settings</h1>
<section className="card space-y-3"><h2 className="font-bold">Preferences</h2>
<label className="flex items-center justify-between text-sm">Dark theme<input type="checkbox" className="h-4 w-4 accent-brand-600" checked={settings.theme==='dark'} onChange={e=>setSettings({theme:e.target.checked?'dark':'light'})}/></label>
<label className="flex items-center justify-between text-sm">Notify when a session ends<input type="checkbox" className="h-4 w-4 accent-brand-600" checked={settings.notify} onChange={e=>setSettings({notify:e.target.checked})}/></label>
<div className="grid gap-3 sm:grid-cols-3"><Duration id="focus" label="Focus (minutes)" value={settings.focus} onSave={n=>setSettings({focus:n})} extra={()=>''}/>
<Duration id="short" label="Short break (minutes)" value={settings.short} onSave={n=>setSettings({short:n})} extra={n=>n>settings.long?'Short break cannot be longer than the long break.':''}/>
<Duration id="long" label="Long break (minutes)" value={settings.long} onSave={n=>setSettings({long:n})} extra={n=>n<settings.short?'Long break cannot be shorter than the short break.':''}/></div></section>
<section className="card space-y-3"><h2 className="font-bold">Your data</h2><p className="text-sm text-slate-500">Stored only in this browser's localStorage. Export a backup to move it elsewhere.</p>
<div className="flex flex-wrap gap-2"><button className="btn-ghost" onClick={exportData}>Export JSON</button><button className="btn-ghost" onClick={()=>file.current.click()}>Import JSON</button>
<input ref={file} type="file" accept="application/json" hidden onChange={imp}/><button className="btn-ghost" onClick={demo}>Load demo data</button>
<button className="btn-ghost !border-red-300 !text-red-600" onClick={()=>confirm('Delete all tasks, subjects and focus history?')&&clearAll()}>Clear all data</button></div></section>
<section className="card text-sm text-slate-500"><h2 className="mb-1 font-bold text-slate-800 dark:text-slate-100">About</h2>FocusFlow 1.0. A client-side study planner built with React, Vite and Tailwind CSS.</section></div>)}
