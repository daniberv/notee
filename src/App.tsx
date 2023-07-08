// @ts-nocheck
// import reactLogo from './assets/react.svg'
// import viteLogo from '/electron-vite.animate.svg'
import './styles/App.css'
import TitleBar from './components/TitleBar'
import Explorer from './components/Explorer'
import Content from './components/Content'
import Welcome from './components/Welcome'
import { useEffect, useState } from 'react'

function App() {
  const [theme, setTheme] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFakeLoading, setIsFakeLoading] = useState(false)
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState(null)

  useEffect(() => {
    checkTheme()

    window.electron.ipcRenderer.on('themed', checkTheme)
    window.electron.ipcRenderer.on('deleted', onDelete)
    window.electron.ipcRenderer.on('updated', fetchNotes)
    fetchNotes()
  }, []);

  const checkTheme = async () => {
    const t = await window.electron.ipcRenderer.invoke('getTheme') || 'light'
    setTheme(t)
    const htmlTag = document.getElementsByTagName("html")[0]
    htmlTag.setAttribute("data-theme", t)
  }

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      setNotes(await window.electron.ipcRenderer.invoke('getNotes'))
    } catch(e) {
      console.log('DB Error ::', e)
    } finally {
      setIsLoading(false)
    }
  }

  const onDelete = () => {
    fetchNotes()
    setNote(null)
  }

  const onSelect = (note) => {
    setIsFakeLoading(true)
    setNote(note)
    setTimeout(() => {
      setIsFakeLoading(false)
    }, 100)
  }

  return (
    <div className={`main-window ${theme}`}>
      <TitleBar />
      <Explorer notes={notes} onNoteAdded={fetchNotes} isLoading={isLoading} onSelect={onSelect} selected={!!note} />
      {!note ? <Welcome /> : (
        <>
          {!isFakeLoading && <Content note={note} />}
        </>
      )}
      
    </div>
  )
}

export default App
