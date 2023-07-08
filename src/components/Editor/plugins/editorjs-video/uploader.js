import ajax from '@codexteam/ajax';
import isPromise from './utils/isPromise';

export default class Uploader {
  constructor({ config, onUpload, onError }) {
    this.config = config;
    this.onUpload = onUpload;
    this.onError = onError;
  }

  uploadSelectedFile({ onPreview }) {
    const preparePreview = function (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => {
        onPreview(e.target.result);
      };
    };

    let upload;

    if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
      upload = ajax.selectFiles({ accept: this.config.types }).then((files) => {
        preparePreview(files[0]);

        const customUpload = this.config.uploader.uploadByFile(files[0]);

        if (!isPromise(customUpload)) {
          console.warn('Custom uploader method uploadByFile should return a Promise');
        }

        return customUpload;
      });
    } else {
      upload = ajax.transport({
        url: this.config.endpoints.byFile,
        data: this.config.additionalRequestData,
        accept: this.config.types,
        headers: this.config.additionalRequestHeaders,
        beforeSend: (files) => {
          preparePreview(files[0]);
        },
        fieldName: this.config.field,
      }).then((response) => response.body);
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }

  uploadByUrl(url) {
    let upload;

    if (this.config.uploader && typeof this.config.uploader.uploadByUrl === 'function') {
      upload = this.config.uploader.uploadByUrl(url);

      if (!isPromise(upload)) {
        console.warn('Custom uploader method uploadByUrl should return a Promise');
      }
    } else {
      upload = ajax.post({
        url: this.config.endpoints.byUrl,
        data: Object.assign({
          url: url,
        }, this.config.additionalRequestData),
        type: ajax.contentType.JSON,
        headers: this.config.additionalRequestHeaders,
      }).then(response => response.body);
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }

  uploadByFile(file, { onPreview }) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      onPreview(e.target.result);
    };

    let upload;

    if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
      upload = this.config.uploader.uploadByFile(file);

      if (!isPromise(upload)) {
        console.warn('Custom uploader method uploadByFile should return a Promise');
      }
    } else {
      const formData = new FormData();

      formData.append(this.config.field, file);

      if (this.config.additionalRequestData && Object.keys(this.config.additionalRequestData).length) {
        Object.entries(this.config.additionalRequestData).forEach(([name, value]) => {
          formData.append(name, value);
        });
      }

      upload = ajax.post({
        url: this.config.endpoints.byFile,
        data: formData,
        type: ajax.contentType.JSON,
        headers: this.config.additionalRequestHeaders,
      }).then(response => response.body);
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }
}