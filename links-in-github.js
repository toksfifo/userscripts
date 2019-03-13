// ==UserScript==
// @name         Jira and Sentry links in Github
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tampermonkey.net/index.php?version=4.8&ext=dhdg&updated=true
// @grant GM_openInTab
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// @include *
// ==/UserScript==

(function() {
  console.log("------------------------------ tamper start");
  'use strict';

  function openInNewTab(url) {
    // const win = window.open(url, "_blank");
    // win.focus();
    GM_openInTab(url);
  }

  const beta = false;
  const verbose = false;

  const linkColor = "#0366d6";
  // const linkColor = "rgb(215, 63, 133)"

  // dropbox link for all
  const classNameWhitelist = [
    ".js-issue-title", // PR title 2x
    ".comment-body", // PR body
    ".commit.full-commit .commit-title", // specific commit link
  ];

  const classNameWhitelistExtended = [
    ".message.js-navigation-open", // list of commits
    ".js-issue-row", // list of PRs
  ];

  const classNames = beta ? classNameWhitelist.concat(classNameWhitelistExtended) : classNameWhitelist;

  for (let className of classNames) {
    let elements = document.querySelectorAll(className);
    for (let element of elements) {
      let hasLink = element.innerHTML.match("<a")
      let linkHref = "google.com"
      let linkBody = "stuff"
      let newHtml = element.innerHTML.replace(
        /(?<!\/)[A-Z]{2,}-\d{2,4}/gi,
        (match) => {
          console.log(`${match} for ${className}`)
          // return `<span onclick="openInNewTab(https://jira.braze.com/browse/${match})">${match}</span>`
          // console.log(hasLink)
          if (className === ".message.js-navigation-open" && beta) {
            return `
            </a>
            <a target="_blank" style="color: ${linkColor}" href="https://jira.braze.com/browse/${match}">${match}</a>
            <a href="${linkHref}">${linkBody}</a>
            `
          } else {
            return `<a target="_blank" style="color: ${linkColor}" href="https://jira.braze.com/browse/${match}">${match}</a>`
          }
        }
      ).replace(
        /(?<!\/)PLATFORM-\w{3}/gi,
        (match) => {
          console.log(`${match} for ${className}`)
          return `<a target="_blank" style="color: ${linkColor}" href="https://sentry.io/organizations/braze/issues/?project=289509&query=${match}">${match}</a>`
        }
      );
      element.innerHTML = newHtml;
    }
  }

  // regex specs
  // function run(strings, regex) {
  //   for (str of strings) {
  //     console.log(str.match(regex))
  //   }
  // }
  // cases = ["AR-395", " AR-395 ", "[AR-395]", " [AR-395]", " /AR-395", "/AR-395", "stuff AR-395"]


  console.log("------------------------------ tamper end");
})();


// <a aria-label="DI-459 Send device_id to Currents for install/uninstall events (#18644)"
// class="message js-navigation-open" data-pjax="true"
// href="/Appboy/platform/commit/25da0ee745327bb86f44b2ee073240591adff0e3">
//   blah DI-459 Send device_id to Currents for install/uninstall events (
// </a>

// <a aria-label="DI-459 Send device_id to Currents for install/uninstall events (#18644)"
// class="message js-navigation-open" data-pjax="true"
// href="/Appboy/platform/commit/25da0ee745327bb86f44b2ee073240591adff0e3">
//   blah</a>
//   <a href="blah">DI-459</a>
//   <a href="oroginal">Send device_id to Currents for install/uninstall events (
// </a>
