import {useState} from 'react'
import {NavLink,Outlet,Link} from 'react-router-dom'
import {LayoutDashboard,ListChecks,BookOpen,Timer,Settings,CalendarDays,BarChart3,Menu,PanelLeftClose,PanelLeft,Moon,Sun} from 'lucide-react'
import Logo,{LogoMark} from '../components/Logo'
import {useStore} from '../context/Store'
const NAV=[['/app','Dashboard',LayoutDashboard,true],['/app/tasks','My Tasks',ListChecks],['/app/planner','Study Planner',CalendarDays],['/app/subjects','Subjects',BookOpen],['/app/timer','Focus Timer',Timer],['/app/analytics','Analytics',BarChart3],['/app/settings','Settings',Settings]]
export default function AppLayout(){
const [open,setOpen]=useState(false),[min,setMin]=useState(false),{settings,setSettings,toast}=useStore()
const nav=(c)=><nav className="space-y-1 p-3" aria-label="Main">{NAV.map(([to,l,I,end])=>(
<NavLink key={to} to={to} end={end} onClick={()=>setOpen(false)} title={l} className={({isActive})=>`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive?'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><I size={18}/>{(!c)&&l}</NavLink>))}</nav>
const side=(c)=><><div className="flex h-14 items-center px-4"><Link to="/" aria-label="FocusFlow home">{c?<LogoMark/>:<Logo/>}</Link></div>{nav(c)}</>
return(<div className="flex min-h-screen">
<aside className={`hidden shrink-0 border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 md:block ${min?'w-16':'w-56'}`}>{side(min)}</aside>
{open&&<div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-slate-900/50" onClick={()=>setOpen(false)}/><aside className="relative h-full w-56 bg-white dark:bg-slate-900">{side(false)}</aside></div>}
<div className="flex min-w-0 flex-1 flex-col">
<header className="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
<button className="btn-ghost !p-2 md:hidden" aria-label="Open menu" onClick={()=>setOpen(true)}><Menu size={18}/></button>
<button className="btn-ghost hidden !p-2 md:inline-flex" aria-label="Toggle sidebar" onClick={()=>setMin(!min)}>{min?<PanelLeft size={18}/>:<PanelLeftClose size={18}/>}</button>
<div className="flex-1"/><button className="btn-ghost !p-2" aria-label="Toggle theme" onClick={()=>setSettings({theme:settings.theme==='dark'?'light':'dark'})}>{settings.theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button></header>
<main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6"><Outlet/></main></div>
{toast&&<div role="status" className="fixed bottom-4 right-4 z-50 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}</div>)}
