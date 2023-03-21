let map;
function initMap() {
  const dublin = { lat: 53.350140, lng: -6.266155 }
  map = new google.maps.Map(document.getElementById("map"), {
    center: dublin,
    zoom: 14,
  });
  // The marker, positioned at Dublin
  // const marker = new google.maps.Marker({
  //   position: dublin,
  //   map: map,
  // })
  getStations();
}

window.initMap = initMap;

function addMarkers(stations) {
  for (const station of stations) {
    var marker = new google.maps.Marker({
      position: {
        lat: station.position_lat,
        lng: station.position_lng,
      }, 
      map: map,
      title: station.name,
      station_number: station.number,
    });
  }
}

function getStations() {
  fetch("/stations") 
    .then((response) => response.json())
    .then((data) => {
      console.log('fetch response', typeof data);
      addMarkers(data);
    });
}