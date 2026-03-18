import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Join() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const join = () => {
    const c = code.trim().toUpperCase()
    if (!c || c.length !== 7) { setError('Enter a valid 7-character code'); return }
    if (!name.trim()) { setError('Enter your name'); return }
    sessionStorage.setItem('voter_name', name.trim())
    nav(`/vote/${c}`)
  }

  return (
    <div className="page">
      <div className="card fade-up">
        <div className="row" style={{marginBottom:'2rem'}}>
          <button className="btn btn-ghost" style={{padding:'0.5rem 1rem',fontSize:'0.9rem'}} onClick={() => nav('/')}>← Back</button>
          <h2 style={{flex:1,textAlign:'center',fontSize:'1.6rem'}}>Join Poll</h2>
          <div style={{width:80}} />
        </div>
        <div className="gap">
          <div>
            <label className="label">Your name</label>
            <input className="input" placeholder="e.g. Alex" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Poll code</label>
            <input
              className="input"
              placeholder="e.g. AB1C2D3"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && join()}
              style={{fontSize:'1.4rem',letterSpacing:'0.2em',textAlign:'center',fontFamily:'var(--font-display)'}}
              maxLength={7}
            />
          </div>
          {error && <p style={{color:'var(--accent2)',fontSize:'0.9rem'}}>{error}</p>}
          <button className="btn btn-primary btn-full" style={{fontSize:'1.1rem',padding:'1rem',marginTop:'0.5rem'}} onClick={join}>
            Join →
          </button>
        </div>
      </div>
    </div>
  )
}
