// @ts-ignore
// @ts-nocheck
import Image from "@editorjs/image"
    
class CustomImage extends Image {
    removed() {
        const { file } = this._data

        window.electron.ipcRenderer.invoke('deleteImage', file?.url)
    }
}

export default CustomImage