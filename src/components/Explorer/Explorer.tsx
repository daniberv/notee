// @ts-ignore
// @ts-nocheck
import './Explorer.css';
import Loader from '../Loader';
import { Note } from './Note';

const Explorer = ({ notes, isLoading, onNoteAdded, onSelect, selected }) => {
    const newNote = async () => {
        await window.electron.ipcRenderer.invoke('storeNote', {
            rowId: crypto.randomUUID(),
            title: 'New note...'
        })
        onNoteAdded()
    }

    const toggleTheme = async (theme) => {
        await window.electron.ipcRenderer.invoke('setTheme', theme)
        window.electron.ipcRenderer.send('ipc', 'themed')
    }

    return (<div className={`explorer ${selected ? '' : 'selected'}`}>
        {isLoading ? <Loader /> : (
            <div className="explorer_inner">
                <div className="explorer_items">
                    <div className="explorer_item __new" onClick={newNote}>
                    </div>
                    {notes?.map((note, index) => <Note note={note} key={`${note.id}${index}`} onClick={() => onSelect(note)} />)}
                </div>
                
            </div>
        )}
        <div className="exporer_bottom">
            <div></div>
            <div className="themes">
                <button onClick={() => toggleTheme('paper')} className="theme_paper">Paper</button>
                <button onClick={() => toggleTheme('darky')} className="theme_darky">Darky</button>
                <button onClick={() => toggleTheme('light')} className="theme_light">Light</button>
                <button onClick={() => toggleTheme('terminal')} className="theme_terminal">Terminal</button>
            </div>
        </div>
    </div>)
}

export default Explorer