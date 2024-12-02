import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import DependencyView from './pages/DependencyView'
import { About } from './pages/About'

function App() {

  return (
    <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dependency" element={<DependencyView />} />
          <Route path="/about" element={<About />} />
        </Routes>
    </>
  )
}

export default App
