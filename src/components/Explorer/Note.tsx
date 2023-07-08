// @ts-ignore
// @ts-nocheck
import withContextMenu from "../../hocs/withContextMenu";

const Note = withContextMenu(({ note, on, onClick }) => {
    return (
        <div onClick={onClick} className="explorer_item">
            <div className="explorer_item__title">{note.title}</div>
            <div className="explorer_item__body">{note.about}</div>
        </div>
    )
})

export { Note }