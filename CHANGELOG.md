Brave Hearth Changelog
======================

Version 0.6.3
-------------

 * Fixed problems with production builds that would prevent payments
 * Youtube - Correctly capture channel after clicking recommended videos

Version 0.6.2
-------------

 * Added help button to popup

Version 0.6.1
-------------

 * Fixed pt locale to be recognized in chrome store
 * Added pt_BR variant to locales (copied from pt_PT)

Version 0.6.0
-------------

  * Added i18n to browser extension
  * Added pt translation
  * Added es translation

Version 0.5.1
-------------

  * Don't show actions, for each entry, in past periods

Version 0.5.0
-------------

  * Added option to change fiat currency
  * Allow to manually edit the donation value of some entries
  * Automatically start next period with entries manually edited
  * Fixed payment failure due to rounding errors
  * Fixed address detection to avoid valid addresses from testnet

Version 0.4.1
-------------

  * Fix detection of empty addresses in Twitter

Version 0.4.0
-------------

  * Also detect Cash Accounts and translate them into an address
  * Added support for Twitter

Version 0.3.0
-------------

  * Added support for read.cash
  * Added support for general donation areas in websites (#2)
  * Fixed favicon display for some websites

Version 0.2.1
-------------

  * Fixed detection of Pay Buttons with custom styles (#1)

Version 0.2.0
-------------

  * Added live payments based on bitsocket and Bitbox SDK
  * Added live price rate to calculat BCH payments
  * Changed default from scanning entire page to scanning only for particular
    header or PayButton instances
