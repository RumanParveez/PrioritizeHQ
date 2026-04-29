import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'
import HomeScreen from './screens/HomeScreen'
import WorkspaceScreen from './pages/WorkspaceScreen'
import ToastContainer from './components/ui/Toast'
import { seedTestData } from './lib/seedData'

seedTestData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/release/:releaseId" element={<WorkspaceScreen />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
)
