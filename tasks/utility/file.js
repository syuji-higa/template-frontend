import { dirname } from 'path';
import { accessSync, readFileSync, writeFile } from 'fs';
import mkdirp from 'mkdirp';
import { getType } from './type';

/**
 * @param {string} path
 * @return {boolean}
 */
export const hasFile = (path) => {
  try {
    accessSync(path);
    return true;
  }
  catch(err) {
    return false;
  }
};

/**
 * @param {string} path
 * @param {Buffer} buf
 * @return {boolean}
 */
export const sameFile = (path, buf, isBinary = false) => {
  try {
    const _buf = isBinary ?
      new Buffer(readFileSync(path, 'base64'), 'base64') : readFileSync(path);
    return Buffer.compare(buf, _buf) === 0;
  }
  catch(err) {
    return false;
  }
};

/**
 * @param {string} path
 * @param {string} data
 * @param {Object|string} [opts]
 * @return {Promise}
 */
export const mkfile = (path, data, opts = {}) => {
  return new Promise((resolve) => {
    mkdirp(dirname(path), () => {
      writeFile(path, data, opts, resolve);
    });
  });
};
