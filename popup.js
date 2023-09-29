// popup.js
var resultsDiv = document.getElementById("results");

document.getElementById("checkLinks").addEventListener("click", function () {
  var links = document.getElementById("links").value.split("\n");
  resultsDiv.innerHTML = "";

  links.forEach(function (link) {
    checkLink(link);
  });
});

document
  .getElementById("checkBookmarks")
  .addEventListener("click", function () {
    resultsDiv.innerHTML = "";

    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      checkBookmarks(bookmarkTreeNodes);
    });
  });

function checkBookmarks(bookmarkTreeNodes) {
  for (var i = 0; i < bookmarkTreeNodes.length; i++) {
    if (bookmarkTreeNodes[i].url) {
      checkLink(bookmarkTreeNodes[i].url, bookmarkTreeNodes[i].id);
    }

    if (bookmarkTreeNodes[i].children) {
      checkBookmarks(bookmarkTreeNodes[i].children);
    }
  }
}

function checkLink(link, bookmarkId) {
  // Skip checking bookmarks with JavaScript URLs, or URLs ending with .js or .css
  if (
    link.startsWith("javascript:") ||
    link.endsWith(".js") ||
    link.endsWith(".css")
  ) {
    return;
  }

  var timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), 5000);
  });

  Promise.race([fetch(link), timeoutPromise])
    .then(function (response) {
      if (!response.ok) {
        resultsDiv.innerHTML +=
          '<a href="#" id="' +
          bookmarkId +
          '">Delete </a><a href="' +
          link +
          '" target="_blank">' +
          link.substring(7, 50) +
          "...</a> is broken.<br>";
      }
    })
    .catch(function (error) {
      if (error.message === "Request timed out") {
        resultsDiv.innerHTML +=
          '<a href="#" id="' +
          bookmarkId +
          '">Delete </a><a href="' +
          link +
          '" target="_blank">' +
          link.substring(7, 50) +
          "...</a> timed out.<br>";
      } else {
        resultsDiv.innerHTML +=
          '<a href="#" id="' +
          bookmarkId +
          '">Delete </a><a href="' +
          link +
          '" target="_blank">' +
          link.substring(7, 50) +
          "...</a> could not be reached.<br>";
      }
    });
}

resultsDiv.addEventListener("click", function (event) {
  if (event.target.tagName === "A" && event.target.id) {
    chrome.bookmarks.remove(event.target.id, function () {
      event.target.nextSibling.nodeValue = " was deleted.";
    });
  }
});
