import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { VitalsProvider } from './context/VitalsContext'
import { useVitalsStream } from './hooks/useVitalsStream'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { PatientDetail } from './pages/PatientDetail'
import { CriticalModal } from './components/ui/CriticalModal'

function AppContent() {
  useVitalsStream()

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-base text-primary font-sans overflow-hidden">
      <Header />
      <div className="flex-grow flex overflow-hidden">
        <Routes>
          <Route path="/" element={<><Sidebar /><Dashboard /></>} />
          <Route path="/patient/:id" element={<PatientDetail />} />
        </Routes>
      </div>
      <CriticalModal />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <VitalsProvider>
        <AppContent />
      </VitalsProvider>
    </BrowserRouter>
  )
}
