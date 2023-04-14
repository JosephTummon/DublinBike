// Declare map and marker variables
let map;
let autocomplete;
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
    fullscreenControl: false // removes full screen toggle
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
   locationButton.addEventListener('click', getUserLocation)
   
   function getUserLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          var user_pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var userLatLng = new google.maps.LatLng(user_pos.lat, user_pos.lng);
          map.panTo(user_pos);
          var marker = new google.maps.Marker({
            position: user_pos,
            map: map
          });
          console.log("function is returning:");
          console.log(userLatLng);
          resolve(userLatLng);
        },
        (error) => {
          var user_pos = {
            lat: 53.3081318,
            lng: -6.2242786
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
          map.panTo(user_pos);
          var marker = new google.maps.Marker({
            position: user_pos,
            map: map
          });
          console.log("function is returning:");
          console.log(userLatLng);
          resolve(userLatLng);
        }
      );
    });
  }

  
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  const buttons = document.getElementById("button-div");
  const locateNearest = document.getElementById("nearest-btn");

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttons);
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

   // Update station data every 60 seconds



 

  // fetch stations
  async function fetchStationData() {
    const response = await fetch("/stations");
    const data = await response.json();
    console.log('fetch response', typeof data);
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
    // Get city 
    var city = data.name;
    // Get description of weather
    var weatherDescription = data.weather[0].description;

    var weatherDiv = document.getElementById("weather");

    weatherDiv.innerHTML += "<img src=https://openweathermap.org/img/wn/" + weatherIcon + ".png alt='icon' width='42' height='40'><h2 id='temperature'>" + celsius + "°C</h2>";
    // weatherDiv.innerHTML += "<div class='description'><h2>" + weatherDescription + "</h2></div>"; 


    //coding wind compass
    var wind_dir = data.wind.deg -45;
    const compass = document.getElementById("compass");
    compass.style.transform = 'rotate(' + wind_dir + 'deg)';
    var wind_speed = (data.wind.speed);
    const speedometer = document.getElementById("speedometer");
    speedometer.innerHTML = wind_speed+" km/h"

  }

  // Display Dropdown in HTML
  function displayDropDown(stations) {
    // Display drop down for start destination
    stations.forEach(station=> {
      var option = document.createElement("option");
      option.setAttribute("id", "start-option");
      option.value = station.address + ', Dublin';
      option.innerHTML = station.address;
      document.getElementById("start").appendChild(option);
    })

    // Display drop down for end destination
    stations.forEach(station=> {
      var option = document.createElement("option");
      option.setAttribute("id", "end-option");
      option.value = station.address + ", Dublin";
      option.innerHTML = station.address;
      document.getElementById("end").appendChild(option);
    })
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
      


  //code for nearest btns/////////////
  const nearest_bike_btn = document.getElementById("nearest-bike");
  nearest_bike_btn.addEventListener("click", async () => {
    var stations = stations_with_bikes(markerArray);
    var user_coords = await getUserLocation();
    console.log(user_coords);
    nearest_station(stations, user_coords, 'WALKING');
});

const nearest_stand_btn = document.getElementById("nearest-stand");
nearest_stand_btn.addEventListener("click", () => {
    var user_coords = getUserLocation();
    console.log(user_coords);
    var stations = stations_with_stands(markerArray); 
    nearest_station(stations, user_coords, 'BICYCLING');
});

//funcs that takes arg of bike/stand and array of markers, and returns array with available bikes/stands
function stations_with_bikes(array){
    var has_bikes = [];
    for (let i =0; i< array.length; i++ ){
        if (array[i].bikes_free > 0){
            has_bikes.push(array[i]);
        }
    }
    return has_bikes;
}

function stations_with_stands(array){
    var has_stands = [];
    for (let i =0; i< array.length; i++ ){
        if (array[i].free_stands > 0){
            has_stands.push(array[i]);
        }
    }
    return has_stands;
}


function nearest_station(array, lat_lng, mode){
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

        
        directionsService.route(route,
          function(response, status) { // anonymous function to capture directions
            if (status !== 'OK') {
              window.alert('Directions request failed due to ' + status);
              return;
            } else {
              //directionsRenderer.setDirections(response); // Add route to the map
              console.log(response)
              var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
              if (!directionsData) {
                window.alert('Directions request failed');
                return;
              }
              else {
                dist = directionsData.distance.text
              }
            }
          });

          
        if (dist <= min_dist){
            min_distance = dist;
            nearest_station = array[i]
        }
    }
    return nearest_station;
}







  //***** CODE FOR DIRECTIONS *****
  let markerArray1 = []

  // Instantiate a directions service.
  const directionsService = new google.maps.DirectionsService();  
  // Create a renderer for directions and bind it to the map.
  const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  // Instantiate an info window to hold step text.
  const stepDisplay = new google.maps.InfoWindow();

  // Display the route between the initial start and end selections.
  calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray1,
    stepDisplay,
    map
  );

  // Listen to change events from the start and end lists.
  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService,
      markerArray1,
      stepDisplay,
      map
    );
  };

  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);


  ////// light/darkmode code /////////
  var is_light = true;
  var light_map = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "color": "#e0ffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "all",
        "stylers": [
            {
                "color": "#ff0000"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "all",
        "stylers": [
            {
                "color": "#5ec2c0"
            },
            {
                "visibility": "on"
            },
            {
                "lightness": "-8"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0d6372"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#5e99c2"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": "100"
            },
            {
                "color": "#9bc3ca"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
  ];
  map.set("styles", light_map);
  var dark_map = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#09b275"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": "0.01"
            },
            {
                "saturation": "100"
            },
            {
                "lightness": "100"
            },
            {
                "gamma": "5.15"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "color": "#286b40"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "weight": "1"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "weight": "0.01"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": "-35"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "all",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "100"
            },
            {
                "lightness": "17"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#0f8f61"
            },
            {
                "lightness": "-48"
            },
            {
                "saturation": "67"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0f8f61"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": "100"
            },
            {
                "color": "#0f8f61"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "weight": "1.49"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "gamma": "5.09"
            },
            {
                "saturation": "30"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "invert_lightness": true
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "weight": "6.63"
            },
            {
                "invert_lightness": true
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "weight": "1.88"
            },
            {
                "lightness": "-16"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#aaaaaa"
            },
            {
                "visibility": "on"
            },
            {
                "lightness": "0"
            }
        ]
    }
  ];
  const b1= document.getElementById("btn1");
  const b2= document.getElementById("btn2");
  var slider = document.getElementById("slider");
  slider.addEventListener("click", () => {
    if(is_light == true){
      is_light = false;
    } else if(is_light == false){
      is_light = true;
    }
    if (is_light == true){
      //light mode styling
      map.set("styles", light_map);
      document.getElementById("header").style.backgroundColor = "white";
      document.getElementById("button-div").style.backgroundColor = "white";
      document.getElementById("body").style.backgroundColor = "white";
      document.getElementById("dropdown").style.backgroundColor = "white";
      document.getElementById("location-buttons").style.backgroundColor = "white";
      document.getElementById("center-btn").style.color = "black";
      document.getElementById("warnings-panel").style.backgroundColor = "white";
      document.getElementById("compass").style.color = "black";
      document.getElementById("speedometer").style.color = "black";
      document.getElementById("pin").style.color = "lightblue";
      document.getElementById("dest_marker").style.color = "lightblue";
      document.getElementById("weather").style.backgroundColor = "lightblue";
      document.getElementById("weather").style.color= "black";


      b1.style.backgroundColor = "lightblue";
        b1.style.color = "white";
        b1.style.zIndex = "101";
        b2.style.backgroundColor = "white";
        b2.style.color = "black";
        b2.style.zIndex = "100";
      b1.addEventListener("click", () => {
        b1.style.backgroundColor = "lightblue";
        b1.style.color = "white";
        b1.style.zIndex = "101";
        b2.style.backgroundColor = "white";
        b2.style.color = "black";
        b2.style.zIndex = "100";
      })
      b2.addEventListener("click", () => {
        b2.style.backgroundColor = "lightblue";
        b2.style.color = "white";
        b2.style.textDecorationColor = "white"
        b2.style.zIndex = "101";
        b1.style.backgroundColor = "white";
        b1.style.color = "black";
        b1.style.zIndex = "100";
      })
    }else{
      //darkmode styling
      map.set("styles", dark_map);
      document.getElementById("header").style.backgroundColor = "black";
      b1.style.backgroundColor = "lightgreen";
        b1.style.color = "white";
        b1.style.textDecorationColor = "white"
        b1.style.zIndex = "101";
        b2.style.backgroundColor = "darkgreen";
        b2.style.color = "white";
        b2.style.zIndex = "100";
      document.getElementById("button-div").style.backgroundColor = "black";
      document.getElementById("body").style.backgroundColor = "black";
      document.getElementById("dropdown").style.backgroundColor = "black";
      document.getElementById("location-buttons").style.backgroundColor = "black";
      document.getElementById("center-btn").style.color = "white";
      document.getElementById("warnings-panel").style.backgroundColor = "black";
      document.getElementById("compass").style.color = "white";
      document.getElementById("speedometer").style.color = "white";
      document.getElementById("pin").style.color = "lightgreen";
      document.getElementById("dest_marker").style.color = "lightgreen";
      document.getElementById("weather").style.backgroundColor = "lightgreen";
      document.getElementById("weather").style.color= "white";


     
      b1.addEventListener("click", () => {
        b1.style.backgroundColor = "lightgreen";
        b1.style.color = "white";
        b1.style.textDecorationColor = "white"
        b1.style.zIndex = "101";
        b2.style.backgroundColor = "darkgreen";
        b2.style.color = "white";
        b2.style.zIndex = "100";
      })
      b2.addEventListener("click", () => {
        b2.style.backgroundColor = "lightgreen";
        b2.style.color = "white";
        b2.style.textDecorationColor = "white"
        b2.style.zIndex = "101";
        b1.style.backgroundColor = "darkgreen";
        b1.style.color = "white";
        b1.style.zIndex = "100";
      })
    }
  });
  //////end of dark-mode code/////////////
}

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
      origin: document.getElementById("start").value,
      destination: document.getElementById("end").value,
      travelMode: google.maps.TravelMode.WALKING,
    })
    .then((result) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      document.getElementById("warnings-panel").innerHTML =
        "<b>" + result.routes[0].warnings + "</b>";
      directionsRenderer.setDirections(result);
      showSteps(result, markerArray1, stepDisplay, map);
    })
    .catch((e) => {
      window.alert("Directions request failed due to " + e);
    });
}

function showSteps(directionResult, markerArray1, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  const myRoute = directionResult.routes[0].legs[0];

  for (let i = 0; i < myRoute.steps.length; i++) {
    const marker = (markerArray1[i] =
      markerArray1[i] || new google.maps.Marker());

    marker.setMap(map);
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

window.initMap = initMap;

