import { light_map } from './light_map.js';
import { dark_map } from './dark_map.js';

// Declare map and marker variables
let map;
let autocomplete;
let infoWindow;
var markerArray = [];
 
// Initialize and add the map
async function initMap() {

  // Set the coordinates for the center of the map
  const dublin = { lat: 53.350140, lng: -6.266155 }
  
  // Create a new map instance and set its center and zoom level
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
    mapTypeControl: false, //removes satellite button
    fullscreenControl: false, // removes full screen toggle
    styles: light_map
});

  const translate_button = document.getElementById("translate_button");
  var translate_vis = false;
  translate_button.addEventListener('click', function() {
    if (translate_vis == false){
        document.getElementById("google_translate_element").style.display = "block";
        translate_vis = true;
    }
    else {
        document.getElementById("google_translate_element").style.display = "none";
        translate_vis = false;
    }
  });

   // Requesting user location and adding their marker to map
   const locationButton = document.createElement("button");
   locationButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';

   //locationButton.textContent = "Pan to Current Location";
   locationButton.classList.add("custom-map-control-button");
   map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
   locationButton.style.marginRight = "15px";
   locationButton.addEventListener('click', async () => {
    const userCoords = await getUserLocation();
    map.panTo(userCoords);
  });   
  
   function getUserLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          var user_pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var userLatLng = new google.maps.LatLng(user_pos.lat, user_pos.lng);
          //map.panTo(user_pos);
          var marker = new google.maps.Marker({
            position: user_pos,
            map: map
          });
          
          resolve(userLatLng);
        },
        (error) => {
          var user_pos = {
            lat: 53.3065,
            lng: -6.2187
          };
          var userLatLng = new google.maps.LatLng(user_pos.lat, user_pos.lng);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("Location access denied by user. Using default location");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.Using default location");
              break;
            case error.TIMEOUT:
              alert("Location request timed out. Using default location");
              break;
            default:
              alert("An unknown error occurred. Using default location");
              break;
          }
          //map.panTo(user_pos);
          var marker = new google.maps.Marker({
            position: user_pos,
            map: map
          });
          resolve(userLatLng);
        }
      );
    });
  };

  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  var search_marker;
  searchBox.addListener("places_changed", function() {
    var places = searchBox.getPlaces();  
    if (places.length == 0) {
      return;
    }
    var location = places[0].geometry.location;
    if (search_marker) {
        search_marker.setPosition(location);
        search_marker.setTitle(places[0].name);
      }
      // If a marker does not exist, create a new one
      else {
        search_marker = new google.maps.Marker({
          position: location,
          map: map,
          title: places[0].name
        });
      }
  });


// var search_nearest_bike =document.getElementById("search-nearest-bike");
// search_nearest_bike.addEventListener("click", async function () {
//   if(!search_marker){
//     alert("Search for a station before clicking target bike")
//   }
//   else{
//     var target_coords = search_marker.position;
//     var sorted_array = sortLocationsByProximity(duplicate_markerArray, target_coords);
//     var nearest_stations = nearby_stations_with_x(sorted_array, "bikes");
//     var nearest_bike = await nearest_station(nearest_stations, target_coords, 'WALKING');
//     map.panTo(nearest_bike.position)
//     map.setZoom(map.getZoom() + 2);
//   }
// });

// var search_nearest_stand = document.getElementById("search-nearest-stand");
// search_nearest_stand.addEventListener("click", async function () {
//   if(!search_marker){
//     alert("Search for a station before clicking target stand")
//   }
//   else{  
//   var target_coords = search_marker.position;
//     var sorted_array = sortLocationsByProximity(duplicate_markerArray, target_coords);
//     var nearest_stations = nearby_stations_with_x(sorted_array, "stands");
//     var nearest_bike = await nearest_station(nearest_stations, target_coords, 'WALKING');
//     map.panTo(nearest_bike.position)
//     map.setZoom(map.getZoom() + 2);
//   }
// });



  const buttons = document.getElementById("button-div");
  const location_buttons = document.getElementById("location-buttons");
  const locateNearest = document.getElementById("nearest-btn");
  const search_nearest_div = document.getElementById("search-nearest-btns");
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(search_nearest_div);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(buttons);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(location_buttons);
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(locateNearest);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // For each place, get the location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Recenter the map to the selected place and zoom in.
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
        map.fitBounds(bounds);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(100);
      }
    });
  });   
  // Fetch station data and display markers and drop-down options
  await fetchStationData();

  // Fetch weather data 
  await fetchWeatherData();

  // fetch stations
  async function fetchStationData() {
    const response = await fetch("/stations");
    const data = await response.json();
    console.log('fetch response', typeof data);
    displayInputBox(data);
    displayDropDown(data);
    addMarkers(data);
  }

  // Fetch Weather
  async function fetchWeatherData() {
    const response = await fetch("/weather");
    const data = await response.json();
    console.log('fetch response', typeof data);
    displayWeather(data);
  }

  // Displays the station data on the map as markers and info windows
