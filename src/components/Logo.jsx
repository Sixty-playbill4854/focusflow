export function LogoMark({size=32,mono=false,dark=false}){
const bg=mono?'currentColor':dark?'#6366f1':'#4338ca',fg=mono?'var(--logo-fg,#fff)':'#fff'
return(<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill={bg}/>
<circle cx="16" cy="16" r="9" fill="none" stroke={fg} strokeOpacity=".35" strokeWidth="2.5"/>
<path d="M7 21c4.5 0 4.5-9 9-9s4.5 4 9 4" stroke={fg} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
<circle cx="25" cy="16" r="2.4" fill={mono?fg:'#c4b5fd'}/></svg>)}
export default function Logo({size=32,mono,dark,className=''}){
return(<span className={`inline-flex items-center gap-2 ${className}`}><LogoMark size={size} mono={mono} dark={dark}/>
<span className="text-lg font-extrabold tracking-tight">Focus<span className="text-brand-600 dark:text-brand-500">Flow</span></span></span>)}
