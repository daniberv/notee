// @ts-ignore
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import debounce from "lodash.debounce"
import './Content.css';
import Textarea from '../Textarea';
import Editor from '../Editor';

const DEFAULT_PREVIEW_IMAGE = ``;

const Content = ({ note }) => {
  const [initialized, setInitialized] = useState(false);
  const [editorData, setEditorData] = useState(note?.body);
  const [imageFile, setImageFile] = useState();
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [imagePreview, setImagePreview] = useState(note?.cover || DEFAULT_PREVIEW_IMAGE);
  const hiddenFileInput = useRef(null);
  const [userDataPath, setUserDataPath] = useState(null)
  const [title, setTitle] = useState('')

   useEffect(() => {
    (async() => {
      setUserDataPath(await window.electron.ipcRenderer.getPath())
    })()
  }, [])

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  const openFolder = () => {
    try {
      window.electron.ipcRenderer.openPath(note.rowid)
    } catch(e) {}
  }

  const onChange = async (e: any) => {
    e.preventDefault();

    setImageFile(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
    setIsImageChanged(true);

    const abc = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
    let rs = '';
    while (rs.length < 20) {
      rs += abc[Math.floor(Math.random() * abc.length)];
    }
    const ext = e.target.files[0].path.split('.').pop();
    const filename = rs + '.' + ext;

    const coverName = `${userDataPath}/data/${note.rowid}/${filename}`

    const imageFile = {
      file: e.target.files[0].path,
      dir: note.rowid,
      newName: coverName
    };

    window.electron.ipcRenderer.invoke('uploadImage', imageFile)
    update({
      cover: coverName
    })
  };

  const handleTitle = debounce((e) => {
      setTitle(e.value)
      update({
        title: e.value
      })
    }, 300)

  useEffect(() => {
    setTitle(note?.title)
    setImagePreview(note?.cover || DEFAULT_PREVIEW_IMAGE)
    setEditorData(note?.body)
  }, [note])

  const onEditorChange = (body) => {
    setEditorData(body)
    update({ body })
  }

  useEffect(() => {
    if(initialized) {
      update({ body: editorData })
    } else {
      setInitialized(true)
    }
  }, [editorData])

  const update = useCallback(async (data) => {
    const newNote = {
      rowId: note.rowid,
      title,
      cover: imagePreview,
      body: editorData,
      ...data
    }

    await window.electron.ipcRenderer.invoke('updateNote', newNote)
    window.electron.ipcRenderer.send('ipc', 'updated')
  }, [title, imagePreview , editorData])

  return (<div className="content">
    <div className="options_button">
      <div>
        <button onClick={openFolder}>Folder</button>
      </div>
    </div>

    <div className="image_preview__wrapper">
      {imagePreview ? <img src={imagePreview} className="image_preview" /> : null}
      <input type="file" onChange={onChange} style={{display: 'none'}} ref={hiddenFileInput} />
      <button onClick={handleClick} className="input_image">
      Upload a cover
      </button>
    </div>

    <Textarea name="title" onChange={handleTitle} value={title} wrapperClassName="editor-text editor-text-title mb mt-2" className="h1" limit={150} />

    <Editor id={note?.rowid} data={editorData} onChange={onEditorChange} />
  </div>)
}

export default Content