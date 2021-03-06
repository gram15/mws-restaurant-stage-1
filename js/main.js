let restaurants,
  neighborhoods,
  cuisines
var staticMapUrl;
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
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
      // Add blazy 
      var blazy = new Blazy();
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
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  const picture = document.getElementById('staticmap-picture');
 
  // Use different maps image (small)
  const source = document.createElement('source');
  source.media = '(max-width: 400px)';
  source.srcset = 'https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&scale=1&zoom=12&size=550x350&key=AIzaSyDFOaYDK-AO0efKW6cZu9ZfD8my9_qDiks';
  
  // Standard image 
  const image = document.getElementById('staticmap');
  image.src = 'https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&scale=2&zoom=11&size=512x200&key=AIzaSyDFOaYDK-AO0efKW6cZu9ZfD8my9_qDiks';
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
    source.srcset += `&markers=size:mid%7Ccolor:orange%7C${restaurant.latlng.lat},${restaurant.latlng.lng}`;
    image.src += `&markers=size:small%7Ccolor:orange%7C${restaurant.latlng.lat},${restaurant.latlng.lng}`;
  });

  // Insert source before image
  picture.insertBefore(source, image);
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('article');
  const image = document.createElement('img');
  image.className = 'restaurant-img b-lazy';
  image.setAttribute('role', 'img');
  image.alt = `Picture of ${restaurant.name} restaurant`;
  // add blazy for lazy loading images
  // smallest transparent gif image
  image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant,300), '300');
  li.append(image);

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
 * Starts Service Worker
 */
  AppHelper.startServiceWorker();