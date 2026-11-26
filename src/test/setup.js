import {cleanup} from '@testing-library/react'
import {afterEach,beforeEach,vi} from 'vitest'
globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}}
File.prototype.text=function(){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsText(this)})}
beforeEach(()=>{localStorage.clear();document.documentElement.className=''})
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks()})
