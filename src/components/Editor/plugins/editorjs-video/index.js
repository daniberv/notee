import Ui from './ui';
import Uploader from './uploader';

import { IconAddBorder, IconStretch, IconAddBackground, IconPicture } from '@codexteam/icons';

export default class Video {
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
      <path d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2.52002 7.11011H21.48" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.52002 2.11011V6.97011" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.48 2.11011V6.52011" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.75 14.4501V13.2501C9.75 11.7101 10.84 11.0801 12.17 11.8501L13.21 12.4501L14.25 13.0501C15.58 13.8201 15.58 15.0801 14.25 15.8501L13.21 16.4501L12.17 17.0501C10.84 17.8201 9.75 17.1901 9.75 15.6501V14.4501V14.4501Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      title: 'Video',
    };
  }

  /**
   * Available image tools
   *
   * @returns {Array}
   */
  static get tunes() {
    return [
      {
        name: 'withBorder',
        icon: IconAddBorder,
        title: 'With border',
        toggle: true,
      },
      {
        name: 'stretched',
        icon: IconStretch,
        title: 'Stretch image',
        toggle: true,
      },
      {
        name: 'withBackground',
        icon: IconAddBackground,
        title: 'With background',
        toggle: true,
      },
    ];
  }

  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    /**
     * Tool's initial config
     */
    this.config = {
      endpoints: config.endpoints || '',
      additionalRequestData: config.additionalRequestData || {},
      additionalRequestHeaders: config.additionalRequestHeaders || {},
      field: config.field || 'image',
      types: config.types || 'image/*',
      captionPlaceholder: this.api.i18n.t(config.captionPlaceholder || 'Caption'),
      buttonContent: config.buttonContent || '',
      uploader: config.uploader || undefined,
      actions: config.actions || [],
    };

    /**
     * Module for file uploading
     */
    this.uploader = new Uploader({
      config: this.config,
      onUpload: (response) => this.onUpload(response),
      onError: (error) => this.uploadingFailed(error),
    });

    /**
     * Module for working with UI
     */
    this.ui = new Ui({
      api,
      config: this.config,
      onSelectFile: () => {
        this.uploader.uploadSelectedFile({
          onPreview: (src) => {
            this.ui.showPreloader(src);
          },
        });
      },
      readOnly,
    });

    /**
     * Set saved state
     */
    this._data = {};
    this.data = data;
  }

  render() {
    return this.ui.render(this.data);
  }

  validate(savedData) {
    return savedData.file && savedData.file.url;
  }

  save() {
    const caption = this.ui.nodes.caption;

    this._data.caption = caption.innerHTML;

    return this.data;
  }

  renderSettings() {
    const tunes = Video.tunes.concat(this.config.actions);

    return tunes.map(tune => ({
      icon: tune.icon,
      label: this.api.i18n.t(tune.title),
      name: tune.name,
      toggle: tune.toggle,
      isActive: this.data[tune.name],
      onActivate: () => {
        /* If it'a user defined tune, execute it's callback stored in action property */
        if (typeof tune.action === 'function') {
          tune.action(tune.name);

          return;
        }
        this.tuneToggled(tune.name);
      },
    }));
  }

  appendCallback() {
    this.ui.nodes.fileButton.click();
  }

  static get pasteConfig() {
    return {
      tags: [
        {
          img: { src: true },
        },
      ],
  
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png|svg|webp)(\?[a-z0-9=]*)?$/i,
      },

      files: {
        mimeTypes: [ 'image/*', 'video/*' ],
      },
    };
  }

  async onPaste(event) {
    switch (event.type) {
      case 'tag': {
        const image = event.detail.data;

        /** Images from PDF */
        if (/^blob:/.test(image.src)) {
          const response = await fetch(image.src);
          const file = await response.blob();

          this.uploadFile(file);
          break;
        }

        this.uploadUrl(image.src);
        break;
      }
      case 'pattern': {
        const url = event.detail.data;

        this.uploadUrl(url);
        break;
      }
      case 'file': {
        const file = event.detail.file;

        this.uploadFile(file);
        break;
      }
    }
  }

  set data(data) {
    this.image = data.file;

    this._data.caption = data.caption || '';
    this.ui.fillCaption(this._data.caption);

    Video.tunes.forEach(({ name: tune }) => {
      const value = typeof data[tune] !== 'undefined' ? data[tune] === true || data[tune] === 'true' : false;

      this.setTune(tune, value);
    });
  }

  get data() {
    return this._data;
  }

  set image(file) {
    this._data.file = file || {};

    if (file && file.url) {
      this.ui.fillImage(file.url);
    }
  }

  onUpload(response) {
    if (response.success && response.file) {
      this.image = response.file;
    } else {
      this.uploadingFailed('incorrect response: ' + JSON.stringify(response));
    }
  }

  uploadingFailed(errorText) {
    console.log('Image Tool: uploading failed because of', errorText);

    this.api.notifier.show({
      message: this.api.i18n.t('Couldn’t upload image. Please try another.'),
      style: 'error',
    });
    this.ui.hidePreloader();
  }

  tuneToggled(tuneName) {
    this.setTune(tuneName, !this._data[tuneName]);
  }

  setTune(tuneName, value) {
    this._data[tuneName] = value;

    this.ui.applyTune(tuneName, value);

    if (tuneName === 'stretched') {
      Promise.resolve().then(() => {
        const blockId = this.api.blocks.getCurrentBlockIndex();

        this.api.blocks.stretchBlock(blockId, value);
      })
        .catch(err => {
          console.error(err);
        });
    }
  }

  uploadFile(file) {
    this.uploader.uploadByFile(file, {
      onPreview: (src) => {
        this.ui.showPreloader(src);
      },
    });
  }

  uploadUrl(url) {
    this.ui.showPreloader(url);
    this.uploader.uploadByUrl(url);
  }
}