function displayWeather(data) {
    // Get icon of weather
    var weatherIcon = data.weather[0].icon;
    // Get temperature and convert temperature to Degrees Celcius
    var kelvin = data.main.temp;
    var celsius = Math.round((kelvin - 273.15) * 10) / 10;
    var fahrenheit = Math.round((kelvin - 273.15) * 9/5 + 32);

    var description = data.weather[0].description;
    var capitlasieDescription = description.toUpperCase();
    var humidity = data.main.humidity;

    var weatherDiv = document.getElementById("weather-info");
    const weatherPopDown = document.getElementById("weather-popdown");
  
    // Coding wind compass
    var wind_dir = data.wind.deg - 45;
    var windSpeedMph= data.wind.speed;
    var windSpeedKmhr = Math.round(windSpeedMph * 1.60934);
  
    weatherDiv.innerHTML = `
      <div id="weather">
          <img src=https://openweathermap.org/img/wn/${weatherIcon}.png alt='icon' width='55' height='55' style='filter: drop-shadow(0px 0px 0px black) drop-shadow(0px 0px 0px black) drop-shadow(0px 0px 0px black) drop-shadow(0px 0px 8px black);'>
      </div>
        `
    
    weatherPopDown.style.display = "none";

    weatherDiv.addEventListener("mouseover", function() {
      weatherPopDown.style.display = "block";
      weatherPopDown.innerHTML = `
      <div class="location">
      <i class="fa-solid fa-location-dot fa-xl"></i>
      <h3>DUBLIN</h3>
    </div>
    <div class="icon">
      <img id="test" src=https://openweathermap.org/img/wn/${weatherIcon}.png alt='icon' width='120' height='120''>
    </div>
    <div class="temperature">
      <h2>${celsius}°C</h2>
      <p>${capitlasieDescription}</p>
    </div>
    <div class="windandhumidity">
      <div class="humidity">
        <i class="fa-solid fa-water fa-xl"></i>
        <div>
          <h4>${humidity}%<br>humidity</h4>
        </div>
      </div>
      <div class="wind">
        <i class="fa-solid fa-wind fa-xl"></i>
        <div>
          <h4>${windSpeedKmhr} KM/h<br>Wind Speed</h4>
        </div>
      </div>
    </div>
      `
    }) 
    
    // Add event listener for mouseover on weatherDiv
    weatherDiv.addEventListener("click", function () {
        // Check the current temperature unit (Celsius or Fahrenheit)
        if (weatherPopDown.innerHTML.includes("°C")) {
            weatherPopDown.innerHTML = `
            <div class="location">
              <i class="fa-solid fa-location-dot fa-xl"></i>
              <h3>DUBLIN</h3>
            </div>
            <div class="icon">
              <img id="test" src=https://openweathermap.org/img/wn/${weatherIcon}.png alt='icon' width='120' height='120''>
            </div>
            <div class="temperature">
              <h2>${fahrenheit}°F</h2>
              <p>${capitlasieDescription}</p>
            </div>
            <div class="windandhumidity">
              <div class="humidity">
                <i class="fa-solid fa-water fa-xl"></i>
                <div>
                  <h4>${humidity}%<br>humidity</h4>
                </div>
              </div>
              <div class="wind">
                <i class="fa-solid fa-wind fa-xl"></i>
                <div>
                  <h4>${windSpeedMph} Mph<br>Wind Speed</h4>
                </div>
              </div>
            </div>
            `
        }
        else {
            weatherPopDown.innerHTML = `
            <div class="location">
            <i class="fa-solid fa-location-dot fa-xl"></i>
            <h3>DUBLIN</h3>
          </div>
          <div class="icon">
            <img id="test" src=https://openweathermap.org/img/wn/${weatherIcon}.png alt='icon' width='120' height='120''>
          </div>
          <div class="temperature">
            <h2>${celsius}°C</h2>
            <p>${capitlasieDescription}</p>
          </div>
          <div class="windandhumidity">
            <div class="humidity">
              <i class="fa-solid fa-water fa-xl"></i>
              <div>
                <h4>${humidity}%<br>humidity</h4>
              </div>
            </div>
            <div class="wind">
              <i class="fa-solid fa-wind fa-xl"></i>
              <div>
                <h4>${windSpeedKmhr} KM/h<br>Wind Speed</h4>
              </div>
            </div>
          </div>
        `
        }
        });
      
        weatherDiv.addEventListener("mouseout", function() {
          weatherPopDown.style.display = "none";
          weatherPopDown.innerHTML = ""
        });

  }

  function displayInputBox(stations) {
    const stationList = [];
    const start = document.getElementById("start-input");
    const end = document.getElementById("end-input");

    // Create and append options to dropdown
    stations.forEach(station => {
        stationList.push(station.name);
    });

    start.onkeyup = function() {
        let result = [];
        let input = start.value;
        if(input.length){
            result = stationList.filter((keyword) => {
                return keyword.toLowerCase().includes(input.toLowerCase());
            });
        }
        display(result, resultsBox1);
    }

    end.onkeyup = function() {
        let result = [];
        let input = end.value;
        if(input.length){
            result = stationList.filter((keyword) => {
                return keyword.toLowerCase().includes(input.toLowerCase());
            });
        }
        display(result, resultsBox2);
    }

    function display(result, resultsBox) {
        const content = result.map((list) => {
            const listItem = document.createElement("li");
            listItem.textContent = list;
            listItem.onclick = function() {
                selectInput(this, resultsBox, stations);
            };
            return listItem;
        });

        const ulElement = document.createElement("ul");

        content.forEach(item => ulElement.appendChild(item));
        if (resultsBox) { // Add null check
            resultsBox.innerHTML = "";
            resultsBox.appendChild(ulElement);
        }
    }

    const resultsBox1 = document.getElementById("result-box1");
    const resultsBox2 = document.getElementById("result-box2");

    const selectInput = function(list, resultsBox, stations) {
        if (resultsBox === resultsBox1) {
            const selectedStation = stations.find(station => station.name === list.textContent);
            start.innerHTML = selectedStation.address;
            start.value = selectedStation.address + " Dublin, Ireland";
            if (resultsBox1) { // Add null check
                resultsBox1.innerHTML = '';
            }
            console.log(start.value);
        } else if (resultsBox === resultsBox2) {
            const selectedStation = stations.find(station => station.name === list.textContent);
            end.innerHTML = selectedStation.address;
            end.value = selectedStation.address + " Dublin, Ireland";
            if (resultsBox2) { // Add null check
                resultsBox2.innerHTML = '';
            }
            console.log(end.value);
        }
    };
}
  // ***** CODE FOR ADDING MARKERS AND INFO-WIDOW*****

  // Displays the station data on the map as markers and info windows
  function addMarkers(stations) {
    // Create arrays to store the markers and info windows
    const infoWindowArray = [];
    // Loop through each station and create a marker and info window for it
    for (const station of stations) {
      // Create a new marker for the station
      var marker = createMarker(station);
      markerArray.push(marker);

      // Create a new info window for the marker
      var infoWindow = createInfoWindow(station);
      infoWindowArray.push(infoWindow);

      // Attach listeners to show and hide the info window when the marker is hovered over
      attachInfoWindowListeners(marker, infoWindow);
    }
  }

  // Creates a new marker object for the given station and adds it to the map
  function createMarker(station) {
    var myLatlng = { lat: station.position.lat, lng: station.position.lng };
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" stroke="#000000" stroke-width="1" fill="#FFFFFF"/></svg>'),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
      title: station.address,
      station_number: station.number,
      bikes_free: station.available_bikes,
      free_stands: station.available_bike_stands,
      
    });  
    marker.setLabel(station.available_bikes.toString());
    
    
    //Toggle code to change num on station pin
    const toggleButton1 = document.getElementById("btn1");
    toggleButton1.addEventListener("click", () => {    
        marker.setLabel(station.available_bikes.toString());});
    const toggleButton2 = document.getElementById("btn2");
    toggleButton2.addEventListener("click", () => {    
        marker.setLabel(station.available_bike_stands.toString());});
    
    toggleButton1.addEventListener("click", () => {
      btn1.classList.add("active");
      btn2.classList.remove("active");
    });
    
    toggleButton2.addEventListener("click", () => {
      btn1.classList.remove("active");
      btn2.classList.add("active");
    });
    return marker;
  }

  // Creates a new info window object for the given station
  function createInfoWindow(station) {
    // Variable to change height of all bars
    const height = 5;
    const height1 = station.prediction0 * height;
    const height2 = station.prediction1 * height;
    const height3 = station.prediction2 * height;
    const height4 = station.prediction3 * height;
    const height5 = station.prediction4 * height;
    const height6 = station.prediction5 * height;
    const height7 = station.prediction6 * height;
    const height8 = station.prediction7 * height;
    const contentString = `
      <div class="info-window">
        <h1>${station.address}</h1>
        <div class="station-data">
            <div class="available-bikes">
                <h2><i class="fa-solid fa-bicycle"></i></h2>
                <p>${station.available_bikes}</p>
            </div>
            <div class="parked">
                <h2><i class="fa-solid fa-square-parking"></i></h2>
                <p>${station.available_bike_stands}</p>
            </div>
        </div>
      </div>
    `;
    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: "Uluru",
    });
    return infoWindow;
  }

  // Attaches listeners to show and hide the info window when the marker is hovered over
  function attachInfoWindowListeners(marker, infoWindow) {
    let currentInfoWindow = null;
    google.maps.event.addListener(marker, "mouseover", function() {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      infoWindow.close();
      currentInfoWindow = null;
    });
  }

  var markers = []; // Array to store markers

  // Function to display drop down for stations
