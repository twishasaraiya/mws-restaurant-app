const config = {
  rootMargin: "0px",
  threshold: 0.5
};

const loadImage = lazyImage => {
  lazyImage.src = lazyImage.dataset.src;
  lazyImage.srcset = lazyImage.dataset.srcset;
  lazyImage.classList.remove("lazy");
};
window.addEventListener("load", function() {
  //console.log('Lazy loading images');
  var lazyImages = document.getElementsByClassName("lazy");
  if ("IntersectionObserver" in window) {
    //console.log('IntersectionObserver supported');
    let io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          loadImage(lazyImage);
          io.unobserve(lazyImage);
        }
      });
    }, config);

    for (var i = 0; i < lazyImages.length; i++) {
      io.observe(lazyImages[i]);
    }
  } else {
    //console.log('IntersectionObserver not supported');
    lazyImages.forEach(image => loadImage(image));
  }
});
