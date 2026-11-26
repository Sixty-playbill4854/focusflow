import {todayStr} from '../context/Store'
export const toDate=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
export const addDays=(s,n)=>{const d=toDate(s);d.setDate(d.getDate()+n);return todayStr(d)}
export const weekStart=s=>{const d=toDate(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return todayStr(d)}
export const mins=t=>{const [h,m]=t.split(':').map(Number);return h*60+m}
export const hours=s=>(mins(s.end)-mins(s.start))/60
export const overlaps=(a,b)=>a.id!==b.id&&a.date===b.date&&mins(a.start)<mins(b.end)&&mins(b.start)<mins(a.end)
export const byTime=(a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)
export const r1=n=>Math.round(n*10)/10
export const inRange=(d,a,b)=>d>=a&&d<=b
export const weekHours=(sessions,ws,subjectId)=>r1(sessions.filter(s=>inRange(s.date,ws,addDays(ws,6))&&(subjectId===undefined||s.subjectId===subjectId)).reduce((t,s)=>t+hours(s),0))
