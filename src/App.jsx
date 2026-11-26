import {lazy,Suspense} from 'react'
import {Routes,Route,Navigate} from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
const Dashboard=lazy(()=>import('./pages/Dashboard'))
const Tasks=lazy(()=>import('./pages/Tasks'))
const Subjects=lazy(()=>import('./pages/Subjects'))
const Timer=lazy(()=>import('./pages/Timer'))
const Planner=lazy(()=>import('./pages/Planner'))
const Analytics=lazy(()=>import('./pages/Analytics'))
const Settings=lazy(()=>import('./pages/Settings'))
export default function App(){return(<Suspense fallback={<p className="p-6 text-sm text-slate-500" role="status">Loading…</p>}><Routes>
<Route path="/" element={<Landing/>}/>
<Route path="/app" element={<AppLayout/>}>
<Route index element={<Dashboard/>}/><Route path="tasks" element={<Tasks/>}/><Route path="subjects" element={<Subjects/>}/>
<Route path="planner" element={<Planner/>}/><Route path="analytics" element={<Analytics/>}/><Route path="timer" element={<Timer/>}/><Route path="settings" element={<Settings/>}/></Route>
<Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense>)}
