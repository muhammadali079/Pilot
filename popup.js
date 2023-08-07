
const getActiveTabURL = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        resolve(activeTab);
      } else {
        resolve(null);
      }
    });
  });
};
 

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  const uniqueTimestamps = new Set(); 

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      if (!uniqueTimestamps.has(bookmark.time)) {
        uniqueTimestamps.add(bookmark.time); 
        addNewBookmark(bookmarksElement, bookmark);
      }
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id, {
      type: "PLAY",
      value: bookmarkTime,
    });
  }
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

   if (activeTab) {  
  chrome.tabs.sendMessage(activeTab.id, { type: "DELETE", value: bookmarkTime }, (response) => {
    // The content script has acknowledged the deletion and may have sent back updated bookmarks
    if (response && response.type === "BOOKMARKS_UPDATED") {
         console.log("book mark updated after deletion");
        viewBookmarks(response.bookmarks);
    }
  });
 }
};
const setBookmarkAttributes =  (src , eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  if (src === "play") {
    controlElement.src = chrome.runtime.getURL("assets/play.png");
  } else if (src === "delete") {
    controlElement.src = chrome.runtime.getURL("assets/delete.png");
  }
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {

  const activeTabURL = await getActiveTabURL();
  if (!activeTabURL) {
   console.log("url not found");
    return;
  }

  const url = new URL(activeTabURL.url);
  console.log("url get " , url);
  const videoId = url.searchParams.get("v");

  if (url.hostname === "www.youtube.com" && videoId) {
    console.log("inside the host");
    chrome.storage.sync.get([videoId], (data) => {
      const currentVideoBookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
      console.log("inside the storage get");
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
  }

});