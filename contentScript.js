
let youtubePlayer;
let currentVideo = "";
let currentVideoBookmarks = [];

const getTime = t => {
  const date = new Date(0);
  date.setSeconds(t);
   
  const timeString = date.toISOString().slice(11, 19); 
   console.log("time before returning function" , timeString);
  return timeString;
};

function addBookmarkButton() {
  const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

  if (!bookmarkBtnExists) {
    const bookmarkBtn = document.createElement("img");

    bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
    bookmarkBtn.className = "ytp-button " + "bookmark-btn";
    bookmarkBtn.title = "Click to bookmark current timestamp";
    const youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
    youtubeLeftControls.appendChild(bookmarkBtn);
    youtubePlayer = document.getElementsByClassName('video-stream')[0];
    if (youtubePlayer) {
      console.log("youtube player found");
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    } 
    // else {
    //   const observer = new MutationObserver(() => {
    //     youtubePlayer = document.getElementsByClassName('video-stream')[0];
    //     if (youtubePlayer) {
    //       console.log("youtube player found after mutation");
    //       observer.disconnect();
    //       bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    //     }
    //   });

    //   observer.observe(document, { childList: true, subtree: true });
    // }
  
  }
}

function addNewBookmarkEventHandler() {
  const currentTime = youtubePlayer.currentTime;
  console.log("inside the book mark handler")
  console.log(currentTime);
  const newBookmark = {
    time: currentTime,
    desc: "Bookmark at " + getTime(currentTime),
  };
  const existingBookmarkIndex = currentVideoBookmarks.findIndex((b) => b.time === currentTime);
  if (existingBookmarkIndex === -1) {
    currentVideoBookmarks.push(newBookmark);
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks].sort((a, b) => a.time - b.time)),
    });
  }
}


function newVideoLoaded() {
  chrome.storage.sync.get([currentVideo], (data) => {
    currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
    addBookmarkButton();
  });
}
chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const { type, value, videoId } = obj;

  if (type === "NEW") {
    currentVideo = videoId;
    newVideoLoaded();
  } else if (type === "PLAY") {
    youtubePlayer.currentTime = value;
  } else if (type === "DELETE") {
    currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
    chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
    response({ type: "BOOKMARKS_UPDATED", bookmarks: currentVideoBookmarks });
   
  }
 //newVideoLoaded();

});



// const observer = new MutationObserver(() => {
//   youtubePlayer = document.getElementsByClassName('video-stream')[0];
//   if (youtubePlayer) {
//     observer.disconnect();
//     newVideoLoaded();
//   }
// });

// observer.observe(document, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BOOKMARK_SAVED") {
    console.log("Bookmark data saved successfully!");
  }
});