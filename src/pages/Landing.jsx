import {Link} from 'react-router-dom'
import {ListChecks,Timer,BarChart3,BookOpen,ShieldCheck} from 'lucide-react'
import Logo from '../components/Logo'
const F=[[ListChecks,'Tasks with deadlines','Prioritise, filter and track assignments by subject.'],[Timer,'Pomodoro focus timer','Timestamp-based, so it stays accurate in background tabs.'],[BookOpen,'Subjects and goals','Set weekly study-hour goals per subject.'],[BarChart3,'Real analytics','Charts built from your own focus history.'],[ShieldCheck,'Private by design','Everything stays in your browser. No account needed.']]
export default function Landing(){return(<div className="min-h-screen">
<header className="mx-auto flex max-w-5xl items-center justify-between p-4"><Logo/><Link to="/app" className="btn">Open app</Link></header>
<section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
<h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">Plan the week. Protect your focus.</h1>
<p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">FocusFlow brings your tasks, subjects and study timer into one calm workspace, with nothing to sign up for.</p>
<div className="mt-8 flex justify-center gap-3"><Link to="/app" className="btn">Get started</Link><a href="#features" onClick={e=>{e.preventDefault();document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}} className="btn-ghost">Explore features</a></div></section>
<section className="mx-auto max-w-3xl px-4 pb-8"><h2 className="mb-3 text-center text-xl font-bold">How it works</h2><ol className="grid gap-3 text-sm sm:grid-cols-3">
{['Add your subjects and weekly study goals.','Capture tasks and schedule study sessions.','Use the focus timer and watch your progress build.'].map((t,i)=><li key={t} className="card"><span className="font-bold text-brand-600">Step {i+1}</span><p className="mt-1">{t}</p></li>)}</ol></section>
<section id="features" className="mx-auto grid max-w-5xl gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">{F.map(([I,t,d])=>(<div key={t} className="card"><I className="mb-2 text-brand-600" size={22}/><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p></div>))}</section>
<footer className="p-8 text-center text-sm text-slate-500">FocusFlow. Data is stored locally in your browser.</footer></div>)}
