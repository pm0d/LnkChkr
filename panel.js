// Chrome extension js file to check bookmarks and pasted links for dead links.
var bookmarkResultsDiv = document.getElementById("bookmarkresults");
var pastedLinksDiv = document.getElementById("pastedLinksResults");

// Function to check if dark mode is enabled and change CSS accordingly
function applyDarkMode() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.getElementById("themeStyle").innerHTML = 'body { background-color: #333; color: #fff; } a { color: #add8e6; } a:visited { color: #fffaaa; }';
  }
}

// Function to validate and check pasted links
function validateAndCheckPastedLinks() {
  var links = document.getElementById("links").value.split("\n");
  pastedLinksDiv.innerHTML = "";
  
  links.forEach(function(link) {
    // Add "http://" to the link if it's missing
    if (!link.match(/^[a-zA-Z]+:\/\//)) {
      link = 'http://' + link;
    }

    try {
      var url = new URL(link);
      checkLinkStatus(url.href, null, pastedLinksDiv);
    } catch (_) {
      displayResult(link, null, " is not a valid URL.", pastedLinksDiv);
    }
  });
}


// Function to check bookmarks
function checkBookmarksStatus() {
  bookmarkResultsDiv.innerHTML = "";
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    traverseBookmarks(bookmarkTreeNodes, bookmarkResultsDiv);
  });
}

// Function to traverse bookmarks
function traverseBookmarks(bookmarkTreeNodes, resultsDiv) {
  bookmarkTreeNodes.forEach(function (bookmarkTreeNode) {
    if (bookmarkTreeNode.url) {
      checkLinkStatus(bookmarkTreeNode.url, bookmarkTreeNode.id, resultsDiv);
    }
    if (bookmarkTreeNode.children) {
      traverseBookmarks(bookmarkTreeNode.children, resultsDiv);
    }
  });
}

// Function to check link status
function checkLinkStatus(link, bookmarkId, resultsDiv) {
  if (link.startsWith("javascript:")) {
    // displayResult(link, bookmarkId, " is a JS bookmarklet.", resultsDiv);
    return;
  }

  var timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Request timed out.")), 15000);
  });

  Promise.race([fetch(link), timeoutPromise])
    .then(function(response) {
      if (!response.ok) {
        displayResult(link, bookmarkId, " is broken.", resultsDiv);
      }
    })
    .catch(function(error) {
      displayResult(link, bookmarkId, " " + error.message, resultsDiv);
    });
}

// Function to display result
function displayResult(link, bookmarkId, message, resultsDiv) {
  resultsDiv.innerHTML += '<a href="' + link + '" title="' + link + '" target="_blank">' + link.replace(/(^\w+:|^)\/\//, "").substring(0, 35) + '...</a><span id="status' + bookmarkId + '">' + message + "</span>" + (bookmarkId ? ' <a href="#" id="' + bookmarkId + '">Delete?</a>' : '') + '<br>';
}

// Function to handle resultsdiv click event and delete bookmark
function deleteBookmark(event) {
  if (event.target.tagName === "A" && event.target.id) {
    event.preventDefault();  // Prevent the default action
    chrome.bookmarks.remove(event.target.id, function () {
      event.target.parentNode.removeChild(event.target);
      document.getElementById("status" + event.target.id).innerText = " was deleted.";
    });
  }
}

// Apply dark mode if enabled
applyDarkMode();

// Add event listeners
document.getElementById("checkPastedLinks").addEventListener("click", validateAndCheckPastedLinks);
document.getElementById("checkBookmarks").addEventListener("click", checkBookmarksStatus);
bookmarkResultsDiv.addEventListener("click", deleteBookmark);
