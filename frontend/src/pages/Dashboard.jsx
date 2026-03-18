import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { QRCodeSVG } from 'qrcode.react'
import axios from 'axios'

export default function Dashboard() {
  const { code } = useParams()
  const nav = useNavigate()
  const socketRef = useRef(null)
  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(true)
  const [activeQ, setActiveQ] = useState(0)
  const [showQR, setShowQR] = useState(false)

  const joinUrl = `${window.location.origin}/join`

  useEffect(() => {
    axios.get(`/api/poll/${code}`).then(res => {
      setPoll(res.data)
      setIsOpen(res.data.is_open)
      setResults(res.data.questions.map(q => {
        const obj = {}
        q.options.forEach(o => obj[o] = 0)
        return { question: q.text, options: q.options, votes: obj, total: 0 }
      }))
    })
  }, [code])

  useEffect(() => {
    const socket = io()
    socketRef.current = socket
    socket.emit('join_poll', { poll_code: code })
    socket.on('vote_update', ({ question_index, votes, total }) => {
      setResults(prev => prev.map((r, i) => i === question_index ? { ...r, votes, total } : r))
    })
    socket.on('poll_status', ({ is_open }) => setIsOpen(is_open))
    return () => socket.disconnect()
  }, [code])

  const togglePoll = async () => {
    const res = await axios.post(`/api/poll/${code}/toggle`)
    setIsOpen(res.data.is_open)
  }

  if (!poll) return <div className="page"><p style={{color:'var(--muted)'}}>Loading...</p></div>

  const r = results[activeQ]
  const chartData = r ? r.options.map(opt => ({ name: opt, votes: r.votes[opt] || 0 })) : []
  const COLORS = ['#6c63ff','#ff6584','#34d399','#fbbf24','#60a5fa','#a78bfa','#fb923c','#4ade80']

  return (
    <div className="page" style={{justifyContent:'flex-start',paddingTop:'2rem'}}>
      <div className="card card-wide fade-up" style={{maxWidth:860}}>
        {/* Header */}
        <div className="row" style={{marginBottom:'2rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <div>
            <h2 style={{fontSize:'1.5rem'}}>Host Dashboard</h2>
            <p style={{color:'var(--muted)',fontSize:'0.9rem',marginTop:'0.2rem'}}>
              {poll.host_name ? `by ${poll.host_name} · ` : ''}Code: <span style={{fontFamily:'var(--font-display)',color:'var(--accent)',letterSpacing:'0.1em'}}>{code}</span>
            </p>
          </div>
          <div className="spacer" />
          <div className="row" style={{gap:'0.5rem',flexWrap:'wrap'}}>
            <button className="btn btn-ghost" style={{fontSize:'0.85rem'}} onClick={() => setShowQR(v => !v)}>
              {showQR ? 'Hide QR' : '📱 QR Code'}
            </button>
            <button className={`btn ${isOpen ? 'btn-danger' : 'btn-primary'}`} style={{fontSize:'0.85rem'}} onClick={togglePoll}>
              {isOpen ? '⏸ Close Poll' : '▶ Reopen Poll'}
            </button>
            <button className="btn btn-ghost" style={{fontSize:'0.85rem'}} onClick={() => nav(`/results/${code}`)}>
              Full Results →
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="row" style={{marginBottom:'1.5rem'}}>
          {isOpen
            ? <span className="pill pill-green"><span className="dot" />Accepting votes</span>
            : <span className="pill pill-red"><span className="dot" />Voting closed</span>}
          <span className="pill pill-blue" style={{marginLeft:'0.5rem'}}>
            {results[activeQ]?.total || 0} votes on this question
          </span>
        </div>

        {/* QR */}
        {showQR && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'1.5rem',background:'var(--surface2)',borderRadius:12,marginBottom:'1.5rem',gap:'1rem'}}>
            <div style={{background:'white',padding:16,borderRadius:8}}>
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{color:'var(--muted)',fontSize:'0.85rem'}}>Scan to join · then enter code</p>
              <p style={{fontFamily:'var(--font-display)',fontSize:'2rem',letterSpacing:'0.15em',color:'var(--accent)',marginTop:'0.25rem'}}>{code}</p>
            </div>
          </div>
        )}

        {/* Question tabs */}
        {poll.questions.length > 1 && (
          <div className="row" style={{marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.5rem'}}>
            {poll.questions.map((q, i) => (
              <button key={i} onClick={() => setActiveQ(i)} className="btn" style={{
                padding:'0.4rem 1rem', fontSize:'0.85rem',
                background: activeQ === i ? 'var(--accent)' : 'var(--surface2)',
                color: activeQ === i ? '#fff' : 'var(--muted)',
                border:`1px solid ${activeQ === i ? 'var(--accent)' : 'var(--border)'}`,
              }}>Q{i+1}</button>
            ))}
          </div>
        )}

        {/* Question text */}
        <h3 style={{marginBottom:'1.5rem',fontSize:'1.2rem',color:'var(--text)'}}>{poll.questions[activeQ]?.text}</h3>

        {/* Live chart */}
        <div style={{height:280,marginBottom:'1.5rem'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:5,right:10,bottom:30,left:0}}>
              <XAxis dataKey="name" tick={{fill:'var(--muted)',fontSize:13}} />
              <YAxis allowDecimals={false} tick={{fill:'var(--muted)',fontSize:12}} />
              <Tooltip
                contentStyle={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)'}}
                cursor={{fill:'rgba(108,99,255,0.08)'}}
              />
              <Bar dataKey="votes" radius={[6,6,0,0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vote counts */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'0.75rem'}}>
          {r && r.options.map((opt, i) => {
            const count = r.votes[opt] || 0
            const pct = r.total > 0 ? Math.round((count/r.total)*100) : 0
            return (
              <div key={i} style={{background:'var(--surface2)',borderRadius:10,padding:'1rem',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <span style={{fontSize:'0.85rem',color:'var(--muted)'}}>{opt}</span>
                  <span style={{fontSize:'0.85rem',color:COLORS[i%COLORS.length],fontWeight:700}}>{pct}%</span>
                </div>
                <div style={{height:4,background:'var(--surface)',borderRadius:99}}>
                  <div style={{height:'100%',borderRadius:99,background:COLORS[i%COLORS.length],width:`${pct}%`,transition:'width 0.4s'}} />
                </div>
                <p style={{color:'var(--text)',fontSize:'1.4rem',fontFamily:'var(--font-display)',fontWeight:700,marginTop:'0.5rem'}}>{count}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