function displayDropDown(stations) {
    var dropdown = document.getElementById("option");
  
    // Add options for each station
    stations.forEach(station => {
      var option = document.createElement("option");
      option.value = station.number; // Use station number as value for each option
      option.textContent = station.address; // Use station address as text for each option
      dropdown.appendChild(option);
    });
  
    // Add event listener for change event on dropdown
    dropdown.addEventListener("change", function() {
    markers.forEach(marker => {
        marker.setMap(null);
        });
        markers = []; // Clear the markers array
      var selectedStationNumber = this.value;
      var selectedStation = stations.find(station => station.number === parseInt(selectedStationNumber));
      if (selectedStation) {
        // Get coordinates of selected station
        var lat = selectedStation.position.lat;
        var lng = selectedStation.position.lng;
  
        // Create a marker on the map
        var marker = new google.maps.Marker({
          position: {lat: lat, lng: lng},
          map: map,
          title: selectedStation.name
        });

        
        markers.push(marker);
  
        // Center the map on the marker
        map.setCenter({lat: lat, lng: lng});
        map.setZoom(15); // Set zoom level to 15
      }
    });
}


  //code for nearest btns/////////////
    //make fresh array
    var duplicate_markerArray=[];
    for (let i = 0; i < markerArray.length; i++){
    duplicate_markerArray.push(markerArray[i]);
    }


