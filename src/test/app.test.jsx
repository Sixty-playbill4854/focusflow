import {render,screen,fireEvent,within,act,waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {vi} from 'vitest'
import {StoreProvider,todayStr} from '../context/Store'
import {addDays} from '../utils/stats'
import App from '../App'
const KEY='focusflow:v1',today=todayStr(),yday=addDays(today,-1)
const mount=(route='/app')=>render(<MemoryRouter initialEntries={[route]}><StoreProvider><App/></StoreProvider></MemoryRouter>)
const seed=o=>localStorage.setItem(KEY,JSON.stringify({tasks:[],subjects:[],focus:[],sessions:[],settings:{theme:'light',focus:25,short:5,long:15,notify:true},...o}))
const db=()=>JSON.parse(localStorage.getItem(KEY))
const sub=(id,name='Math',goal=5)=>({id,name,color:'#4338ca',goal,description:''})
const task=(id,o={})=>({id,title:'T'+id,description:'',subjectId:'',due:today,priority:'medium',status:'pending',createdAt:1,...o})
const confirmYes=(...v)=>{const f=vi.spyOn(window,'confirm');v.length?v.forEach(x=>f.mockReturnValueOnce(x)):f.mockReturnValue(true);return f}
const fill=(label,v)=>fireEvent.change(screen.getByLabelText(label),{target:{value:v}})

describe('Tasks',()=>{
it('validates, creates, edits, completes and deletes',async()=>{
const u=userEvent.setup();mount('/app/tasks')
await u.click(await screen.findByRole('button',{name:/add task/i}));await u.click(screen.getByText('Save task'))
expect(screen.getByText('Title is required.')).toBeTruthy();expect(screen.getByText('Choose a due date.')).toBeTruthy()
fill('Title','Essay');fill('Due date',today);await u.click(screen.getByText('Save task'))
expect(screen.getByText('Essay')).toBeTruthy();expect(db().tasks).toHaveLength(1)
await u.click(screen.getByLabelText('Edit Essay'));fill('Title','Essay v2');await u.click(screen.getByText('Save task'))
expect(screen.getByText('Essay v2')).toBeTruthy();expect(db().tasks[0].title).toBe('Essay v2')
await u.click(screen.getByLabelText('Mark Essay v2 complete'));expect(db().tasks[0].status).toBe('completed');expect(screen.getByText('1 of 1 completed')).toBeTruthy()
confirmYes();await u.click(screen.getByLabelText('Delete Essay v2'));expect(db().tasks).toHaveLength(0)})
it('shows overdue and filters',async()=>{seed({tasks:[task(1,{due:yday}),task(2,{priority:'high',title:'Other'})]});mount('/app/tasks')
expect(await screen.findByText(/Overdue/)).toBeTruthy()
await userEvent.type(screen.getByLabelText('Search tasks'),'Oth');expect(screen.queryByText('T1')).toBeNull();expect(screen.getByText('Other')).toBeTruthy()})
it('opens add modal from ?new=1',async()=>{mount('/app/tasks?new=1');expect(await screen.findByRole('dialog')).toBeTruthy()})
it('updates dashboard stats',async()=>{seed({tasks:[task(1,{status:'completed'}),task(2,{due:yday}),task(3)]});mount('/app')
const v=l=>screen.getByText(l).nextSibling.textContent;await screen.findByText('Total')
expect([v('Total'),v('Completed'),v('Pending'),v('Overdue')]).toEqual(['3','1','2','1'])})})

describe('Subjects',()=>{
it('creates and edits',async()=>{const u=userEvent.setup();mount('/app/subjects')
await u.click(await screen.findByRole('button',{name:'Add subject'}));fill('Name','Physics');fill('Description (optional)','Mechanics');fill('Weekly goal (hours)','7');await u.click(screen.getByText('Save subject'))
expect(screen.getByText('Mechanics')).toBeTruthy();await u.click(screen.getByLabelText('Edit Physics'));fill('Name','Phys 2');fill('Weekly goal (hours)','9');await u.click(screen.getByText('Save subject'))
expect(db().subjects[0]).toMatchObject({name:'Phys 2',goal:9,description:'Mechanics'})})
const data=()=>({subjects:[sub('s1')],tasks:[task(1,{subjectId:'s1'})],sessions:[{id:'x',subjectId:'s1',date:today,start:'09:00',end:'10:00',notes:''}]})
it('delete keeping tasks',async()=>{seed(data());mount('/app/subjects');confirmYes(true,false);await userEvent.click(await screen.findByLabelText('Delete Math'))
expect(db().subjects).toHaveLength(0);expect(db().tasks[0].subjectId).toBe('');expect(db().sessions[0].subjectId).toBe('')})
it('delete removing tasks and sessions',async()=>{seed(data());mount('/app/subjects');confirmYes(true,true);await userEvent.click(await screen.findByLabelText('Delete Math'))
expect(db().tasks).toHaveLength(0);expect(db().sessions).toHaveLength(0)})})

describe('Planner',()=>{
const add=async(u,s,e)=>{await u.click(screen.getByRole('button',{name:/add session/i}));fill('Start',s);fill('End',e);await u.click(screen.getByText('Save session'))}
it('creates, detects overlap, totals hours, edits, deletes',async()=>{seed({subjects:[sub('s1')]});const u=userEvent.setup();mount('/app/planner')
await screen.findByRole('heading',{name:'Study Planner'});await add(u,'09:00','10:00');await add(u,'12:00','13:30')
const col=screen.getByRole('region',{name:today});expect(within(col).getByText('2.5h')).toBeTruthy();expect(screen.queryByText('Overlaps another session')).toBeNull()
await u.click(screen.getByRole('button',{name:/add session/i}));fill('Start','09:30');fill('End','10:30');expect(screen.getByRole('alert').textContent).toMatch(/Overlaps 1/)
await u.click(screen.getByText('Save session'));expect(screen.getAllByText('Overlaps another session')).toHaveLength(2)
await u.click(screen.getAllByLabelText('Edit session')[0]);fill('Notes (optional)','Revise');await u.click(screen.getByText('Save session'));expect(screen.getByText('Revise')).toBeTruthy()
confirmYes();await u.click(screen.getAllByLabelText('Delete session')[0]);expect(db().sessions).toHaveLength(2)})
it('rejects end before start',async()=>{seed({subjects:[sub('s1')]});const u=userEvent.setup();mount('/app/planner');await screen.findByRole('heading',{name:'Study Planner'});await add(u,'10:00','09:00')
expect(screen.getByText(/end time after the start/)).toBeTruthy();expect(db().sessions).toHaveLength(0)})
it('navigates weeks and day view',async()=>{seed({subjects:[sub('s1')],sessions:[{id:'a',subjectId:'s1',date:addDays(today,7),start:'09:00',end:'10:00',notes:'NextWeek'}]});const u=userEvent.setup();mount('/app/planner')
await screen.findByRole('heading',{name:'Study Planner'});expect(screen.queryByText('NextWeek')).toBeNull();await u.click(screen.getByLabelText('Next'));expect(screen.getByText('NextWeek')).toBeTruthy()
await u.click(screen.getByText('Today'));await u.click(screen.getByRole('tab',{name:'day'}));expect(screen.getAllByRole('region')).toHaveLength(1)})})

describe('Timer',()=>{
const setup=()=>{vi.useFakeTimers({toFake:['Date','setInterval','clearInterval']});seed({})}
it('runs, pauses, resumes, resets and records a session',async()=>{setup();mount('/app/timer')
fireEvent.click(await screen.findByText('Start'));act(()=>{vi.advanceTimersByTime(60000)});expect(screen.getByText('24:00')).toBeTruthy()
fireEvent.click(screen.getByText('Pause'));act(()=>{vi.advanceTimersByTime(60000)});expect(screen.getByText('24:00')).toBeTruthy()
fireEvent.click(screen.getByText('Resume'));act(()=>{vi.advanceTimersByTime(30000)});expect(screen.getByText('23:30')).toBeTruthy()
fireEvent.click(screen.getByText('Reset'));expect(screen.getByText('25:00')).toBeTruthy()
fireEvent.click(screen.getByText('Start'));act(()=>{vi.advanceTimersByTime(25*60000+500)});expect(db().focus).toHaveLength(1);expect(db().focus[0].minutes).toBe(25)})
it('restores a running timer after refresh',async()=>{setup();const a=mount('/app/timer');fireEvent.click(await screen.findByText('Start'));act(()=>{vi.advanceTimersByTime(120000)});a.unmount()
act(()=>{vi.advanceTimersByTime(60000)});mount('/app/timer');expect(await screen.findByText('22:00')).toBeTruthy()})
it('uses changed durations when idle',async()=>{seed({});const a=mount('/app/timer');expect(await screen.findByText('25:00')).toBeTruthy();a.unmount()
seed({settings:{theme:'light',focus:30,short:5,long:15,notify:true}});mount('/app/timer');expect(await screen.findByText('30:00')).toBeTruthy()})})

describe('Analytics',()=>{
const d={subjects:[sub('s1','Math',5)],tasks:[task(1,{status:'completed',completedAt:Date.now()}),task(2)],sessions:[{id:'a',subjectId:'s1',date:today,start:'09:00',end:'11:00',notes:''}],focus:[{id:'f',minutes:25,at:Date.now(),taskId:''}]}
it('computes stats from data',async()=>{seed(d);mount('/app/analytics');expect((await screen.findByText('50%'))).toBeTruthy();expect(screen.getByText('2 / 5h')).toBeTruthy();expect(screen.getByText('25')).toBeTruthy()})
it('empty state',async()=>{mount('/app/analytics');expect(await screen.findByText('No data to analyse yet')).toBeTruthy()})
it('updates after adding a session',async()=>{seed({subjects:[sub('s1')],tasks:[task(1)]});const u=userEvent.setup();mount('/app/planner');await screen.findByRole('heading',{name:'Study Planner'})
await u.click(screen.getByRole('button',{name:/add session/i}));fill('Start','09:00');fill('End','10:30');await u.click(screen.getByText('Save session'))
await u.click(screen.getAllByRole('link',{name:'Analytics'})[0]);expect((await screen.findByText('Study hours this week')).nextSibling.textContent).toBe('1.5h')})})

describe('Persistence and settings',()=>{
it('survives remount',async()=>{const u=userEvent.setup();const a=mount('/app/tasks');await u.click(await screen.findByRole('button',{name:/add task/i}));fill('Title','Keep');fill('Due date',today);await u.click(screen.getByText('Save task'));a.unmount()
mount('/app/tasks');expect(await screen.findByText('Keep')).toBeTruthy()})
it('recovers from corrupt storage',async()=>{localStorage.setItem(KEY,'{bad');mount('/app');expect(await screen.findByText('Nothing here yet')).toBeTruthy()})
it('imports valid, rejects invalid, clears',async()=>{const u=userEvent.setup();seed({tasks:[task(1)]});mount('/app/settings');await screen.findByText('Your data');confirmYes()
const inp=document.querySelector('input[type=file]')
await u.upload(inp,new File(['not json'],'x.json',{type:'application/json'}));expect(await screen.findByText(/Import failed/)).toBeTruthy();expect(db().tasks).toHaveLength(1)
await u.upload(inp,new File([JSON.stringify({tasks:[task(7),task(8)],subjects:[],focus:[]})],'ok.json',{type:'application/json'}));await waitFor(()=>expect(db().tasks).toHaveLength(2));expect(db().sessions).toEqual([])
await u.click(screen.getByText('Clear all data'));expect(db().tasks).toHaveLength(0)})
it('theme toggle persists',async()=>{mount('/app');await userEvent.click(await screen.findByLabelText('Toggle theme'));expect(document.documentElement.classList.contains('dark')).toBe(true);expect(db().settings.theme).toBe('dark')})})

describe('Navigation',()=>{
it('every nav item opens a page',async()=>{const u=userEvent.setup();mount('/app')
for(const [n,h] of [['My Tasks','My Tasks'],['Study Planner','Study Planner'],['Subjects','Subjects'],['Focus Timer','Focus Timer'],['Analytics','Analytics'],['Settings','Settings'],['Dashboard',/Good/]]){
await u.click((await screen.findAllByRole('link',{name:n}))[0]);expect(await screen.findByRole('heading',{level:1,name:h})).toBeTruthy()}})
it('mobile drawer opens and closes',async()=>{const u=userEvent.setup();mount('/app');await u.click(await screen.findByLabelText('Open menu'))
const links=screen.getAllByRole('link',{name:'My Tasks'});expect(links).toHaveLength(2);await u.click(links[1]);expect(screen.getAllByRole('link',{name:'My Tasks'})).toHaveLength(1)})
it('landing Get started opens dashboard',async()=>{mount('/');await userEvent.click(screen.getByText('Get started'));expect(await screen.findByText(/Good/)).toBeTruthy()})})
