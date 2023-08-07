// function skipAds(videoElement) {
//   if (videoElement && !videoElement.paused) {
//     const currentTime = videoElement.currentTime;
//     const duration = videoElement.duration;
//     const adDurationThreshold = 30; 
//     if (duration <= adDurationThreshold) {
//       videoElement.currentTime = duration;
//     }
//   }
// }

// function handleVideoAdded(videoElement) {
//   skipAds(videoElement);
// }

// function handleDOMMutation(mutationsList, observer) {
//   for (const mutation of mutationsList) {
//     if (mutation.type === 'childList') {
//       for (const addedNode of mutation.addedNodes) {
//         if (addedNode.tagName && addedNode.tagName.toLowerCase() === 'video') {
//           handleVideoAdded(addedNode);
//         }
//       }
//     }
//   }
// }

// const observerConfig = { childList: true, subtree: true };
// const observer = new MutationObserver(handleDOMMutation);
// observer.observe(document.body, observerConfig);


chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v"),
      });
    }
  });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "NEW_BOOKMARK") {
      console.log("data recieved from content script" , message);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.url && activeTab.url.includes("youtube.com/watch")) {
          const queryParameters = activeTab.url.split("?")[1];
          const urlParameters = new URLSearchParams(queryParameters);
          const videoId = urlParameters.get("v");
          console.log( videoId);
          if (videoId) {
           console.log("inside the videoId");
            chrome.storage.sync.get([videoId], (data) => {
                const currentVideoBookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
                const updatedBookmarks = [...currentVideoBookmarks, message.bookmark].sort((a, b) => a.time - b.time);
                console.log("inside the stoarge of backgroind");
                chrome.storage.sync.set({ [videoId]: JSON.stringify(updatedBookmarks) }, () => {
                  chrome.tabs.sendMessage(sender.tab.id, { type: "BOOKMARK_SAVED" });
                });
              });
          }
        }
      });
    }
   
  });



  


