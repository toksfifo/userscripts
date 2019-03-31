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
  const brazeProjects = [
    "AGTR",
    "AR",
    "APPI",
    "BD",
    "PAR",
    "DA",
    "DI",
    "DS",
    "DES",
    "TECHOPS",
    "EMAIL",
    "ENGR",
    "TD",
    "GDPR",
    "GE",
    "IC",
    "AIML",
    "IRT",
    "ITTECH",
    "IWD",
    "MA",
    "IO",
    "PBUG",
    "PI",
    "PC",
    "PROD",
    "PGC",
    "PDS",
    "PF",
    "IT",
    "SEC",
    "SS",
    "SRE",
  ]

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

  // Not sure which strategy to use for starting characters: whitelist (first) or blacklist (second).
  // const jiraRegex = new RegExp(`(?<=(\\s|^|\\[|(<li>)))(${brazeProjects.join("|")})-\\d{2,4}`, "gi");
  const jiraRegex = new RegExp(`(\\s|^|\\[|<li>)((${brazeProjects.join("|")})-\\d{2,4})`, "gi");
  // const jiraRegex = new RegExp(`\\s|^|\\[|(?:<li>)(${brazeProjects.join("|")})-\\d{2,4}`, "gi");
  // const jiraRegex = new RegExp(`(?<!(\/|[A-Z]))(${brazeProjects.join("|")})-\\d{2,4}`, "gi");

  // const sentryRegex = new RegExp(`(?<=(\\s|^|\\[|(<li>)))PLATFORM-\\w{3}`, "gi");
  // const sentryRegex = new RegExp(`(?<!([A-Z]))PLATFORM-\\w{3}`, "gi");
  const sentryRegex = new RegExp(`PLATFORM-\\w{3}`, "gi");

  for (let className of classNames) {
    let elements = document.querySelectorAll(className);
    for (let element of elements) {
      let hasLink = element.innerHTML.match("<a")
      let linkHref = "google.com"
      let linkBody = "stuff"
      let newHtml = element.innerHTML.replace(
        jiraRegex,
        (match, trash, id, project, offset, string) => {
          console.log(match)
          console.log(trash)
          console.log(id)
          console.log(project)
          console.log(offset)
          console.log(string)
          debugger
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
            return `${trash}<a target="_blank" style="color: ${linkColor}" href="https://jira.braze.com/browse/${id}">${id}</a>`
          }
        }
      ).replace(
        sentryRegex,
        (match) => {
          console.log(`${match} for ${className}`)
          return `<a target="_blank" style="color: ${linkColor}" href="https://sentry.io/organizations/braze/issues/?project=289509&query=${match}">${match}</a>`
        }
      );
      element.innerHTML = newHtml;
    }
  }

  function tests(regex) {
    const strings = {
      "AR-395": 1,
      " AR-395 ": 1,
      "[AR-395]": 1,
      " [AR-395]": 1,
      " /AR-395": 0,
      "/AR-395": 0,
      "stuff AR-395": 1,
      "https://jira.braze.com/browse/AR-395": 0,
      "https://jira.braze.com/browse/UAR-395": 0,
      "boar-395": 0,
      "AR-395 https://jira.braze.com/browse/AR-395": 1,
      "/AR-395 AR-395 https://jira.braze.com/browse/AR-395": 1,
      "AR-395 AR-395 https://jira.braze.com/browse/AR-395": 2,
    }
    for (let str in strings) {
      let matches = str.match(regex)
      let numberExpectatedMatches = strings[str]
      if (numberExpectatedMatches == 0) {
        console.log(`for ${str}: ${matches == null}`)
      } else {
        let correctString = true
        for (let match of matches) {
          if (match != "AR-395") {
            correctString = false
            break
          }
        }
        console.log(`for ${str}: ${(matches.length == numberExpectatedMatches) && correctString}`)
      }
    }
  }

  tests(jiraRegex)
  console.log("------------------------------ tamper end");
})();
