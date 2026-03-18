import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const emptyQuestion = () => ({ text: '', options: ['', ''], time: 60 })

export default function Create() {
  const nav = useNavigate()
  const [hostName, setHostName] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateQ = (qi, field, val) => {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: val } : q))
  }
  const updateOpt = (qi, oi, val) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q
      const opts = [...q.options]
      opts[oi] = val
      return { ...q, options: opts }
    }))
  }
  const addOpt = (qi) => {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q))
  }
  const removeOpt = (qi, oi) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q
      const opts = q.options.filter((_, idx) => idx !== oi)
      return { ...q, options: opts }
    }))
  }
  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()])
  const removeQuestion = (qi) => setQuestions(qs => qs.filter((_, i) => i !== qi))

  const submit = async () => {
    setError('')
    const cleaned = questions.map(q => ({
      text: q.text.trim(),
      options: q.options.map(o => o.trim()).filter(Boolean),
      time: parseInt(q.time) || 60,
    }))
    for (const q of cleaned) {
      if (!q.text) { setError('All questions need text'); return }
      if (q.options.length < 2) { setError('Each question needs at least 2 options'); return }
    }
    setLoading(true)
    try {
      const res = await axios.post('/api/create', { name: hostName, questions: cleaned })
      nav(`/dashboard/${res.data.poll_code}`)
    } catch {
      setError('Failed to create poll. Is the server running?')
    } finally { setLoading(false) }
  }

  return (
    <div className="page" style={{justifyContent:'flex-start',paddingTop:'3rem'}}>
      <div className="card card-wide fade-up">
        <div className="row" style={{marginBottom:'2rem'}}>
          <button className="btn btn-ghost" style={{padding:'0.5rem 1rem',fontSize:'0.9rem'}} onClick={() => nav('/')}>← Back</button>
          <h2 style={{flex:1,textAlign:'center',fontSize:'1.6rem'}}>Create Poll</h2>
          <div style={{width:80}} />
        </div>

        <div className="gap">
          <div>
            <label className="label">Your name (optional)</label>
            <input className="input" placeholder="Host name" value={hostName} onChange={e => setHostName(e.target.value)} />
          </div>

          {questions.map((q, qi) => (
            <div key={qi} style={{background:'var(--surface2)',borderRadius:12,padding:'1.5rem',border:'1px solid var(--border)'}}>
              <div className="row" style={{marginBottom:'1rem'}}>
                <span style={{color:'var(--accent)',fontWeight:700,fontFamily:'var(--font-display)'}}>Q{qi + 1}</span>
                <div className="spacer" />
                {questions.length > 1 && (
                  <button className="btn btn-ghost" style={{padding:'0.3rem 0.75rem',fontSize:'0.8rem',color:'var(--accent2)'}} onClick={() => removeQuestion(qi)}>Remove</button>
                )}
              </div>
              <div className="gap-sm" style={{marginBottom:'1rem'}}>
                <input className="input" placeholder="Question text" value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)} />
              </div>
              <div className="gap-sm" style={{marginBottom:'1rem'}}>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="row">
                    <span style={{color:'var(--muted)',fontSize:'0.85rem',minWidth:22,fontWeight:600}}>{String.fromCharCode(65+oi)}</span>
                    <input className="input" placeholder={`Option ${String.fromCharCode(65+oi)}`} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} />
                    {q.options.length > 2 && (
                      <button className="btn btn-ghost" style={{padding:'0.4rem 0.6rem',fontSize:'0.8rem'}} onClick={() => removeOpt(qi, oi)}>✕</button>
                    )}
                  </div>
                ))}
                {q.options.length < 8 && (
                  <button className="btn btn-ghost" style={{alignSelf:'flex-start',padding:'0.4rem 1rem',fontSize:'0.85rem'}} onClick={() => addOpt(qi)}>+ Add option</button>
                )}
              </div>
              <div className="row">
                <label className="label" style={{margin:0}}>Timer (seconds)</label>
                <input className="input" type="number" min={10} max={600} style={{maxWidth:100}} value={q.time} onChange={e => updateQ(qi, 'time', e.target.value)} />
              </div>
            </div>
          ))}

          <button className="btn btn-ghost" onClick={addQuestion}>+ Add another question</button>

          {error && <p style={{color:'var(--accent2)',fontSize:'0.9rem'}}>{error}</p>}

          <button className="btn btn-primary btn-full" style={{marginTop:'0.5rem',fontSize:'1.1rem',padding:'1rem'}} onClick={submit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll →'}
          </button>
        </div>
      </div>
    </div>
  )
}
