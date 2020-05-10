#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zipFolder = require('zip-folder');

function zipName(browser) {
  const pkg = require('../package.json');
  return `${pkg.name}-${browser || "default"}-${pkg.version}.zip`;
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

function zip(browser) {
  const srcFolder = path.join(__dirname, browser);
  const zipFilePath = path.join(__dirname, zipName(browser));

  return new Promise((resolve, reject) => {
    zipFolder(srcFolder, zipFilePath, continueWith(reject, () => resolve(zipFilePath)));
  });
}

['chrome', 'firefox'].forEach(browser => {
  zip(browser)
    .then(file => console.info(`Zip created: ${file}`))
    .catch(console.err);
});