const nearest_bike_btn = document.getElementById("nearest-bike");
nearest_bike_btn.addEventListener("click", async () => {
    var user_coords = await getUserLocation();
    console.log("type of "+ typeof(user_coords));
    var sorted_array = sortLocationsByProximity(duplicate_markerArray, user_coords);
    var nearest_stations = nearby_stations_with_x(sorted_array, "bikes");
    var nearest_bike = await nearest_station(nearest_stations, user_coords, 'WALKING');
    map.panTo(nearest_bike.position)
    map.setZoom(map.getZoom() + 2);
});

const nearest_stand_btn = document.getElementById("nearest-stand");
nearest_stand_btn.addEventListener("click", async () => {
    var user_coords = await getUserLocation();
        console.log("type of "+ typeof(user_coords));
        var sorted_array = sortLocationsByProximity(duplicate_markerArray, user_coords);
        var nearest_stations = nearby_stations_with_x(sorted_array, "stands");
        var nearest_bike = await nearest_station(nearest_stations, user_coords, 'BICYCLING');
        ;
        map.panTo(nearest_bike.position)
        map.setZoom(map.getZoom() + 2);
});

function distance_tween_points(latlng1, latlng2) {
    var R = 6371; // Radius of the earth in km
    var dLat = (latlng2.lat() - latlng1.lat()) * Math.PI / 180; // deg2rad below
    var dLon = (latlng2.lng() - latlng1.lng()) * Math.PI / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latlng1.lat() * Math.PI / 180) * Math.cos(latlng2.lat() * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }
  
  

  function sortLocationsByProximity(locations, userPos) {
    locations.sort(function(a, b) {
      var distA = distance_tween_points(a.position, userPos);
      var distB = distance_tween_points(b.position, userPos);
      return distA - distB;
    });
    return locations;
  }
  
  

