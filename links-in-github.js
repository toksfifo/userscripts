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

  const beta = false;
  const verbose = false;
  const brazeProjects = [
    "AGTR", "AR", "APPI", "BD", "PAR", "DA", "DI", "DS", "DES", "TECHOPS", "EMAIL", "ENGR", "TD", "GDPR", "GE", "IC",
    "AIML", "IRT", "ITTECH", "IWD", "MA", "IO", "PBUG", "PI", "PC", "PROD", "PGC", "PDS", "PF", "IT", "SEC", "SS",
    "SRE",
  ]
  const jiraUrlPrefix = "https://jira.braze.com/browse/";
  const sentryUrlPrefix = "https://sentry.io/organizations/braze/issues/?project=289509&query=";

  const linkColor = "#0366d6";

  // Add Dropbox links for all.
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

  // The first capturing group will act as a negative lookbehind. This is to hack around the fact that Firefox
  // doesn't support negative lookbehinds. Strategy derived from https://stackoverflow.com/a/35143111
  const jiraRegex = new RegExp(`(\/|[A-Z])?(?:${brazeProjects.join("|")})-\\d{2,4}`, "gi");
  const sentryRegex = new RegExp(`([A-Z])?PLATFORM-\\w{3}`, "gi");

  const replacement = (match, group1, decorator) => {
    // If we have a group1, discard it by no-opping since it includes the negative lookbehind. Otherwise the match
    // will be the jira ID.
    return group1 ? match : decorator(match)
  }

  const jiraReplacement = (match, group1) => { return replacement(match, group1, decorateJiraId) }
  const sentryReplacement = (match, group1) => { return replacement(match, group1, decorateSentryId) }

  const decorateJiraId = (id) => {
    return `<a target="_blank" style="color: ${linkColor}" href="${jiraUrlPrefix}${id}">${id}</a>`;
  }
  const decorateSentryId = (id) => {
    return `<a target="_blank" style="color: ${linkColor}" href="${sentryUrlPrefix}${id}">${id}</a>`;
  }

  for (let className of classNames) {
    let elements = document.querySelectorAll(className);
    for (let element of elements) {
      let newHtml = element.innerHTML.replace(jiraRegex, jiraReplacement).replace(sentryRegex, sentryReplacement);
      element.innerHTML = newHtml;
    }
  }

  function tests(regex) {
    const inputToOutput = {
      // No chnges.
      " /AR-395": ` /AR-395`,
      "/AR-395": `/AR-395`,
      "https://jira.braze.com/browse/AR-395": `https://jira.braze.com/browse/AR-395`,
      "https://jira.braze.com/browse/UAR-395": `https://jira.braze.com/browse/UAR-395`,
      "boar-395": `boar-395`,

      // One change.
      "AR-395": `${decorateJiraId("AR-395")}`,
      " AR-395 ": ` ${decorateJiraId("AR-395")} `,
      "[AR-395]": `[${decorateJiraId("AR-395")}]`,
      " [AR-395]": ` [${decorateJiraId("AR-395")}]`,
      "stuff AR-395": `stuff ${decorateJiraId("AR-395")}`,
      "AR-395 https://jira.braze.com/browse/AR-395": `${decorateJiraId("AR-395")} https://jira.braze.com/browse/AR-395`,
      "/AR-395 AR-395 https://jira.braze.com/browse/AR-395": `/AR-395 ${decorateJiraId("AR-395")} https://jira.braze.com/browse/AR-395`,

      // Two changes.
      "AR-395 AR-395 https://jira.braze.com/browse/AR-395": `${decorateJiraId("AR-395")} ${decorateJiraId("AR-395")} https://jira.braze.com/browse/AR-395`,
    }
    for (let input in inputToOutput) {
      let expectedOutput = inputToOutput[input]
      let output = input.replace(regex, jiraReplacement)
      console.log(`${output === expectedOutput} for ${input}`)
    }
  }

  tests(jiraRegex)
  console.log("------------------------------ tamper end");
})();
