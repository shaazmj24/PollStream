import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Create from './pages/Create'
import Join from './pages/Join'
import Vote from './pages/Vote'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/join" element={<Join />} />
        <Route path="/vote/:code" element={<Vote />} />
        <Route path="/dashboard/:code" element={<Dashboard />} />
        <Route path="/results/:code" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}