// Instantiate a directions service.
const directionsService = new google.maps.DirectionsService();  
// Create a renderer for directions and bind it to the map.
const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });


  

//func takes array of locssorted by proximity to user 
//makes new subset array of locations with bikes
//reduces size of that array to 10 or less 
//output is nearest 10 or less stations with bikes
function nearby_stations_with_x(array, x){
    var has_x = [];
    if (x == "bikes"){
        for (let i =0; i< array.length; i++ ){
            if (array[i].bikes_free > 0){
                has_x.push(array[i]);
            }
        }
    }
    if (x == "stands"){
        for (let i =0; i< array.length; i++ ){
            if (array[i].free_stands > 0){
                has_x.push(array[i]);
            }
        }
    }
    
   //has_x is new sorted array that all have x
   if (has_x.length >= 5){ 
   var nearest = has_x.slice(0,5);
   }
   else {
    var nearest = has_x;
   }
   //console.log("here are the results from the nearby with bikes: ");
   for (let i = 0; i<nearest.length; i++){
    //console.log(nearest[i]);
   }
   //nearest var will be array of 10 (or less) nearest bikes
   return nearest;
}




async function nearest_station(array, lat_lng, mode){
    var nearest_station;
    var min_dist = Infinity;
    var dist;
    for (let i = 0; i < array.length; i++){
        //need to calculate dist to marker
        var route = {
            origin: lat_lng,
            destination: array[i].position,
            travelMode: mode
        }
        try {
            const response = await new Promise((resolve, reject) => {
                directionsService.route(route, function(response, status) {
                    if (status === 'OK') {
                        resolve(response);
                    } else {
                        reject(status);
                    }
                });
            });
            var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
            if (!directionsData) {
                window.alert('Directions request failed');
                return;
            } else {
                dist = directionsData.distance.value;
            }
        } catch (error) {
            window.alert('Directions request failed due to ' + error);
            return;
        }
        if (dist <= min_dist){
            min_dist = dist;
            nearest_station = array[i];
        }
    }
    return nearest_station;
}





  //***** CODE FOR DIRECTIONS *****
  let markerArray1 = []

  // Instantiate an info window to hold step text.
  const stepDisplay = new google.maps.InfoWindow();

  
const button = document.getElementById("go");
const clear_button = document.getElementById("clear-directions");

// Add event listener to the button element
button.addEventListener("click", function() {
    // Call the calculateAndDisplayRoute function when the button is clicked
    calculateAndDisplayRoute(directionsRenderer, directionsService, markerArray1, stepDisplay, map);
  });
  
clear_button.addEventListener("click", function() {
for (let i = 0; i < markerArray1.length; i++) {
    markerArray1[i].setMap(null);
    }
    directionsRenderer.setDirections({routes: []}); // Remove directions line    
});


function calculateAndDisplayRoute(
  directionsRenderer,
  directionsService,
  markerArray1,
  stepDisplay,
  map
) {
  // First, remove any existing markers from the map.
  for (let i = 0; i < markerArray1.length; i++) {
    markerArray1[i].setMap(null);
  }


  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService
    .route({
      origin: document.getElementById("start-input").value,
      destination: document.getElementById("end-input").value,
      travelMode: google.maps.TravelMode.BICYCLING,
    })
    .then((result) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
    //   document.getElementById("warnings-panel").innerHTML =
    //     "<b>" + result.routes[0].warnings + "</b>";
      directionsRenderer.setDirections(result);
      showSteps(result, markerArray1, stepDisplay, map);
    })
    .catch((e) => {
      window.alert("Enter a valid Address");
    });
}

