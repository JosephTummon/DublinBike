// Declare map and marker variables
let map;
let marker;
let autocomplete;

// Initialize and add the map
async function initMap() {
  // Set the coordinates for the center of the map
  const dublin = { lat: 53.350140, lng: -6.266155 }

  // Create a new map instance and set its center and zoom level
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
  });

  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

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
    var weatherDescription = data.weather[0].icon;
    var weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = "<img src=https://openweathermap.org/img/wn/" + weatherDescription + ".png alt='icon' width='65' height='65'>";

    var kelvin = data.main.temp;
    var celsius = Math.round((kelvin - 273.15) * 10) / 10;
    weatherDiv.innerHTML += "<h1>" + celsius + "°C</h1>";
  }

  // Display Dropdown in HTML
  function displayDropDown(stations) {
    // Display drop down for start destination
    stations.forEach(station => {
      var option = document.createElement("option");
      option.setAttribute("id", "start-option");
      option.value = station.address + ', Dublin';
      option.innerHTML = station.address;
      document.getElementById("start").appendChild(option);
    })

    // Display drop down for end destination
    stations.forEach(station => {
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
    const markerArray = [];
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
      marker.addListener("click", () => {
        google.charts.load('current', { 'packages': ['corechart'] });
        drawChart(station.number);
        document.getElementById("mySidebar").style.width = "650px";
        document.getElementById("main").style.marginLeft = "650px";
      });

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
      marker.setLabel(station.available_bikes.toString());
    });
    const toggleButton2 = document.getElementById("btn2");
    toggleButton2.addEventListener("click", () => {
      marker.setLabel(station.available_bike_stands.toString());
    });

    toggleButton1.addEventListener("click", () => {
      btn1.classList.add("active");
      btn2.classList.remove("active");
    });

    toggleButton2.addEventListener("click", () => {
      btn2.classList.add("active");
      btn1.classList.remove("active");
    });
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
    google.maps.event.addListener(marker, "mouseover", function () {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;
    });

    google.maps.event.addListener(marker, 'mouseout', function () {
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

  //code to change style of bike / stand selector buttons when clicked
  const b1 = document.getElementById("btn1");
  const b2 = document.getElementById("btn2");

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

  function drawChart(number) {
    const loadingDiv = document.getElementById("loading");
    loadingDiv.style.display = "block"; // show the loading animation
    const cacheBuster = Date.now(); // add a cache-busting parameter
    fetch(`/averages/${number}?cb=${cacheBuster}`)
      .then(response => response.json())
      .then(data => {
        const chosenStationName = data[0].address;
        document.getElementById("stationTitle").innerHTML = `<h2>${chosenStationName}</h2>`;
        const chart_data = new google.visualization.DataTable();
        chart_data.addColumn("string", "Week_Day_No");
        chart_data.addColumn("number", "Average Bikes Available");
        chart_data.addColumn("number", "Average Bike Stands");

        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const rows = dayNames.map(dayName => {
          const matchingData = data.find(obj => obj.day_of_week === dayName);
          return [dayName, matchingData ? matchingData.Avg_bikes_free : null, matchingData ? matchingData.Avg_bike_stands : null];
        });
        chart_data.addRows(rows);
        const options = {
          titlePosition: 'none',
          width: "700",
          height: "450",
          chartArea: { 'width': '75%', bottom: 15, 'height': '80%' },
          legend: { position: "bottom" }
        };
        loadingDiv.style.display = "none"; // hide the loading animation 

        const chart = new google.visualization.ColumnChart(document.getElementById("PredictiveChart"));
        chart.draw(chart_data, options);

        const form = document.querySelector('form');
        form.addEventListener('submit', (event) => {
          console.log("Testing");
          event.preventDefault(); // prevent form submission
          var datetime = document.getElementById('availabletime').value;
          console.log(datetime); // log the value of the datetime input field
          var datetime = new Date(datetime); 
          const dayOfWeek = datetime.getDay(); // returns 0 for Sunday, 1 for Monday, and so on
          const hour = datetime.getHours();
          console.log(dayOfWeek, hour);
          getPrediction(number, dayOfWeek, hour);
        });
      });
  }

  function getPrediction(number, dayOfWeek, hour) {
    fetch(`/predictions/${number}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById("displayPrediction").innerHTML = "Number of available bikes: " + data[dayOfWeek][hour];
        console.log(data[dayOfWeek][hour]);
      });
  }
  
}
window.initMap = initMap;
