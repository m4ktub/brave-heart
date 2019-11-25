#!/usr/bin/env node

const path = require('path');
const zipFolder = require('zip-folder');

function zipName() {
  const pkg = require('../package.json');
  return `${pkg.name}-${pkg.version}.zip`;
}

function continueWith(withValue, withoutValue) {
  return (value) => {
    if (value) {
      withValue(value);
    } else {
      withoutValue();
    }
  }
}

function zip() {
  const srcFolder = path.join(__dirname, 'unpacked');
  const zipFilePath = path.join(__dirname, zipName());

  return new Promise((resolve, reject) => {
    zipFolder(srcFolder, zipFilePath, continueWith(reject, () => resolve(zipFilePath)));
  });
}

zip()
  .then((file) => console.info(`Zip created: ${file}`))
  .catch(console.err);
