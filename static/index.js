let map;
let marker;

// Initialize and add the map
function initMap() {
  const dublin = { lat: 53.350140, lng: -6.266155 }
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
  });

  getStations();

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

  // fetch stations
  function getStations() {
    fetch("/stations") 
      .then((response) => response.json())
      .then((data) => {
        console.log('fetch response', typeof data);
        addMarkersAndInfoWindow(data);
        displayDropDown(data);
      });
  }

  // ***** CODE FOR ADDING MARKERS AND INFO-WIDOW*****

  const markerArray = [];
  const infoWindowArray = [];

  function addMarkersAndInfoWindow(stations) {
    for (const station of stations) {

      // Place markers on station locations

      var myLatlng = { lat: station.position_lat, lng: station.position_lng };
    

      var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: station.address,
        station_number: station.number,
        available_bikes: a.bikes_free,
        icon: {
          url: 'http://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00a4d3'
        }
      });  
      
      markerArray.push(marker);

      // Place info window on markers

      const contentString = 
      "<div><h1>" + marker.title + "</h1><h1>" + marker.available_bikes + "</h1></div>"

      var infowindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: "Uluru",
      });

      infoWindowArray.push(infowindow);

      google.maps.event.addListener(marker, 'click', function(marker) {
        return function() {
          if (infowindow) {
            infowindow.close();
          }
          infowindow.setContent(contentString);
          infowindow.open(map, marker);
        }
      }(marker));
    }
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
  }

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

window.initMap = initMap;






