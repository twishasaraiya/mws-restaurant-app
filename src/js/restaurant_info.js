import DBHelper from './dbhelper'
/* let restaurant;
var newMap; */

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap()
})

/**
 * Add event listeners
 */
document
  .getElementById('submit-review')
  .addEventListener('click', writeNewReview)

const stars = document.getElementsByClassName('star')
for (var i = 0; i < stars.length; i++) {
  stars[i].addEventListener('click', function (evt) {
    // console.log(evt.target.id)
    getRating(evt.target.id)
  })
}
/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      // console.log(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      })
      L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
        {
          mapboxToken:
            'pk.eyJ1IjoidHdpc2hhIiwiYSI6ImNqa2ljenJtbDB3bGoza3VraWFndjZsbGQifQ.vV_H7ow2uRMcc_RBFBLROA',
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox.streets'
        }
      ).addTo(self.newMap)
      fillBreadcrumb()
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap)
    }
  })
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.log(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant)
    return
  }
  const id = getParameterByName('id')
  if (!id) {
    // no id found in URL
    var error = 'No restaurant id in URL'
    callback(error, null)
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant
      if (!restaurant) {
        // console.log(error);
        return
      }
      fillRestaurantHTML()
      callback(null, restaurant)
    })
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name')
  name.innerHTML = restaurant.name

  const address = document.getElementById('restaurant-address')
  address.setAttribute('aria-label', `Address ${restaurant.address}`)
  address.innerHTML = restaurant.address

  const image = document.getElementById('restaurant-img')
  image.setAttribute('aria-role', 'img')
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant)
  image.alt = restaurant.name

  const cuisine = document.getElementById('restaurant-cuisine')
  cuisine.setAttribute('aria-label', `Cuisine ${restaurant.cuisine_type}`)
  cuisine.innerHTML = restaurant.cuisine_type

  const ip = document.getElementById('new-review')
  ip.setAttribute(
    'placeholder',
    `Help other foodies by sharing your review of ${restaurant.name}`
  )
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML()
  }
  // fill reviews
  fillReviewsHTML(restaurant.id)
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours')
  for (let key in operatingHours) {
    const row = document.createElement('tr')
    const day = document.createElement('td')
    day.innerHTML = key
    row.appendChild(day)

    const time = document.createElement('td')
    time.innerHTML = operatingHours[key]
    row.appendChild(time)

    hours.appendChild(row)
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = id => {
  DBHelper.fetchAllReviewsById(id).then(reviews => {
    console.log('All reviews', reviews)
    const container = document.getElementById('reviews-container')
    const title = document.createElement('h2')
    title.innerHTML = 'Reviews'
    title.setAttribute('tabindex', '0')
    container.appendChild(title)

    if (!reviews) {
      const noReviews = document.createElement('p')
      noReviews.innerHTML = 'No reviews yet!'
      container.appendChild(noReviews)
      return
    }
    const ul = document.getElementById('reviews-list')
    reviews.forEach(review => {
      console.log('REVIEW', review)
      ul.appendChild(createReviewHTML(review))
    })
    container.appendChild(ul)
  })
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li')
  li.setAttribute('tabindex', '0')
  const name = document.createElement('p')
  name.innerHTML = review.name
  name.className = 'review-name'
  li.appendChild(name)

  const date = document.createElement('p')
  date.className = 'review-date'
  var time = review.updatedAt - review.createdAt
  var mins = time / 60
  var hrs = mins / 60
  var days = hrs / 60
  if (time === 0) date.innerHTML = 'Updated Recently'
  else if (days > 0) date.innerHTML = `Updated ${days} days ago`
  else if (hrs > 0) date.innerHTML = `Updated ${hrs} hours ago`
  else if (mins > 0) date.innerHTML = `Updated ${mins} mins ago`
  else date.innerHTML = `Updated ${time} seconds ago`
  li.appendChild(date)

  const rating = document.createElement('p')
  rating.className = 'review-rating'
  rating.innerHTML = `${review.rating}`
  const icon = document.createElement('img')
  icon.setAttribute('src', '/public/icons/star-solid.svg')
  icon.setAttribute('width', '15em')
  icon.setAttribute('height', '15em')
  rating.appendChild(icon)
  li.appendChild(rating)
  const comments = document.createElement('p')
  comments.className = 'review-body'
  comments.innerHTML = review.comments
  li.appendChild(comments)

  return li
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb')
  const li = document.createElement('li')
  li.innerHTML = restaurant.name
  breadcrumb.appendChild(li)
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 * Get Star Ratings
 */
function getRating (i) {
  var reviewText = document.getElementById('review-type')
  switch (i) {
    case '0':
      reviewText.innerHTML = 'Very Bad'
      break
    case '1':
      reviewText.innerHTML = 'Bad'
      break
    case '2':
      reviewText.innerHTML = 'Good'
      break
    case '3':
      reviewText.innerHTML = 'Very Good'
      break
    case '4':
      reviewText.innerHTML = 'Excellent'
      break
  }
  for (var k = 0; k <= stars.length; k++) {
    var elem = stars[k]
    var exists = elem.classList.contains('star-fill')
    if (k <= i && !exists) elem.classList.add('star-fill')
    else if (k > i && exists) {
      elem.classList.remove('star-fill')
    }
  }
}
const writeNewReview = () => {}
