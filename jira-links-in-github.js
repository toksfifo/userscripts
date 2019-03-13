// ==UserScript==
// @name         Replace Jira IDs with links in Github
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tampermonkey.net/index.php?version=4.8&ext=dhdg&updated=true
// @grant        none
// @include *
// ==/UserScript==

(function() {
  'use strict';

  // Your code here...
  console.log("------------------------------ tamper start");

  const titles = document.getElementsByClassName('js-issue-title')
  const mainTitle = titles[0]
  const newHtml = mainTitle.innerHTML.replace(
    /AR-395/gi,
    "<a target='_blank' href='https://jira.braze.com/browse/AR-395'>AR-395</a>"
  )
  mainTitle.innerHTML = newHtml

  console.log("------------------------------ tamper end");
})();
