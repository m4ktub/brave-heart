Brave Heart
===========

A browser extension to directly reward web producers with no trusted intermediaries.

The extension monitors the pages you're visiting and looks for Bitcoin Cash addresses in them. The goal is to provide a summary of the pages, channels, or users from which you consume the most content and allow you to contribute to them proportionally in an easy way. This is similar to (and inspired by) Brave Rewards but with the difference that:

  * Addresses are collected directly from the pages you visit;
  * Producers don't have to register to any service;
  * It uses Bitcoin Cash;
  * Producers receive 100% of your contribution;

Build
-----

Building the extension locally can be done through `npm` by installing dependencies and running the `build` script.

```
$> npm install
$> npm run build
```

The zip files will be located under the `dist` directory. Each browser will have its specific file.