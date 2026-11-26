import {render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {vi} from 'vitest'
import {StoreProvider} from '../context/Store'
import App from '../App'
const KEY='focusflow:v1'
const mount=(r='/app')=>render(<MemoryRouter initialEntries={[r]}><StoreProvider><App/></StoreProvider></MemoryRouter>)
const S=(o={})=>({theme:'light',focus:25,short:5,long:15,notify:true,...o})
const seed=(s={},o={})=>localStorage.setItem(KEY,JSON.stringify({tasks:[],subjects:[],focus:[],sessions:[],settings:S(s),...o}))
const db=()=>JSON.parse(localStorage.getItem(KEY))
describe('Settings durations',()=>{
it('lets the field be cleared while editing',async()=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Focus (minutes)')
await u.clear(i);expect(i.value).toBe('');expect(screen.queryByRole('alert')).toBeNull();expect(db().settings.focus).toBe(25)})
it('saves a valid value on blur and on Enter',async()=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Focus (minutes)')
await u.clear(i);await u.type(i,'40');await u.tab();expect(db().settings.focus).toBe(40)
await u.clear(i);await u.type(i,'50{Enter}');expect(db().settings.focus).toBe(50)})
it.each(['','0','121','2.5','abc','-5'])('rejects %j, keeps the saved value and explains',async v=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Focus (minutes)')
await u.clear(i);if(v)await u.type(i,v);await u.tab();expect(screen.getByRole('alert').textContent).toMatch(/whole number from 1 to 120/);expect(db().settings.focus).toBe(25);expect(i.value).toBe('25');expect(i.getAttribute('aria-invalid')).toBe('true')})
it('rejects a short break longer than the long break',async()=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Short break (minutes)')
await u.clear(i);await u.type(i,'20');await u.tab();expect(screen.getByRole('alert').textContent).toMatch(/cannot be longer/);expect(db().settings.short).toBe(5)})
it('rejects a long break shorter than the short break',async()=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Long break (minutes)')
await u.clear(i);await u.type(i,'3');await u.tab();expect(screen.getByRole('alert').textContent).toMatch(/cannot be shorter/);expect(db().settings.long).toBe(15)})
it('repairs invalid stored durations',async()=>{seed({focus:0,short:'x',long:500});mount('/app/timer');expect(await screen.findByText('25:00')).toBeTruthy()})
it('clears the error when editing again',async()=>{seed();const u=userEvent.setup();mount('/app/settings');const i=await screen.findByLabelText('Focus (minutes)')
await u.clear(i);await u.tab();expect(screen.getByRole('alert')).toBeTruthy();await u.type(i,'3');expect(screen.queryByRole('alert')).toBeNull()})})
describe('First-time guidance',()=>{
it('dashboard guides new users and loads demo data',async()=>{const u=userEvent.setup();mount('/app');expect(await screen.findByText('Nothing here yet')).toBeTruthy()
for(const n of ['Add a subject','Add a task','Schedule a study session','start the focus timer'])expect(screen.getByRole('link',{name:n})).toBeTruthy()
await u.click(screen.getByText('Load demo data'));expect(await screen.findByText('Demo data loaded')).toBeTruthy();expect(screen.queryByText('Nothing here yet')).toBeNull()})
it('planner hints when there are no sessions',async()=>{seed({},{subjects:[{id:'s',name:'M',color:'#000',goal:3,description:''}]});mount('/app/planner');expect(await screen.findByText(/Block out study time/)).toBeTruthy()})
it('timer explains how it works',async()=>{mount('/app/timer');expect(await screen.findByText(/press Start, and work until the timer ends/)).toBeTruthy()})
it('landing explains the steps',()=>{mount('/');expect(screen.getByText('How it works')).toBeTruthy();expect(screen.getByText('Step 3')).toBeTruthy()})})
describe('Landing anchor',()=>{
it('Explore features scrolls instead of changing the route',async()=>{const sp=Element.prototype.scrollIntoView=vi.fn();mount('/');await userEvent.click(screen.getByText('Explore features'));expect(sp).toHaveBeenCalled();expect(screen.getByRole('heading',{level:1}).textContent).toMatch(/Plan the week/)})})
describe('Console',()=>{
it('logs no errors while visiting every page',async()=>{const err=vi.spyOn(console,'error').mockImplementation(()=>{});const u=userEvent.setup();mount('/app')
for(const n of ['My Tasks','Study Planner','Subjects','Focus Timer','Analytics','Settings','Dashboard']){await u.click((await screen.findAllByRole('link',{name:n}))[0]);await screen.findByRole('heading',{level:1})}
expect(err).not.toHaveBeenCalled()})})
