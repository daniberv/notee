import './TitleBar.css';
// import IconMin from '../../../assets/icons/min-w-10.png';
import IconMax from './../../assets/icons/max-w-10.png';
import IconClose from './../../assets/icons/close-w-10.png';
import { useState } from 'react';

const windowCommand = (arg: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.electron.ipcRenderer.windowCommand(arg);
};

const TitleBar = () => {
  const [uuid, setUuid] = useState(0);

  const onClose = () => {
    setUuid(uuid + 1);
    windowCommand('close');
  }

  return (
    <header id="title-bar">
      <div id="drag-region">
        <div id="window-title"></div>
        <div id="window-controls">
          <button
            type="button"
            className="button"
            id="max-button"
            onClick={() => windowCommand('maximize')}
          >
            <img
              className="icon"
              src={IconMax}
              draggable="false"
              alt="Maximizar"
              title="Maximizar"
            />
          </button>
          <button
            type="button"
            className="button"
            id="close-button"
            onClick={onClose}
          >
            <img
              className="icon"
              src={IconClose}
              draggable="false"
              alt="Cerrar"
              title="Cerrar"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TitleBar;
