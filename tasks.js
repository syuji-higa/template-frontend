import { join, relative } from 'path';
import minimist from 'minimist';
import BrowserSync from './tasks/browser-sync';
import Pug from './tasks/pug';
import PugFactory from './tasks/pug-factory';
import Stylus from './tasks/stylus';
import Webpack from './tasks/webpack';
import Imagemin from './tasks/imagemin';
import Sprite from './tasks/sprite';
import Clean from './tasks/clean';
import UrlList from './tasks/url-list';

global.NS = {};
NS.argv         = minimist(process.argv.slice(2));
NS.isFirstBuild = true;
NS.curtFiles    = {
  destSet: new Set(), pugSet: new Set(), stylusSet: new Set(), webpackSet: new Set(),
};

const { argv } = NS;
const needsAllTask = !argv['coding'] && !argv['scripting'];

const tasks = [];

if(needsAllTask || argv['coding']) {
  const _pug        = new Pug();
  const _pugFactory = new PugFactory();
  const _sprite     = new Sprite();
  const _stylus     = new Stylus();

  const _spriteStylus = (async () => {
    await _sprite.start();
    await _stylus.start();
  });

  tasks.push(_pug.start.bind(_pug));
  tasks.push(_pugFactory.start.bind(_pugFactory));
  tasks.push(_spriteStylus);
}

if(needsAllTask || argv['scripting']) {
  const _webpack = new Webpack();
  tasks.push(_webpack.start.bind(_webpack));
}

if(argv['production']) {
  const _imagemin = new Imagemin();
  tasks.push(_imagemin.start.bind(_imagemin));
}

(async () => {
  await Promise.all(tasks.map((task) => task()));
  if(argv['production']) {
    const _clean = new Clean();
    await _clean.start();
  }
  const _urlList = new UrlList();
  await _urlList.start()
  NS.isFirstBuild = false;
  const _browserSync = new BrowserSync();
  await _browserSync.start();
})();
