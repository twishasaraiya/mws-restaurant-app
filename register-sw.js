if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(function(registeration) {
      //console.log('Service Worker registered');
    })
    .catch(function(error) {
      //console.log('Failed to register Service Worker');
    });
}
