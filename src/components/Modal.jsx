import {useEffect} from 'react'
import {X} from 'lucide-react'
export default function Modal({title,onClose,children}){
useEffect(()=>{const h=e=>e.key==='Escape'&&onClose();addEventListener('keydown',h);return()=>removeEventListener('keydown',h)},[onClose])
return(<div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
<div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-md shadow-xl">
<div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{title}</h2>
<button aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button></div>{children}</div></div>)}
