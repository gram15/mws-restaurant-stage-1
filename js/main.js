let restaurants,
  neighborhoods,
  cuisines
var staticMapUrl;
//var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=512x200&scale=2&zoom=11&center=40.722216,-73.987501&key=AIzaSyDFOaYDK-AO0efKW6cZu9ZfD8my9_qDiks&maptype=roadmap&format=jpg&visual_refresh=true&markers=size:mid%7Ccolor:red`
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  //self.markers.forEach(m => m.setMap(null));//AM controllare
  //self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  lazyLoad();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  // Lazy loading images as per David Walsh method:
  // https://davidwalsh.name/lazyload-image-fade
  const imageUrl = DBHelper.imageUrlForRestaurant(restaurant,'300');
  const li = document.createElement('article');

  const noscriptImage = document.createElement('noscript');
  noscriptImage.setAttribute('data-src', imageUrl);
  noscriptImage.setAttribute('class', 'lazy-image');
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('role', 'img');
  image.alt = `Picture of ${restaurant.name} restaurant`;
  image.src = imageUrl;
  noscriptImage.append(image);
  li.append(noscriptImage);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('role', 'button');
  more.setAttribute('aria-label', 'View details about ' + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    staticMapUrl += `%7C${restaurant.latlng.lat},${restaurant.latlng.lng}`;
  });
  const mapImg = document.getElementById('map');
  mapImg.alt = 'Map containing all restaurants locations';
  mapImg.src = staticMapUrl;
}

/**
 * Lazy loading images as per David Walsh method:
 * https://davidwalsh.name/lazyload-image-fade
 */
lazyLoad = () => {
  [].forEach.call(document.querySelectorAll('noscript.lazy-image'), function(noscript) {
    var img = new Image();
    img.setAttribute('data-src', '');
    img.className = noscript.firstElementChild.className;
    img.alt = noscript.firstElementChild.alt;
    noscript.parentNode.insertBefore(img, noscript);
    img.onload = function() {
      img.removeAttribute('data-src');
    };
    img.src = noscript.getAttribute('data-src');
  });
}



/**
 * Starts Service Worker
 */
  AppHelper.startServiceWorker();