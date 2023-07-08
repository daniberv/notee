// @ts-ignore
// @ts-nocheck
import { useState, useEffect } from 'react'

const Menu = ({ top, left, items }) => {
    return (
        <div className="context_menu" style={{ top, left }}>
            <ul>
                {items.map((item, index) => 
                    <li key={item.id} onClick={item.cb}>{item.title}</li>
                )}
            </ul>
        </div>
    )
}

const withContextMenu = (Component) => (props) => {
    const [clicked, setClicked] = useState(false);
    const [points, setPoints] = useState({
        x: 0,
        y: 0,
    });

    const handleClick = () => setClicked(false);
    useEffect(() => {
        window.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, []);

    const handleDelete = async (e, id) => {
        await window.electron.ipcRenderer.invoke('deleteNote', {
            rowId: props.note.rowid
        })
        window.electron.ipcRenderer.send('ipc', 'deleted')
    }

    const actions = [
        { id: 0, title: 'Delete note', cb: handleDelete }
    ]

    const onContextMenu = (e) => {
        if(!clicked) {
            e.preventDefault();
            setClicked(true);
            setPoints({
                x: e.pageX,
                y: e.pageY,
            });
        }
    }

    return <div onContextMenu={onContextMenu} style={{ display:"contents"}}>
        <Component {...props} />

        {clicked && <>
            <div className="backdrop" onClick={handleClick} onContextMenu={handleClick}>
                <Menu top={points.y} left={points.x} items={actions} />
            </div>
        </>}
    </div>
}

export default withContextMenu