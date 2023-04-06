// Declare map and marker variables
let map;
let marker;

// Initialize and add the map
function initMap() {
  // Set the coordinates for the center of the map
  const dublin = { lat: 53.350140, lng: -6.266155 }

  // Create a new map instance and set its center and zoom level
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
    styles: [
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#e1e1e1"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#e1e1e1"
            },
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
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.medical",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
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
                "lightness": 45
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#c7e7c7"
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
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "saturation": "0"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#323232"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit.station.airport",
        "elementType": "geometry.fill",
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
        "featureType": "transit.station.bus",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit.station.rail",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ff0000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }]
  });

  // Requesting user location and adding their marker to map
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // Add a marker at the user's location
      new google.maps.Marker({
        position: userLocation,
        map: map
      });
    }, () => {
      // Handle errors
      alert("Error: The Geolocation service failed.");
    });
  } else {
    // Browser doesn't support Geolocation
    alert("Error: Your browser doesn't support geolocation.");
  }






  // Fetch station data and display markers and drop-down options
  fetchStationData(true);
  // Fetch weather data 
  fetchWeather();
  // Update station data every 30 seconds
  setInterval(fetchStationData, 35000);


// Fetch Stations
function fetchStationData() {
  fetch("/stations") 
    .then((response) => response.json())
    .then((data) => {
      console.log('fetch response', typeof data);
      displayDropDown(data);
      addMarkers(data);
    });
}

// Fetch Weather
function fetchWeather() {
  fetch("/weather")
  .then((response) => response.json())
  .then((data) => {
    console.log('fetch response', typeof data);
    displayWeather(data);
  });
}

// Displays the station data on the map as markers and info windows
function displayWeather(data) {
  var weatherDescription = data.weather[0].icon;
  var div = document.getElementById("weather");
  div.innerHTML = "<img src=https://openweathermap.org/img/wn/" + weatherDescription + ".png alt='icon' width='65' height='65'></img>"; 
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

  // Create arrays to store the markers and info windows
  const markerArray = [];
  const infoWindowArray = [];

  // Displays the station data on the map as markers and info windows
function addMarkers(stations) {
  
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
  const marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
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
    //
  return marker;
}

// Creates a new info window object for the given station
function createInfoWindow(station) {
  const contentString = `
    <div class="info-window">
      <h1>${station.address}</h1>
      <h2>Available Bikes:</h2>
      <p>${station.available_bikes}</p>
      <h2>Available Stands:</h2>
      <p>${station.available_bike_stands}</p>
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
     
  // ***** CODE FOR DIRECTIONS *****

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
    markerArray,
    stepDisplay,
    map
  );

  // Listen to change events from the start and end lists.
  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService,
      markerArray,
      stepDisplay,
      map
    );
  };

  document.getElementById("start-option").addEventListener("change", onChangeHandler);
  document.getElementById("end-option").addEventListener("change", onChangeHandler);
  

  function calculateAndDisplayRoute(
  directionsRenderer,
  directionsService,
  markerArray,
  stepDisplay,
  map
  ) {
  // First, remove any existing markers from the map.
  for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }
  
  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService
    .route({
      origin: document.getElementById("start-option").value,
      destination: document.getElementById("end-option").value,
      travelMode: google.maps.TravelMode.BICYCLING,
    })
    .then((result) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      document.getElementById("warnings-panel").innerHTML =
        "<b>" + result.routes[0].warnings + "</b>";
      directionsRenderer.setDirections(result);
      showSteps(result, markerArray, stepDisplay, map);
    })
    .catch((e) => {
      window.alert("Directions request failed due to " + e);
    });
  }

  function showSteps(directionResult, markerArray, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  const myRoute = directionResult.routes[0].legs[0];

  for (let i = 0; i < myRoute.steps.length; i++) {
    const marker = (markerArray[i] =
      markerArray[i] || new google.maps.Marker());

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
}

//code to change style of bike / stand selector buttons when clicked
const b1= document.getElementById("btn1");
const b2= document.getElementById("btn2");

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
  b2.style.zIndex = "101";
  b1.style.backgroundColor = "white";
  b1.style.color = "black";
  b1.style.zIndex = "100";


})

window.initMap = initMap;

