function skipAds(videoElement) {
    if (videoElement && !videoElement.paused) {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      const adDurationThreshold = 30; 
      if (duration <= adDurationThreshold) {
        videoElement.currentTime = duration;
      }
    }
  }
  
  function handleVideoAdded(videoElement) {
    skipAds(videoElement);
  }
  
  function handleDOMMutation(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.tagName && addedNode.tagName.toLowerCase() === 'video') {
            handleVideoAdded(addedNode);
          }
        }
      }
    }
  }
  
  const observerConfig = { childList: true, subtree: true };
  const observer = new MutationObserver(handleDOMMutation);
  observer.observe(document.body, observerConfig);
  