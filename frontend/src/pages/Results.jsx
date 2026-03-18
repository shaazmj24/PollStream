import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import axios from 'axios'

const COLORS = ['#6c63ff','#ff6584','#34d399','#fbbf24','#60a5fa','#a78bfa','#fb923c','#4ade80']

export default function Results() {
  const { code } = useParams()
  const nav = useNavigate()
  const [results, setResults] = useState(null)

  useEffect(() => {
    axios.get(`/api/poll/${code}/results`).then(res => setResults(res.data))
      .catch(() => nav('/'))
  }, [code])

  if (!results) return <div className="page"><p style={{color:'var(--muted)'}}>Loading...</p></div>

  return (
    <div className="page" style={{justifyContent:'flex-start',paddingTop:'2rem'}}>
      <div className="card card-wide fade-up" style={{maxWidth:800}}>
        <div className="row" style={{marginBottom:'2rem'}}>
          <button className="btn btn-ghost" style={{padding:'0.5rem 1rem',fontSize:'0.9rem'}} onClick={() => nav('/')}>← Home</button>
          <h2 style={{flex:1,textAlign:'center',fontSize:'1.5rem'}}>Poll Results</h2>
          <div style={{width:80}} />
        </div>

        {results.results.map((q, qi) => {
          const data = q.options.map(o => ({ name: o, votes: q.votes[o] || 0 }))
          const winner = data.reduce((a, b) => a.votes >= b.votes ? a : b, data[0])
          return (
            <div key={qi} style={{marginBottom:'2.5rem',paddingBottom:'2.5rem',borderBottom: qi < results.results.length-1 ? '1px solid var(--border)' : 'none'}}>
              <div className="row" style={{marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
                <h3 style={{fontSize:'1.15rem'}}>{q.question}</h3>
                <span className="pill pill-blue">{q.total} votes</span>
              </div>
              {q.total > 0 && (
                <div className="row" style={{marginBottom:'1rem'}}>
                  <span style={{fontSize:'0.85rem',color:'var(--muted)'}}>
                    🏆 Leading: <span style={{color:'var(--accent)',fontWeight:600}}>{winner.name}</span>
                    {' '}({q.total > 0 ? Math.round((winner.votes/q.total)*100) : 0}%)
                  </span>
                </div>
              )}
              <div style={{height:220,marginBottom:'1rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{top:5,right:10,bottom:30,left:0}}>
                    <XAxis dataKey="name" tick={{fill:'var(--muted)',fontSize:12}} />
                    <YAxis allowDecimals={false} tick={{fill:'var(--muted)',fontSize:11}} />
                    <Tooltip contentStyle={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)'}} cursor={{fill:'rgba(108,99,255,0.08)'}} />
                    <Bar dataKey="votes" radius={[6,6,0,0]}>
                      {data.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'0.6rem'}}>
                {q.options.map((opt, i) => {
                  const count = q.votes[opt] || 0
                  const pct = q.total > 0 ? Math.round((count/q.total)*100) : 0
                  return (
                    <div key={i} style={{background:'var(--surface2)',borderRadius:8,padding:'0.75rem',border:'1px solid var(--border)'}}>
                      <div className="row" style={{marginBottom:'0.4rem'}}>
                        <span style={{fontSize:'0.8rem',color:'var(--muted)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{opt}</span>
                        <span style={{fontSize:'0.8rem',color:COLORS[i%COLORS.length],fontWeight:700}}>{pct}%</span>
                      </div>
                      <p style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.3rem',color:'var(--text)'}}>{count}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
