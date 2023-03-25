let map;

// Initialize and add the map
function initMap() {
  const dublin = { lat: 53.350140, lng: -6.266155 }
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
  });

  getStations();
}

window.initMap = initMap;


// fetch stations
function getStations() {
  fetch("/stations") 
    .then((response) => response.json())
    .then((data) => {
      console.log('fetch response', typeof data);
      addMarkersAndInfoWindow(data);
    });
}

// ***** CODE FOR ADDING MARKERS *****


function addMarkersAndInfoWindow(stations) {
  for (const station of stations) {

    // Place markers on station locations

    var marker = new google.maps.Marker({
      position: {
        lat: station.position_lat,
        lng: station.position_lng,
      }, 
      map: map,
      title: station.address,
      station_number: station.number,
    });   

    //  ***** CODE FOR INFO-WINDOW *****

    const contentString = "<div><h1>" + marker.title + "</h1></div>";

    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: "Uluru",
    });

    google.maps.event.addListener(marker, 'click', function(marker) {
      return function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      }
    }(marker));
  }

  
}



