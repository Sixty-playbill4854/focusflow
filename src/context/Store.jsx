import {createContext,useContext,useEffect,useState,useCallback} from 'react'
const KEY='focusflow:v1'
const DEFAULTS={tasks:[],subjects:[],focus:[],sessions:[],settings:{theme:'light',focus:25,short:5,long:15,notify:true}}
const okD=n=>Number.isInteger(n)&&n>=1&&n<=120
const cleanS=s=>{const m={...DEFAULTS.settings,...s};for(const k of['focus','short','long'])if(!okD(m[k]))m[k]=DEFAULTS.settings[k];return m}
const uid=()=>crypto.randomUUID()
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));
if(!d||!Array.isArray(d.tasks))return DEFAULTS
return{...DEFAULTS,...d,subjects:d.subjects||[],focus:d.focus||[],sessions:d.sessions||[],settings:cleanS(d.settings)}}catch{return DEFAULTS}}
const Ctx=createContext()
export const useStore=()=>useContext(Ctx)
export const todayStr=(d=new Date())=>{const z=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`}
export function StoreProvider({children}){
const [data,setData]=useState(load),[toast,setToast]=useState(null)
useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}},[data])
useEffect(()=>{document.documentElement.classList.toggle('dark',data.settings.theme==='dark')},[data.settings.theme])
const notify=useCallback(m=>{setToast(m);setTimeout(()=>setToast(null),3000)},[])
const add=(k,item)=>setData(d=>({...d,[k]:[...d[k],{id:uid(),createdAt:Date.now(),...item}]}))
const update=(k,id,p)=>setData(d=>({...d,[k]:d[k].map(x=>x.id===id?{...x,...p}:x)}))
const remove=(k,id)=>setData(d=>({...d,[k]:d[k].filter(x=>x.id!==id)}))
const setSettings=p=>setData(d=>({...d,settings:{...d.settings,...p}}))
const reassign=(sid,to)=>setData(d=>({...d,subjects:d.subjects.filter(s=>s.id!==sid),tasks:to==='delete'?d.tasks.filter(t=>t.subjectId!==sid):d.tasks.map(t=>t.subjectId===sid?{...t,subjectId:''}:t),sessions:to==='delete'?d.sessions.filter(x=>x.subjectId!==sid):d.sessions.map(x=>x.subjectId===sid?{...x,subjectId:''}:x)}))
const exportData=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=`focusflow-${todayStr()}.json`;a.click()}
const importData=txt=>{try{const d=JSON.parse(txt);if(!Array.isArray(d.tasks)||!Array.isArray(d.subjects)||!Array.isArray(d.focus))throw 0
setData({...DEFAULTS,...d,sessions:Array.isArray(d.sessions)?d.sessions:[],settings:cleanS(d.settings)});return true}catch{return false}}
const clearAll=()=>setData({...DEFAULTS,settings:data.settings})
const loadDemo=()=>{const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return todayStr(d)}
const subs=[['Mathematics','#4338ca',6],['Physics','#8b5cf6',5],['Literature','#059669',3]].map(([name,color,goal])=>({id:uid(),name,color,goal,description:'',createdAt:Date.now()}))
const T=(title,i,due,priority,status='pending')=>({id:uid(),createdAt:Date.now(),title,description:'',subjectId:subs[i].id,due:day(due),priority,status,completedAt:status==='completed'?Date.now():null})
const focus=[0,1,2,3,4,5,6].flatMap(n=>Array.from({length:(n*3)%4+1},()=>{const d=new Date();d.setDate(d.getDate()-n);return{id:uid(),minutes:25,at:d.getTime(),taskId:''}}))
const S=(i,n,start,end,notes)=>({id:uid(),createdAt:Date.now(),subjectId:subs[i].id,date:day(n),start,end,notes})
const sessions=[S(0,0,'09:00','10:30','Problem set'),S(1,0,'14:00','15:00',''),S(2,1,'10:00','11:30',''),S(0,2,'16:00','17:30',''),S(1,-1,'11:00','12:30',''),S(2,-2,'09:00','10:00',''),S(0,-3,'15:00','17:00','')]
setData(d=>({...d,subjects:subs,focus,sessions,tasks:[T('Linear algebra problem set',0,2,'high'),T('Lab report: pendulum',1,-1,'high'),T('Essay outline',2,5,'medium'),T('Review calculus notes',0,0,'low','completed'),T('Read chapter 4',2,0,'medium')]}));notify('Demo data loaded')}
return<Ctx.Provider value={{...data,add,update,remove,setSettings,reassign,exportData,importData,clearAll,loadDemo,notify,toast}}>{children}</Ctx.Provider>}
