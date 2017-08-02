import Base from './base';
import config from '../tasks-config';
import { readFileSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { mkfile } from './utility/file';
import { glob } from './utility/glob';
import FileCache from './utility/file-cache';
import Log from './utility/log';
import chokidar from 'chokidar';
import { FuseBox, BabelPlugin, UglifyESPlugin } from 'fuse-box';
import iconv from 'iconv-lite';

export default class Fusebox extends Base {

  constructor() {
    super('fusebox');
  }

  _watch() {
    const { root, src, imports } = config.fusebox;

    // init
    this._watchInit(join(root, '**/*.js'));

    // src
    this._watchSrc(join(src, '**/*.js'));

    // extend or include
    const { argv } = NS;
    if(!argv['fusebox-watch-src']) {
      this._watchOther(join(imports, '**/*.js'));
    }
  }

  /**
   * @return {Promsie}
   */
  _buildAll() {
    const { src } = config.fusebox;
    super._buildAll('fuseboxSet', join(src, '**/*.js'));
  }

  /**
   * @param {string} file
   * @param {Promise}
   */
  _buildSingle(file) {
    const { charset, src, dest } = config.fusebox;
    const { argv } = NS;
    return (async() => {
      const _rootPath = relative(src, file);
      const _dest     = join(dest, _rootPath);
      const _destDir  = dirname(_dest);
      const _destFile = basename(_dest, '.js');
      const _plugins  = [
        BabelPlugin({
          extensions: ['.js'],
          test      : /\.js$/,
        }),
      ];
      if(argv['production'] && _destFile !== 'vendor') {
        _plugins.push(UglifyESPlugin());
      }
      const _fuse = FuseBox.init({
        homeDir   : src,
        output    : `${ _destDir }/$name.js`,
        sourceMaps: !argv['production'],
        cache     : false,
        // writeBundles: false,
        natives: {
          stream : false,
          Buffer : false,
          http   : false,
        },
        plugins: _plugins,
      });
      _fuse.bundle(_destFile).instructions(`>${ _rootPath }`).target('browser');
      await _fuse.run();
      // await _fuse.run().then((producer) => {
      //   const _bundle = producer.bundles.get(_destFile);
      //   console.log(_bundle.context.output.lastPrimaryOutput);
      // });
      // if(charset !== 'utf8') {
      //   _js = iconv.encode(_js, charset).toString();
      // }
      // await mkfile(_dest, _js);
      console.log(`# Created -> ${ _dest }`);
      if(!argv['production']) {
        console.log(`# Created -> ${ _dest }.map`);
      }
    })();
  }

}
