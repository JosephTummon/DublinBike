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
  });

  // Fetch station data and display markers and drop-down options
  fetchStationData();

  // Update station data every 30 seconds
  setInterval(fetchStationData, 30000);


// fetch stations
function fetchStationData() {
  fetch("/stations") 
    .then((response) => response.json())
    .then((data) => {
      console.log('fetch response', typeof data);
      displayDropDown(data);
      addMarkers(data);
      updateDropDown(data);
    });
}

// Display Dropdown in HTML
function displayDropDown(stations) {
  // Display drop down for start destination
  stations.forEach(station=> {
    var option = document.createElement("option");
    option.classList.add("option");
    option.value = station.address + ', Dublin';
    option.innerHTML = station.address;
    document.getElementById("start").appendChild(option);
  })

  // Display drop down for end destination
  stations.forEach(station=> {
    var option = document.createElement("option");
    option.classList.add("option");
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
  const { lat, lng } = station.position;
  const myLatlng = { lat, lng };
  const marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: station.address,
    station_number: station.number,
    bikes_free: station.available_bikes,
    free_stands: station.available_bike_stands,
  });  
  marker.setLabel(station.available_bikes.toString());
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

  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);
  

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
      origin: document.getElementById("start").value,
      destination: document.getElementById("end").value,
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

window.initMap = initMap;