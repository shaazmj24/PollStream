import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function Vote() {
  const { code } = useParams()
  const nav = useNavigate()
  const socketRef = useRef(null)
  const [poll, setPoll] = useState(null)
  const [error, setError] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState({})   // qIndex -> option
  const [timers, setTimers] = useState({})         // qIndex -> seconds left
  const [expired, setExpired] = useState({})       // qIndex -> bool
  const [closed, setClosed] = useState(false)
  const voterId = useRef(sessionStorage.getItem('voter_id') || (() => {
    const id = genId(); sessionStorage.setItem('voter_id', id); return id
  })())
  const voterName = sessionStorage.getItem('voter_name') || 'Anonymous'

  useEffect(() => {
    axios.get(`/api/poll/${code}`).then(res => {
      const p = res.data
      setPoll(p)
      setClosed(!p.is_open)
      const t = {}
      p.questions.forEach((q, i) => { t[i] = parseInt(q.time) || 60 })
      setTimers(t)
    }).catch(() => setError('Poll not found'))
  }, [code])

  useEffect(() => {
    const socket = io()
    socketRef.current = socket
    socket.emit('join_poll', { poll_code: code })
    socket.on('poll_status', ({ is_open }) => setClosed(!is_open))
    return () => socket.disconnect()
  }, [code])

  // Per-question countdown
  useEffect(() => {
    if (!poll || expired[qIndex]) return
    const interval = setInterval(() => {
      setTimers(prev => {
        const t = (prev[qIndex] ?? 0) - 1
        if (t <= 0) {
          setExpired(e => ({ ...e, [qIndex]: true }))
          clearInterval(interval)
          return { ...prev, [qIndex]: 0 }
        }
        return { ...prev, [qIndex]: t }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [poll, qIndex, expired])

  const vote = (option) => {
    if (expired[qIndex] || closed) return
    setSelected(s => ({ ...s, [qIndex]: option }))
    socketRef.current?.emit('cast_vote', {
      voter_id: voterId.current,
      voter_name: voterName,
      poll_code: code,
      question_index: qIndex,
      option,
    })
  }

  if (error) return (
    <div className="page"><div className="card fade-up" style={{textAlign:'center'}}>
      <p style={{color:'var(--accent2)',marginBottom:'1rem'}}>{error}</p>
      <button className="btn btn-ghost" onClick={() => nav('/')}>Go home</button>
    </div></div>
  )
  if (!poll) return <div className="page"><p style={{color:'var(--muted)'}}>Loading...</p></div>

  const q = poll.questions[qIndex]
  const timeLeft = timers[qIndex] ?? 0
  const isExpired = expired[qIndex]
  const isLast = qIndex === poll.questions.length - 1

  return (
    <div className="page" style={{justifyContent:'flex-start',paddingTop:'3rem'}}>
      <div className="card card-wide fade-up">
        {/* Header */}
        <div className="row" style={{marginBottom:'1.5rem'}}>
          <span style={{color:'var(--muted)',fontSize:'0.9rem'}}>👋 {voterName}</span>
          <div className="spacer" />
          {closed
            ? <span className="pill pill-red"><span className="dot" />Poll closed</span>
            : <span className="pill pill-green"><span className="dot" />Live</span>}
        </div>

        {/* Progress */}
        {poll.questions.length > 1 && (
          <div style={{marginBottom:'1.5rem'}}>
            <div className="row" style={{marginBottom:'0.4rem'}}>
              <span style={{color:'var(--muted)',fontSize:'0.85rem'}}>Question {qIndex+1} of {poll.questions.length}</span>
            </div>
            <div style={{height:4,background:'var(--surface2)',borderRadius:99}}>
              <div style={{height:'100%',borderRadius:99,background:'var(--accent)',width:`${((qIndex+1)/poll.questions.length)*100}%`,transition:'width 0.3s'}} />
            </div>
          </div>
        )}

        {/* Timer */}
        <div style={{textAlign:'right',marginBottom:'1rem'}}>
          {isExpired || closed
            ? <span style={{color:'var(--accent2)',fontWeight:700}}>Time's up</span>
            : <span style={{color: timeLeft <= 10 ? 'var(--accent2)' : 'var(--muted)',fontWeight:600,fontFamily:'var(--font-display)',fontSize:'1.1rem'}}>{timeLeft}s</span>}
        </div>

        {/* Question */}
        <h2 style={{fontSize:'1.6rem',marginBottom:'1.5rem',lineHeight:1.3}}>{q.text}</h2>

        {/* Options */}
        <div className="gap-sm" style={{marginBottom:'2rem'}}>
          {q.options.map((opt, oi) => {
            const isSelected = selected[qIndex] === opt
            return (
              <button
                key={oi}
                onClick={() => vote(opt)}
                disabled={isExpired || closed}
                style={{
                  display:'flex', alignItems:'center', gap:'1rem',
                  padding:'1rem 1.25rem', borderRadius:12,
                  background: isSelected ? 'rgba(108,99,255,0.15)' : 'var(--surface2)',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  color:'var(--text)', cursor: (isExpired||closed) ? 'not-allowed' : 'pointer',
                  opacity: (isExpired||closed) && !isSelected ? 0.5 : 1,
                  transition:'all 0.15s', textAlign:'left', width:'100%',
                  fontFamily:'var(--font-body)', fontSize:'1rem',
                }}
              >
                <span style={{
                  minWidth:32, height:32, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', fontWeight:700,
                  fontSize:'0.85rem', background: isSelected ? 'var(--accent)' : 'var(--surface)',
                  color: isSelected ? '#fff' : 'var(--accent)',
                  border:`1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  {String.fromCharCode(65+oi)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="row">
          {qIndex > 0 && <button className="btn btn-ghost" onClick={() => setQIndex(i => i-1)}>← Prev</button>}
          <div className="spacer" />
          {!isLast
            ? <button className="btn btn-primary" onClick={() => setQIndex(i => i+1)}>Next →</button>
            : <button className="btn btn-primary" onClick={() => nav(`/results/${code}`)}>See Results →</button>}
        </div>
      </div>
    </div>
  )
}