// const arrowIcon = {
//     path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // arrow shape
//     strokeColor: '#000000', // arrow color
//     strokeWeight: 2, // arrow stroke weight
//     fillColor: '#FFFFFF', // fill color
//     fillOpacity: 1, // fill opacity
//     scale: 5, // arrow size
//     rotation: 0 // initial rotation angle
//   };

function showSteps(directionResult, markerArray1, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  const myRoute = directionResult.routes[0].legs[0];

  for (let i = 0; i < myRoute.steps.length; i++) {
    const marker = (markerArray1[i] =
      markerArray1[i] || new google.maps.Marker());
    marker.setMap(map);

    // marker.setIcon(arrowIcon);

    // const stepDirection = myRoute.steps[i].heading; // direction of the step in degrees
    // console.log(stepDirection);
    // marker.getIcon().setRotation(stepDirection); 


    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
      stepDisplay,
      marker,
      myRoute.steps[i].instructions,
      map
    );
  }
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, "click", () => {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}

  
////// light/darkmode code /////////
var is_light = true;
var is_bikes = true;
document.getElementById("dark-icon").style.display="none";


const b1= document.getElementById("btn1");
const b2= document.getElementById("btn2");
b1.style.backgroundColor = "lightblue";
b1.style.color = "white";
b1.style.zIndex = "101";
b2.style.backgroundColor = "white";
b2.style.color = "black";
b2.style.zIndex = "100";
b1.addEventListener("click", () => {
is_bikes= true;

b1.style.backgroundColor = "lightblue";
b1.style.color = "white";
b1.style.zIndex = "101";
b2.style.backgroundColor = "white";
b2.style.color = "black";
b2.style.zIndex = "100";
})
b2.addEventListener("click", () => {
is_bikes=false;

b2.style.backgroundColor = "lightblue";
b2.style.color = "white";
b2.style.textDecorationColor = "white"
b2.style.zIndex = "101";
b1.style.backgroundColor = "white";
b1.style.color = "black";
b1.style.zIndex = "100";
})

