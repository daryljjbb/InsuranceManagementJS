import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <button className="btn" style={{ backgroundColor: 'var(--brand-blue)' }}>
       Custom Button
     </button>

     
    </>
  )
}

export default App
