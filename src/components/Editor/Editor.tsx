// @ts-nocheck
import './Editor.css';
import { useEffect, useRef } from 'react'
import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Delimeter from "@editorjs/delimiter"
import Embed from "@editorjs/embed"
import ImageTool from "./plugins/image"
import Quote from "@editorjs/quote"
import Warning from "@editorjs/warning"
import ImageGallery from "editorjs-gallery"
import Video from "./plugins/editorjs-video"

const EDITOR_HOLDER_ID = "editorjs";

const DEFAULT_INITIAL_DATA = () => {
  return {
    time: new Date().getTime(),
    blocks: [],
  };
};

const Editor = ({ id, data, onChange }) => {
  const ejInstance = useRef();

  useEffect(() => {
    (async () => {
      const userDataPath = await window.electron.ipcRenderer.getPath()

      ejInstance?.current?.clear();
      ejInstance?.current?.destroy();
      ejInstance.current = null;

      const editor = new EditorJS({
        holder: EDITOR_HOLDER_ID,
        logLevel: "ERROR",
        data: data ? data : DEFAULT_INITIAL_DATA,
        onReady: () => {
          if(ejInstance.current === null) {
            ejInstance.current = editor;
          }
        },
        onChange: async (api, event) => {
          if(editor.saver) {
            const content = await editor.saver.save();

            const isChanged = JSON.stringify(content.blocks) !== JSON.stringify(data?.blocks)
            if(isChanged) {
              onChange(content);
            }
          }
        },
        placeholder: 'Tell your story...',
        autofocus: true,
        loader: 'custom-loader',
        tools: {
          header: Header,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
                instagram: true,
                twitter: true,
                pinterest: true,
                vimeo: true,
                facebook: true,
              },
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file) {
                  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
                  let rs = '';
                  while (rs.length < 20) {
                    rs += abc[Math.floor(Math.random() * abc.length)];
                  }
                  const ext = file.path.split('.').pop();
                  const filename = rs + '.' + ext;

                  const coverName = `${userDataPath}/data/${id}/${filename}`

                  const imageFile = {
                    file: file.path,
                    dir: id,
                    newName: coverName
                  };
                  window.electron.ipcRenderer.invoke('uploadImage', imageFile)
                  return new Promise((resolve, reject) => {
                    const req = {
                      success: 1,
                      file: {
                        url: coverName
                      }
                    };
                    setTimeout(() => {
                        resolve(req);
                      }, 1000);
                    });
                },
                uploadByUrl(file) {
                  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
                  let rs = '';
                  while (rs.length < 20) {
                    rs += abc[Math.floor(Math.random() * abc.length)];
                  }
                  const ext = file.path.split('.').pop();
                  const filename = rs + '.' + ext;

                  const coverName = `${userDataPath}/data/${id}/${filename}`

                  const imageFile = {
                    file: file.path,
                    dir: id,
                    newName: coverName
                  };
                  window.electron.ipcRenderer.invoke('uploadImage', imageFile)
                  return new Promise((resolve, reject) => {
                    const req = {
                      success: 1,
                      file: {
                        url: coverName
                      }
                    };
                    setTimeout(() => {
                        resolve(req);
                      }, 1000);
                    });
                }
              },
            },
          },
          video: {
            class: Video,
            config: {
              field: "video",
              types: "video/*",
              uploader: {
                uploadByFile(file) {
                  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
                  let rs = '';
                  while (rs.length < 20) {
                    rs += abc[Math.floor(Math.random() * abc.length)];
                  }
                  const ext = file.path.split('.').pop();
                  const filename = rs + '.' + ext;

                  const coverName = `${userDataPath}/data/${id}/${filename}`

                  const imageFile = {
                    file: file.path,
                    dir: id,
                    newName: coverName
                  };
                  window.electron.ipcRenderer.invoke('uploadImage', imageFile)
                  return new Promise((resolve, reject) => {
                    const req = {
                      success: 1,
                      file: {
                        url: coverName
                      }
                    };
                    setTimeout(() => {
                        resolve(req);
                      }, 1000);
                    });
                }
              }
            },
          },
          gallery: {
            class: ImageGallery,
            config: {
              uploader: {
                uploadByFile(file) {
                  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
                  let rs = '';
                  while (rs.length < 20) {
                    rs += abc[Math.floor(Math.random() * abc.length)];
                  }
                  const ext = file.path.split('.').pop();
                  const filename = rs + '.' + ext;

                  const coverName = `${userDataPath}/data/${id}/${filename}`

                  const imageFile = {
                    file: file.path,
                    dir: id,
                    newName: coverName
                  };
                  window.electron.ipcRenderer.invoke('uploadImage', imageFile)
                  return new Promise((resolve, reject) => {
                    const req = {
                      success: 1,
                      file: {
                        url: coverName
                      }
                    };
                    setTimeout(() => {
                        resolve(req);
                      }, 1000);
                    });
                }
              }
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          delimeter: Delimeter,
          warning: Warning,
          quote: Quote,
        },
      });
    })()

    return () => {
      // ejInstance?.current?.clear();
      ejInstance?.current?.destroy();
      ejInstance.current = null;
    };
  }, [id]);

  return (
      <div className="editor">
          <div className="editor_inner">
              <div id={EDITOR_HOLDER_ID} className="editor"></div>
          </div>
      </div>
  )
}

export default Editor