var dark_mode_button = document.getElementById("dark-mode-button");
dark_mode_button.addEventListener("click", () => {
  if(is_light == true){
    is_light = false;
  } else if(is_light == false){
    is_light = true;
  }
  if (is_light == true){
    //light mode styling
    map.set("styles", light_map);


    nearest_bike_btn.style.backgroundColor = "lightblue";
    nearest_stand_btn.style.backgroundColor = "lightblue";
    search_nearest_bike.style.backgroundColor = "lightblue";
    search_nearest_stand.style.backgroundColor = "lightblue";
    search_nearest_div.style.backgroundColor = "white";
    document.getElementById("select-service").style.backgroundColor="white"
    document.getElementById("select-service-container").style.color="white";
    document.getElementById("get-directions").style.color = "black";
    document.getElementById("find-stations").style.color = "black";
    document.getElementById("directions").style.backgroundColor = "white";
    document.getElementById("search-station-container").style.backgroundColor = "white";
    document.getElementById("dark-mode-button").style.backgroundColor = "lightblue";
    document.getElementById("header").style.backgroundColor = "white";
    document.getElementById("db").style.color = "lightblue";
    document.getElementById("icon-text").style.color = "black";
    document.getElementById("dark-icon").style.display="none";
    document.getElementById("light-icon").style.display="";
    document.getElementById("button-div").style.backgroundColor = "white";
    document.getElementById("body").style.backgroundColor = "white";
    document.getElementById("dropdown").style.backgroundColor = "white";
    document.getElementById("location-buttons").style.backgroundColor = "white";
    //document.getElementById("center-btn").style.color = "black";
    //document.getElementById("warnings-panel").style.backgroundColor = "white";
    document.getElementById("pin").style.color = "lightblue";
    document.getElementById("dest_marker").style.color = "lightblue";
    document.getElementById("weather-info").style.backgroundColor = "lightblue";
    document.getElementById("weather").style.color= "black";
    document.getElementById("translate_button").style.backgroundColor= "lightblue";
    document.getElementById("pac-input").style.backgroundColor= "white";
    document.getElementById("pac-input").style.color= "black";

      if (is_bikes == true){
          b1.style.backgroundColor = "lightblue";
          b1.style.color = "white";
          b1.style.zIndex = "101";
          b2.style.backgroundColor = "white";
          b2.style.color = "black";
          b2.style.zIndex = "100";
      }
      else{
          b2.style.backgroundColor = "lightblue";
          b2.style.color = "white";
          b2.style.zIndex = "101";
          b1.style.backgroundColor = "white";
          b1.style.color = "black";
          b1.style.zIndex = "100";
      }
      
    b1.addEventListener("click", () => {
      is_bikes= true;

      b1.style.backgroundColor = "lightblue";
      b1.style.color = "white";
      b1.style.zIndex = "101";
      b2.style.backgroundColor = "white";
      b2.style.color = "black";
      b2.style.zIndex = "100";
    })
    b2.addEventListener("click", () => {
      
      is_bikes = false;
      b2.style.backgroundColor = "lightblue";
      b2.style.color = "white";
      b2.style.zIndex = "101";
      b1.style.backgroundColor = "white";
      b1.style.color = "black";
      b1.style.zIndex = "100";
    })

  }else{
    //darkmode styling
    map.set("styles", dark_map);
    nearest_bike_btn.style.backgroundColor = "lightgreen";
    nearest_stand_btn.style.backgroundColor = "lightgreen";
    search_nearest_bike.style.backgroundColor = "lightgreen";
    search_nearest_stand.style.backgroundColor = "lightgreen";
    search_nearest_div.style.backgroundColor = "black";
    document.getElementById("select-service").style.backgroundColor="black"
    document.getElementById("select-service-container").style.color="black";
    document.getElementById("get-directions").style.color = "white";
    document.getElementById("find-stations").style.color = "white";
    document.getElementById("dark-mode-button").style.backgroundColor = "lightgreen";
    document.getElementById("light-icon").style.display="none";
    document.getElementById("dark-icon").style.display="";
    document.getElementById("header").style.backgroundColor = "black";
    document.getElementById("db").style.color = "lightgreen";
    document.getElementById("icon-text").style.color = "white";
    document.getElementById("button-div").style.backgroundColor = "black";
    document.getElementById("body").style.backgroundColor = "black";
    document.getElementById("dropdown").style.backgroundColor = "black";
    document.getElementById("location-buttons").style.backgroundColor = "black";
    //document.getElementById("center-btn").style.color = "white";
    //document.getElementById("warnings-panel").style.backgroundColor = "black";
    document.getElementById("compass").style.color = "white";
    document.getElementById("speedometer").style.color = "white";
    document.getElementById("pin").style.color = "lightgreen";
    document.getElementById("dest_marker").style.color = "lightgreen";
    document.getElementById("weather-info").style.backgroundColor = "lightgreen";
    document.getElementById("weather").style.color= "white";
    document.getElementById("translate_button").style.backgroundColor= "lightgreen";
    document.getElementById("pac-input").style.backgroundColor= "black";
    document.getElementById("pac-input").style.color= "white";


    if (is_bikes == true){
      b1.style.backgroundColor = "lightgreen";
      b1.style.color = "white";
      b1.style.zIndex = "101";
      b2.style.backgroundColor = "black";
      b2.style.color = "white";
      b2.style.zIndex = "100";
    }else{
      b2.style.backgroundColor = "lightgreen";
      b2.style.color = "white";
      b2.style.zIndex = "101";
      b1.style.backgroundColor = "black";
      b1.style.color = "white";
      b1.style.zIndex = "100";
    }
      
   
    b1.addEventListener("click", () => {
      is_bikes=true;
      b1.style.backgroundColor = "lightgreen";
      b1.style.color = "white";
      b1.style.textDecorationColor = "white"
      b1.style.zIndex = "101";
      b2.style.backgroundColor = "black";
      b2.style.color = "white";
      b2.style.zIndex = "100";
    })
    b2.addEventListener("click", () => {
      is_bikes=false;
      b2.style.backgroundColor = "lightgreen";
      b2.style.color = "white";
      b2.style.textDecorationColor = "white"
      b2.style.zIndex = "101";
      b1.style.backgroundColor = "black";
      b1.style.color = "white";
      b1.style.zIndex = "100";
    })
  }
});
//////end of dark-mode code/////////////
}

window.initMap = initMap;

