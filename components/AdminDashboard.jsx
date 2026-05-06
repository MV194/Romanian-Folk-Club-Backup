import { useState, useEffect, lazy, Suspense } from 'react'
import AdminEventDetail from './AdminEventDetail'
import { Calendar, Image, Users, MessageSquare, BookOpen, FileEdit, LogOut, Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import DownloadButton from './DownloadButton'
import StarRating from './StarRating'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n.jsx'
import { useAuth } from '../hooks/useAuth'
import LogoutConfirmModal from './LogoutConfirmModal'

const TABS = [
  { key:'events',       icon:Calendar,      label:'Events'       },
  { key:'gallery',      icon:Image,         label:'Gallery'      },
  { key:'users',        icon:Users,         label:'Users'        },
  { key:'testimonials', icon:MessageSquare, label:'Testimonials' },
  { key:'resources',    icon:BookOpen,      label:'Resources'    },
  { key:'content',      icon:FileEdit,      label:'Page Content' },
]

export default function AdminDashboard({ pageContent, setPageContent, showToast, onClose }) {
  const t = useT()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('events')
  const [stats, setStats] = useState({ events:0, gallery:0, pending:0, resources:0 })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('id',{count:'exact',head:true}),
      supabase.from('gallery').select('id',{count:'exact',head:true}),
      supabase.from('testimonials').select('id',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('resources').select('id',{count:'exact',head:true}),
    ]).then(([ev,ga,te,re]) => setStats({ events:ev.count??0, gallery:ga.count??0, pending:te.count??0, resources:re.count??0 }))
  }, [activeTab])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await signOut()
    onClose()
    showToast(t('admin.signedOut'))
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1500,
      background:'rgba(26,10,0,.6)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'stretch',
      animation:'fadeIn .2s ease',
    }}>
      {/* Backdrop */}
      <div style={{ flex:1 }} onClick={onClose}/>

      {/* Wide slide-in panel */}
      <div style={{
        width:'100%', maxWidth:'960px', background:'var(--parchment)',
        display:'flex', flexDirection:'column', height:'100%',
        boxShadow:'-8px 0 40px rgba(0,0,0,.3)',
        animation:'slideInRight .25s ease',
        overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{ background:'var(--ink)', padding:'24px 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#fff', border:'3px solid var(--gold)', flexShrink:0 }}>
                {profile?.avatar_letters||profile?.name?.slice(0,2).toUpperCase()||'AD'}
              </div>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontSize:'1.4rem', marginBottom:'2px' }}>Admin Dashboard</h2>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'12px' }}>Site Management · {profile?.email}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <button onClick={handleLogout} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'rgba(255,255,255,.7)', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
                <LogOut size={13}/> Sign Out
              </button>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'rgba(255,255,255,.8)', width:'34px', height:'34px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
              ><X size={18}/></button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px' }}>
            {[['Events',stats.events],['Gallery',stats.gallery],['Pending',stats.pending],['Resources',stats.resources]].map(([l,v])=>(
              <div key={l} style={{ background:'rgba(255,255,255,.08)', borderRadius:'8px', padding:'10px 18px', textAlign:'center', border:'1px solid rgba(255,255,255,.1)' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--gold)', lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginTop:'4px' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {TABS.map(({ key, icon:Icon, label }) => (
              <button key={key} onClick={()=>setActiveTab(key)} style={{
                background: activeTab===key ? 'var(--gold)' : 'rgba(255,255,255,.08)',
                color:      activeTab===key ? 'var(--ink)'  : 'rgba(255,255,255,.65)',
                border:     activeTab===key ? 'none'        : '1px solid rgba(255,255,255,.12)',
                padding:'7px 14px', borderRadius:'20px', cursor:'pointer',
                fontFamily:'inherit', fontSize:'12px', fontWeight: activeTab===key ? '600' : '400',
                display:'flex', alignItems:'center', gap:'6px', transition:'.2s',
              }}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'28px', flex:1 }}>
          {activeTab==='events'       && <EventsManager       showToast={showToast}/>}
          {activeTab==='gallery'      && <GalleryManager      showToast={showToast}/>}
          {activeTab==='users'        && <UsersManager        showToast={showToast}/>}
          {activeTab==='testimonials' && <TestimonialsManager showToast={showToast}/>}
          {activeTab==='resources'    && <ResourcesManager    showToast={showToast}/>}
          {activeTab==='content'      && <ContentManager      pageContent={pageContent} setPageContent={setPageContent} showToast={showToast}/>}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideInRight { from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1} }
      `}</style>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  )
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function EventsManager({ showToast }) {
  const t = useT()
  const [events, setEvents]         = useState([])
  const [editing, setEditing]       = useState(null)
  const [detailEvent, setDetailEvent] = useState(null)   // for participant modal
  const [regCounts, setRegCounts]   = useState({})
  const [confCounts, setConfCounts] = useState({})
  const blank = { title:'',description:'',date:'',time:'18:00',location:'',capacity:30,image_url:'' }

  useEffect(() => {
    // Load events
    supabase.from('events').select('*').order('date').then(({data}) => setEvents(data||[]))
    // Load all registration counts in one query
    supabase.from('event_registrations').select('event_id, confirmed').then(({data}) => {
      const reg = {}, conf = {}
      ;(data||[]).forEach(r => {
        reg[r.event_id]  = (reg[r.event_id]  || 0) + 1
        if (r.confirmed) conf[r.event_id] = (conf[r.event_id] || 0) + 1
      })
      setRegCounts(reg)
      setConfCounts(conf)
    })
  }, [])

  const save = async (ev) => {
    const { id, created_at, ...fields } = ev
    if (id) { const {data}=await supabase.from('events').update(fields).eq('id',id).select().single(); setEvents(p=>p.map(e=>e.id===id?data:e)) }
    else    { const {data}=await supabase.from('events').insert(fields).select().single(); setEvents(p=>[...p,data]) }
    setEditing(null); showToast(t('admin.eventSaved'))
  }
  const del = async (id) => {
    if (!confirm(t('confirm.deleteEvent'))) return
    await supabase.from('events').delete().eq('id',id)
    setEvents(p=>p.filter(e=>e.id!==id)); showToast(t('admin.deleted'))
  }

  return (
    <>
      <PanelCard title="Manage Events" action={<AddBtn onClick={()=>setEditing(blank)}/>}>
        {editing && <EventForm ev={editing} onSave={save} onCancel={()=>setEditing(null)}/>}
        <Table heads={['Title','Date','Registered','Confirmed','Cap.','Actions']}>
          {events.map(ev=>(
            <tr key={ev.id}>
              <Td bold>{ev.title}</Td>
              <Td small>{ev.date} {ev.time}</Td>
              <Td>
                <span style={{fontWeight:'700',color:'var(--red)'}}>{regCounts[ev.id]||0}</span>
                <span style={{color:'var(--muted)',fontSize:'11px',marginLeft:'4px'}}>registered</span>
              </Td>
              <Td>
                <span style={{fontWeight:'700',color:'#2e7d32'}}>{confCounts[ev.id]||0}</span>
                <span style={{color:'var(--muted)',fontSize:'11px',marginLeft:'4px'}}>confirmed</span>
              </Td>
              <Td small>{ev.capacity||'—'}</Td>
              <Td style={{whiteSpace:'nowrap'}}>
                <ActBtn
                  onClick={()=>setDetailEvent({...ev, _regCount: regCounts[ev.id]||0, _confirmedCount: confCounts[ev.id]||0})}
                  style={{fontSize:'11px',fontFamily:'inherit',padding:'4px 8px',color:'#1565c0'}}
                  title="View participants"
                >
                  👥 View
                </ActBtn>
                <ActBtn onClick={()=>setEditing(ev)}><Edit2 size={13}/></ActBtn>
                <ActBtn danger onClick={()=>del(ev.id)}><Trash2 size={13}/></ActBtn>
              </Td>
            </tr>
          ))}
        </Table>
      </PanelCard>

      {detailEvent && (
        <AdminEventDetail event={detailEvent} onClose={()=>setDetailEvent(null)} />
      )}
    </>
  )
}

function EventForm({ ev, onSave, onCancel }) {
  const [f, setF] = useState(ev)
  const u = k => e => setF(p=>({...p,[k]:e.target.value}))
  return (
    <FormBox>
      <FRow><FF label="Title"><FI value={f.title||''} onChange={u('title')} placeholder="Event title"/></FF><FF label="Date"><FI type="date" value={f.date||''} onChange={u('date')}/></FF></FRow>
      <FRow><FF label="Time"><FI type="time" value={f.time||''} onChange={u('time')}/></FF><FF label="Capacity"><FI type="number" value={f.capacity||''} onChange={e=>setF(p=>({...p,capacity:+e.target.value}))}/></FF></FRow>
      <FF label="Location"><FI value={f.location||''} onChange={u('location')} placeholder="Venue, City"/></FF>
      <FF label="Image URL"><FI value={f.image_url||''} onChange={u('image_url')} placeholder="https://…"/></FF>
      <FF label="Description"><textarea value={f.description||''} onChange={u('description')} style={{...iSt,minHeight:'72px',resize:'vertical'}} placeholder="Describe the event…"/></FF>
      <FAs onSave={()=>onSave(f)} onCancel={onCancel}/>
    </FormBox>
  )
}

// ── GALLERY ───────────────────────────────────────────────────────────────────
function GalleryManager({ showToast }) {
  const t = useT()
  const [items,setItems]=useState([])
  const [editing,setEditing]=useState(null)
  const blank={title:'',description:'',image_url:''}

  useEffect(()=>{ supabase.from('gallery').select('*').order('created_at',{ascending:false}).then(({data})=>setItems(data||[])) },[])

  const save=async(g)=>{
    const{id,created_at,...fields}=g
    if(id){const{data}=await supabase.from('gallery').update(fields).eq('id',id).select().single();setItems(p=>p.map(x=>x.id===id?data:x))}
    else{const{data}=await supabase.from('gallery').insert(fields).select().single();setItems(p=>[data,...p])}
    setEditing(null);showToast('Saved!')
  }
  const del=async(id)=>{if(!confirm('Delete?'))return;await supabase.from('gallery').delete().eq('id',id);setItems(p=>p.filter(g=>g.id!==id));showToast(t('admin.deleted'))}

  return(
    <PanelCard title="Manage Gallery" action={<AddBtn onClick={()=>setEditing(blank)}/>}>
      {editing&&(
        <FormBox>
          <FF label="Title"><FI value={editing.title||''} onChange={e=>setEditing(p=>({...p,title:e.target.value}))} placeholder="Photo title"/></FF>
          <FF label="Image URL"><FI value={editing.image_url||''} onChange={e=>setEditing(p=>({...p,image_url:e.target.value}))} placeholder="https://…"/></FF>
          <FF label="Description"><FI value={editing.description||''} onChange={e=>setEditing(p=>({...p,description:e.target.value}))} placeholder="Caption"/></FF>
          <FAs onSave={()=>save(editing)} onCancel={()=>setEditing(null)}/>
        </FormBox>
      )}
      <Table heads={['Preview','Title','Description','Actions']}>
        {items.map(g=>(
          <tr key={g.id}>
            <Td>{g.image_url?<img src={g.image_url} alt="" style={{width:'44px',height:'44px',borderRadius:'6px',objectFit:'cover'}}/>:<div style={{width:'44px',height:'44px',borderRadius:'6px',background:'var(--parchment)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🖼️</div>}</Td>
            <Td bold>{g.title}</Td><Td small>{g.description}</Td>
            <Td><ActBtn onClick={()=>setEditing(g)}><Edit2 size={13}/></ActBtn><ActBtn danger onClick={()=>del(g.id)}><Trash2 size={13}/></ActBtn></Td>
          </tr>
        ))}
      </Table>
    </PanelCard>
  )
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function UsersManager({ showToast }) {
  const t = useT()
  const { profile:me }=useAuth()
  const [users,setUsers]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ supabase.from('profiles').select('*').order('created_at').then(({data})=>{setUsers(data||[]);setLoading(false)}) },[])

  const toggleRole=async(u)=>{
    const r=u.role==='admin'?'member':'admin'
    await supabase.from('profiles').update({role:r}).eq('id',u.id)
    setUsers(p=>p.map(x=>x.id===u.id?{...x,role:r}:x));showToast(t('admin.roleUpdated'))
  }
  const del=async(u)=>{
    if(u.id===me?.id){showToast(t('admin.cantDeleteSelf'));return}
    if(!confirm(`Delete ${u.name}?`))return
    await supabase.from('profiles').delete().eq('id',u.id)
    setUsers(p=>p.filter(x=>x.id!==u.id));showToast(t('admin.userRemoved'))
  }

  return(
    <PanelCard title="Manage Users">
      {loading?<Muted>Loading…</Muted>:(
        <Table heads={['Avatar','Name','Email','Role','Actions']}>
          {users.map(u=>(
            <tr key={u.id}>
              <Td><div style={{width:'32px',height:'32px',borderRadius:'50%',background:u.avatar_color||'#C41E3A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'700',color:'#fff'}}>{u.avatar_letters||u.name?.slice(0,2).toUpperCase()||'??'}</div></Td>
              <Td bold>{u.name||'—'}</Td>
              <Td small>{u.email}</Td>
              <Td><Badge color={u.role==='admin'?'red':'blue'}>{u.role}</Badge></Td>
              <Td>
                <ActBtn onClick={()=>toggleRole(u)} style={{fontSize:'11px',fontFamily:'inherit',padding:'3px 8px'}}>{u.role==='admin'?'→member':'→admin'}</ActBtn>
                <ActBtn danger onClick={()=>del(u)}><Trash2 size={13}/></ActBtn>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </PanelCard>
  )
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
function TestimonialsManager({ showToast }) {
  const t = useT()
  const [rows,setRows]=useState([])
  useEffect(()=>{ supabase.from('testimonials').select('*').order('created_at',{ascending:false}).then(({data})=>setRows(data||[])) },[])
  const setStatus=async(id,status)=>{ await supabase.from('testimonials').update({status}).eq('id',id);setRows(p=>p.map(t=>t.id===id?{...t,status}:t));showToast(status==='approved'?t('admin.approved'):t('admin.rejected')) }
  const del=async(id)=>{ if(!confirm(t('confirm.deleteTest')))return;await supabase.from('testimonials').delete().eq('id',id);setRows(p=>p.filter(row=>row.id!==id));showToast(t('admin.deleted')) }
  return(
    <PanelCard title="Manage Testimonials">
      <Table heads={['Author','Rating','Story','Status','Actions']}>
        {rows.map(t=>(
          <tr key={t.id}>
            <Td bold style={{whiteSpace:'nowrap'}}>{t.author_name}</Td>
            <Td><StarRating value={t.rating ?? 5} readOnly size={13} /></Td>
            <Td small style={{maxWidth:'180px'}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>"{t.text}"</span></Td>
            <Td><Badge color={{approved:'green',pending:'yellow',rejected:'red'}[t.status]||'gray'}>{t.status}</Badge></Td>
            <Td style={{whiteSpace:'nowrap'}}>
              {t.status==='pending'&&<><ActBtn style={{color:'#2e7d32'}} onClick={()=>setStatus(t.id,'approved')}><Check size={13}/></ActBtn><ActBtn danger onClick={()=>setStatus(t.id,'rejected')}><X size={13}/></ActBtn></>}
              <ActBtn danger onClick={()=>del(t.id)}><Trash2 size={13}/></ActBtn>
            </Td>
          </tr>
        ))}
      </Table>
    </PanelCard>
  )
}

// ── RESOURCES ─────────────────────────────────────────────────────────────────
function ResourcesManager({ showToast }) {
  const t = useT()
  const [rows,setRows]=useState([])
  const [editing,setEditing]=useState(null)
  const blank={title:'',type:'PDF',file_url:'',description:''}

  useEffect(()=>{ supabase.from('resources').select('*').order('created_at',{ascending:false}).then(({data})=>setRows(data||[])) },[])

  const save=async(r)=>{
    const{id,created_at,...fields}=r
    if(id){const{data}=await supabase.from('resources').update(fields).eq('id',id).select().single();setRows(p=>p.map(x=>x.id===id?data:x))}
    else{const{data}=await supabase.from('resources').insert(fields).select().single();setRows(p=>[data,...p])}
    setEditing(null);showToast('Saved!')
  }
  const del=async(id)=>{ if(!confirm('Delete?'))return;await supabase.from('resources').delete().eq('id',id);setRows(p=>p.filter(r=>r.id!==id));showToast(t('admin.deleted')) }

  return(
    <PanelCard title="Manage Resources" action={<AddBtn onClick={()=>setEditing(blank)}/>}>
      {editing&&(
        <FormBox>
          <FRow>
            <FF label="Title"><FI value={editing.title||''} onChange={e=>setEditing(p=>({...p,title:e.target.value}))} placeholder="Resource title"/></FF>
            <FF label="Type"><select value={editing.type||'PDF'} onChange={e=>setEditing(p=>({...p,type:e.target.value}))} style={iSt}>{['PDF','Document','Video','Audio','Link'].map(t=><option key={t}>{t}</option>)}</select></FF>
          </FRow>
          <FF label="File URL"><FI value={editing.file_url||''} onChange={e=>setEditing(p=>({...p,file_url:e.target.value}))} placeholder="https://…"/></FF>
          <FF label="Description"><FI value={editing.description||''} onChange={e=>setEditing(p=>({...p,description:e.target.value}))} placeholder="Brief description"/></FF>
          <FAs onSave={()=>save(editing)} onCancel={()=>setEditing(null)}/>
        </FormBox>
      )}
      <Table heads={['Title','Type','Description','Actions']}>
        {rows.map(r=>(
          <tr key={r.id}>
            <Td bold>{r.title}</Td>
            <Td><Badge color="blue">{r.type}</Badge></Td>
            <Td small>{r.description}</Td>
            <Td style={{whiteSpace:'nowrap'}}>
              {r.file_url && r.file_url!=='#' && <DownloadButton url={r.file_url} filename={r.title||'resource'} label={null} iconSize={13} style={{display:'inline-flex',background:'none',border:'none',color:'var(--muted)',padding:'4px 6px',borderRadius:'5px',cursor:'pointer'}}/>}
              <ActBtn onClick={()=>setEditing(r)}><Edit2 size={13}/></ActBtn><ActBtn danger onClick={()=>del(r.id)}><Trash2 size={13}/></ActBtn>
            </Td>
          </tr>
        ))}
      </Table>
    </PanelCard>
  )
}

// ── PAGE CONTENT ──────────────────────────────────────────────────────────────
const SECTIONS=[
  {key:'hero',   label:'Hero',    fields:[{k:'title',l:'Title'},{k:'subtitle',l:'Subtitle'},{k:'description',l:'Description',big:true}]},
  {key:'about',  label:'About',   fields:[{k:'mission',l:'Mission',big:true},{k:'history',l:'History',big:true},{k:'values',l:'Values'}]},
  {key:'contact',label:'Contact', fields:[{k:'email',l:'Email'},{k:'phone',l:'Phone'},{k:'address',l:'Address'}]},
]
function ContentManager({ pageContent, setPageContent, showToast }) {
  const t = useT()
  const [editSection,setEditSection]=useState(null)
  const [draft,setDraft]=useState({})
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {SECTIONS.map(sec=>(
        <PanelCard key={sec.key} title={sec.label+' Section'} action={editSection!==sec.key&&<button onClick={()=>{setEditSection(sec.key);setDraft({...pageContent[sec.key]})}} style={{background:'var(--red)',color:'#fff',border:'none',padding:'6px 14px',borderRadius:'6px',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',display:'flex',alignItems:'center',gap:'5px'}}><Edit2 size={11}/>Edit</button>}>
          {editSection===sec.key?(
            <>
              {sec.fields.map(f=>(
                <div key={f.k} style={{marginBottom:'12px'}}>
                  <label style={{display:'block',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',fontWeight:'500',marginBottom:'5px'}}>{f.l}</label>
                  {f.big?<textarea value={draft[f.k]||''} onChange={e=>setDraft(p=>({...p,[f.k]:e.target.value}))} style={{...iSt,minHeight:'70px',resize:'vertical'}}/>:<FI value={draft[f.k]||''} onChange={e=>setDraft(p=>({...p,[f.k]:e.target.value}))}/>}
                </div>
              ))}
              <FAs onSave={()=>{setPageContent(p=>({...p,[sec.key]:draft}));setEditSection(null);showToast(t('admin.contentUpdated'))}} onCancel={()=>setEditSection(null)} saveLabel={t("admin.saved")}/>
            </>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {sec.fields.map(f=>(
                <div key={f.k} style={{display:'flex',gap:'12px',fontSize:'13px'}}>
                  <span style={{color:'var(--muted)',fontSize:'11px',minWidth:'80px',paddingTop:'2px',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.04em'}}>{f.l}</span>
                  <span style={{color:'var(--text)',lineHeight:1.5,flex:1}}>{pageContent[sec.key]?.[f.k]}</span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      ))}
    </div>
  )
}

// ── SHARED PRIMITIVES ─────────────────────────────────────────────────────────
const iSt={width:'100%',padding:'9px 12px',border:'1.5px solid #e0d0c0',borderRadius:'8px',fontSize:'14px',fontFamily:'inherit',outline:'none',background:'#fff',boxSizing:'border-box'}

function PanelCard({title,children,action}){
  return(
    <div style={{background:'#fff',borderRadius:'12px',border:'1px solid var(--border)',padding:'22px',marginBottom:'16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',color:'var(--ink)',margin:0}}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}
function AddBtn({onClick}){return<button onClick={onClick} style={{background:'var(--red)',color:'#fff',border:'none',padding:'7px 14px',borderRadius:'7px',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',display:'flex',alignItems:'center',gap:'5px',fontWeight:'500'}}><Plus size={12}/>Add New</button>}
function Table({heads,children}){return<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}><thead><tr>{heads.map(h=><th key={h} style={{textAlign:'left',padding:'9px 12px',background:'var(--parchment)',color:'var(--muted)',fontSize:'10px',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:'500',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
function Td({children,style,bold,small}){return<td style={{padding:'11px 12px',borderBottom:'1px solid var(--border)',verticalAlign:'middle',color:'var(--text)',fontWeight:bold?'600':undefined,fontSize:small?'12px':undefined,...style}}>{children}</td>}
function ActBtn({children,danger,onClick,style}){return<button onClick={onClick} style={{background:'none',border:'none',cursor:'pointer',padding:'4px 7px',borderRadius:'5px',color:danger?'var(--red)':'var(--muted)',display:'inline-flex',alignItems:'center',transition:'.15s',...style}} onMouseEnter={e=>e.currentTarget.style.background=danger?'#ffeef0':'var(--parchment)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>{children}</button>}
const BC={green:['#e8f5e9','#2e7d32'],red:['#ffeef0','var(--red)'],yellow:['#fff8e1','#f57f17'],blue:['#e3f2fd','#1565c0'],gray:['#f5f5f5','#666']}
function Badge({color,children}){const[bg,fg]=BC[color]||BC.gray;return<span style={{display:'inline-flex',alignItems:'center',padding:'2px 9px',borderRadius:'20px',fontSize:'11px',fontWeight:'500',background:bg,color:fg}}>{children}</span>}
function FormBox({children}){return<div style={{background:'var(--parchment)',borderRadius:'9px',padding:'18px',marginBottom:'18px',border:'1px solid var(--border)'}}>{children}</div>}
function FRow({children}){return<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'12px',marginBottom:'12px'}}>{children}</div>}
function FF({label,children}){return<div><label style={{display:'block',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',fontWeight:'500',marginBottom:'5px'}}>{label}</label>{children}</div>}
function FI({value,onChange,type='text',placeholder}){return<input type={type} value={value} onChange={onChange} placeholder={placeholder} style={iSt}/>}
function FAs({onSave,onCancel,saveLabel='Save'}){return<div style={{display:'flex',gap:'8px',marginTop:'14px'}}><button onClick={onSave} style={{background:'var(--red)',color:'#fff',border:'none',padding:'8px 20px',borderRadius:'7px',fontFamily:'inherit',fontSize:'13px',cursor:'pointer',fontWeight:'500'}}>{saveLabel}</button><button onClick={onCancel} style={{background:'#fff',color:'var(--muted)',border:'1.5px solid #e0d0c0',padding:'8px 16px',borderRadius:'7px',fontFamily:'inherit',fontSize:'13px',cursor:'pointer'}}>Cancel</button></div>}
function Muted({children}){return<p style={{color:'var(--muted)',fontSize:'14px'}}>{children}</p>}
