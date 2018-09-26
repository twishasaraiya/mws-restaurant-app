/**
 * Common database helper functions.
 */

import idb from 'idb'

window.addEventListener('online', () => {
  console.log('online')
  // check if any requests exist in objectStore
  var dbPromise = DBHelper.openIdb()
  dbPromise.then(db => {
    db.transaction('pending', 'readonly')
      .objectStore('pending')
      .count()
      .then(req => {
        console.log('Pending requests', req)

        if (req > 0) DBHelper.commitPendingRequests()
      })
  })
})

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get RESTAURANTS_URL () {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`
  }
  /**
   * Stage 3 : All reviews url
   */
  static get REVIEWS_URL () {
    const port = 1337
    return `http://localhost:${port}/reviews/`
  }
  /**
   * Create Indexed DB
   */
  static checkIdb () {
    return 'indexedDB' in window
  }

  static openIdb () {
    if (!DBHelper.checkIdb()) return
    return idb.open('test-db', 1, upgradeDB => {
      // console.log('indexeDB created!');
      upgradeDB.createObjectStore('restaurants', { keyPath: 'id' })
      upgradeDB.createObjectStore('reviews', { keyPath: 'id' })
      upgradeDB.createObjectStore('pending', {
        keyPath: 'id',
        autoIncrement: true
      })
    })
  }
  /*
   * Add restaurant to indexeDB
   */
  static addRestaurantToIdb (data) {
    const dbPromise = DBHelper.openIdb()
    return dbPromise.then(db => {
      var tx = db.transaction('restaurants', 'readwrite')
      var store = tx.objectStore('restaurants')
      data.map(restaurant => store.put(restaurant))
      return tx.complete
    })
  }

  /*
  * Add Review to Indexeddb
  */
  static addReviewToIdb (review) {
    const dbPromise = DBHelper.openIdb()
    return dbPromise.then(db => {
      var tx = db.transaction('reviews', 'readwrite')
      var store = tx.objectStore('reviews')
      store.put(review)
      return tx.complete
    })
  }

  /*
   * Fetch Data from indexeDB
   */
  static fetchRestaurantFromIDb () {
    const dbPromise = DBHelper.openIdb()
    return dbPromise.then(db => {
      var tx = db.transaction('restaurants', 'readonly')
      var store = tx.objectStore('restaurants')
      return store.getAll()
    })
  }

  /*
  * Fetch all Reviews for Restaurant ID
  */
  static fetchReviewsFromIdb (id) {
    const dbPromise = DBHelper.openIdb()
    return dbPromise
      .then(db => {
        var tx = db.transaction('reviews', 'readonly')
        var store = tx.objectStore('reviews')
        return store.getAll()
      })
      .then(reviews => {
        return reviews.filter(review => review.restaurant_id === id)
      })
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants (callback) {
    // console.log('fetchRestaurants');
    DBHelper.fetchRestaurantFromIDb().then(idbResp => {
      // console.log('idb response',idbResp);
      if (idbResp.length > 0) {
        // found in IDB
        return callback(null, idbResp)
      } else {
        // not found try to fetch from Network
        fetch(DBHelper.RESTAURANTS_URL, {
          method: 'get'
        })
          .then(resp => resp.json())
          .then(data => {
            // console.log('Data',data);
            DBHelper.addRestaurantToIdb(data)
            callback(null, data)
          })
          .catch(err => callback(err, null))
      }
    })
  }
  /**
   * Fetch reviews for restaurant id
   */
  static fetchAllReviewsById (id, callback) {
    const currTime = Date.now()
    DBHelper.fetchReviewsFromIdb(id).then(idbResp => {
      if (idbResp.length > 0) {
        // console.log('reviews from idb', idbResp)
        idbResp.sort(
          (a, b) => currTime - a.updatedAt - (currTime - b.updatedAt)
        )
        callback(idbResp, null)
      } else {
        const URL = DBHelper.REVIEWS_URL + '?restaurant_id=' + id
        // console.log('URL', URL)
        return fetch(URL, {
          method: 'get'
        })
          .then(resp => resp.json())
          .then(data => {
            data.sort(
              (a, b) => currTime - a.updatedAt - (currTime - b.updatedAt)
            )
            data.map(review => DBHelper.addReviewToIdb(review))
            callback(data, null)
          })
          .catch(err => callback(null, err))
      }
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById (id, callback) {
    // fetch all restaurants with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        const restaurant = restaurants.find(r => r.id == id)
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant)
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null)
        }
      }
    })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine (cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine)
        callback(null, results)
      }
    })
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood (neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood)
        callback(null, results)
      }
    })
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood (
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        let results = restaurants
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine)
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood)
        }
        callback(null, results)
      }
    })
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods (callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        )
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        )
        callback(null, uniqueNeighborhoods)
      }
    })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines (callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        )
        callback(null, uniqueCuisines)
      }
    })
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant (restaurant) {
    return `/restaurant.html?id=${restaurant.id}`
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant (restaurant) {
    return `/dist/img/${restaurant.photograph}.webp`
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant (restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    )
    marker.addTo(newMap)
    return marker
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  /**
   * Update Favorite Restaurant
   */
  static handleFavoriteClick (id, newState) {
    console.log('DB', id, newState)
    // update cached restaurant data
    const dbPromise = DBHelper.openIdb()
    // get the cache restaurant data
    dbPromise
      .then(db => {
        var tx = db.transaction('restaurants', 'readonly')
        var store = tx.objectStore('restaurants')
        return store.get(id)
      })
      .then(val => {
        if (!val) {
          console.log('No such data exists in cache')
          return
        }
        // update the cache restaurant data
        val.is_favorite = newState
        dbPromise
          .then(db => {
            var tx = db.transaction('restaurants', 'readwrite')
            var store = tx.objectStore('restaurants')
            store.put(val)
            return tx.complete
          })
          .then(() => {
            console.log('cache data updated')
          })
      })
    // Update the original data
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${newState}`, {
      method: 'put'
    })
      .then(() => {
        console.log('database updated')
      })
      .catch(err => {
        console.log('database could not be updated', err)
      })
  }

  /**
   *  Add New Review
   */
  static addNewReview (name, comment, rating, id, callback) {
    let body = {
      id: Date.now(),
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    console.log('sending obj', body)
    // update reviews indexeDB
    DBHelper.addReviewToIdb(body)
    // add to Database if online
    // else add to pending  request queue
    if (navigator.onLine) {
      DBHelper.sendReviewToDatabase(DBHelper.REVIEWS_URL, 'POST', body)
    } else DBHelper.addRequestToQueue(DBHelper.REVIEWS_URL, 'POST', body)

    callback(null, null)
  }
  static addRequestToQueue (url = '', method, body) {
    var dbPromise = DBHelper.openIdb()
    return dbPromise.then(db => {
      var tx = db.transaction('pending', 'readwrite')
      var store = tx.objectStore('pending')
      store.add({
        url: url,
        method: method,
        body: body
      })
    })
  }

  static sendReviewToDatabase (url = '', method, body) {
    fetch(url, {
      method: 'post',
      body: JSON.stringify(body)
    })
      .then(resp => {
        console.log('POST resp', resp)
        location.reload()
      })
      .catch(err => console.log('post request failed', err))
  }

  static commitPendingRequests () {
    console.log('in commit pending req')
    DBHelper.tryComittingPendingRequests(DBHelper.commitPendingRequests)
  }
  static tryComittingPendingRequests (callback) {
    console.log('Trying to commit pending requests')
    var dbPromise = DBHelper.openIdb()
    dbPromise.then(db => {
      var tx = db.transaction('pending', 'readwrite')
      tx.objectStore('pending')
        .openCursor()
        .then(cursor => {
          if (!cursor) {
            return
          }
          let url = cursor.value.url
          let method = cursor.value.method
          let body = cursor.value.body

          // if we have bad record delete it
          if (!url || !method || (method === 'post' && !body)) {
            cursor.delete()
            callback()
            return
          }
          console.log('sending fetch', url, method, body)
          fetch(url, {
            method: method,
            body: JSON.stringify(body)
          })
            .then(resp => {
              if (!resp.ok) return
            })
            .then(() => {
              // start new transaction to delete
              db.transaction('pending', 'readwrite')
                .objectStore('pending')
                .openCursor()
                .then(cursor => {
                  cursor.delete().then(() => callback())
                })
            })
        })
    })
  }
}

export default DBHelper
