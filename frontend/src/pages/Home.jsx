import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()
  return (
    <div className="page">
      <div className="fade-up" style={{textAlign:'center',maxWidth:520}}>
        <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>⚡</div>
        <h1 style={{fontSize:'3.5rem',marginBottom:'0.75rem'}}>PollStream</h1>
        <p style={{color:'var(--muted)',fontSize:'1.15rem',marginBottom:'2.5rem',lineHeight:1.6}}>
          Real-time polls. Live results. Zero friction.
        </p>
        <div className="row" style={{justifyContent:'center',gap:'1rem',flexWrap:'wrap'}}>
          <button className="btn btn-primary" style={{fontSize:'1.1rem',padding:'0.9rem 2rem'}} onClick={() => nav('/create')}>
            Create Poll
          </button>
          <button className="btn btn-ghost" style={{fontSize:'1.1rem',padding:'0.9rem 2rem'}} onClick={() => nav('/join')}>
            Join Poll
          </button>
        </div>
      </div>
    </div>
  )
}
