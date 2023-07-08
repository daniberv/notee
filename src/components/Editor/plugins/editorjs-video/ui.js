import { IconPicture } from '@codexteam/icons';
import { make } from './utils/dom';

export default class Ui {
  constructor({ api, config, onSelectFile, readOnly }) {
    this.api = api;
    this.config = config;
    this.onSelectFile = onSelectFile;
    this.readOnly = readOnly;
    this.nodes = {
      wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      imageContainer: make('div', [ this.CSS.imageContainer ]),
      fileButton: this.createFileButton(),
      imageEl: undefined,
      imagePreloader: make('div', this.CSS.imagePreloader),
      caption: make('div', [this.CSS.input, this.CSS.caption], {
        contentEditable: !this.readOnly,
      }),
    };

    this.nodes.caption.dataset.placeholder = this.config.captionPlaceholder;
    this.nodes.imageContainer.appendChild(this.nodes.imagePreloader);
    this.nodes.wrapper.appendChild(this.nodes.imageContainer);
    this.nodes.wrapper.appendChild(this.nodes.caption);
    this.nodes.wrapper.appendChild(this.nodes.fileButton);
  }

  get CSS() {
    return {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      button: this.api.styles.button,

      wrapper: 'image-tool',
      imageContainer: 'image-tool__image',
      imagePreloader: 'image-tool__image-preloader',
      imageEl: 'image-tool__image-picture',
      caption: 'image-tool__caption',
    };
  };

  static get status() {
    return {
      EMPTY: 'empty',
      UPLOADING: 'loading',
      FILLED: 'filled',
    };
  }

  render(toolData) {
    if (!toolData.file || Object.keys(toolData.file).length === 0) {
      this.toggleStatus(Ui.status.EMPTY);
    } else {
      this.toggleStatus(Ui.status.UPLOADING);
    }

    return this.nodes.wrapper;
  }

  createFileButton() {
    const button = make('div', [ this.CSS.button ]);

    button.innerHTML = this.config.buttonContent || `${IconPicture} ${this.api.i18n.t('Select a Video')}`;

    button.addEventListener('click', () => {
      this.onSelectFile();
    });

    return button;
  }

  showPreloader(src) {
    this.nodes.imagePreloader.style.backgroundImage = `url(${src})`;

    this.toggleStatus(Ui.status.UPLOADING);
  }

  hidePreloader() {
    this.nodes.imagePreloader.style.backgroundImage = '';
    this.toggleStatus(Ui.status.EMPTY);
  }

  fillImage(url) {
    const tag = /\.mp4$/.test(url) ? 'VIDEO' : 'IMG';

    const attributes = {
      src: url,
    };

    let eventName = 'load';

    if (tag === 'VIDEO') {
      attributes.autoplay = false;
      attributes.loop = true;
      attributes.muted = true;
      attributes.playsinline = true;
      attributes.controls = true;

      eventName = 'loadeddata';
    }

    this.nodes.imageEl = make(tag, this.CSS.imageEl, attributes);

    this.nodes.imageEl.addEventListener(eventName, () => {
      this.toggleStatus(Ui.status.FILLED);

      if (this.nodes.imagePreloader) {
        this.nodes.imagePreloader.style.backgroundImage = '';
      }
    });

    this.nodes.imageContainer.appendChild(this.nodes.imageEl);
  }

  fillCaption(text) {
    if (this.nodes.caption) {
      this.nodes.caption.innerHTML = text;
    }
  }

  toggleStatus(status) {
    for (const statusType in Ui.status) {
      if (Object.prototype.hasOwnProperty.call(Ui.status, statusType)) {
        this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${Ui.status[statusType]}`, status === Ui.status[statusType]);
      }
    }
  }

  applyTune(tuneName, status) {
    this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status);
  }
}