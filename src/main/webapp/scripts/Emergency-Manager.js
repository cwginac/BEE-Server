// Access Token for the mapbox API
L.mapbox.accessToken = 'pk.eyJ1IjoiY3dnaW5hYyIsImEiOiJjanBrNzV0b3MwMGM3NDltbGFkNXRoeGs5In0.IPKWBAfhpSTHopPUrFWGUQ';

// Launch Map (no user location due to no HTTPS)
var map = L.mapbox.map('map', 'mapbox.streets').setView([39.5296, -119.8138], 12);

var activeEvent = {}
var activeRoute = {}

var directions = L.mapbox.directions();

// Controls
var featureGroup = L.featureGroup().addTo(map);

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  },
  draw: {
    polygon: true,
    polyline: true,
    rectangle: false,
    circle: false,
    marker: true
  }
}).addTo(map);

var ShowEvacuee = L.Control.extend({
  options: {
    position: 'topleft'
    //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

    container.style.backgroundColor = 'white';
    container.style.backgroundImage = "url(button_icons/personInDanger.png)";
    container.style.backgroundSize = "25px 25px";
    container.style.backgroundRepeat = "no-repeat";
    container.style.backgroundPosition = "center";
    container.style.width = '30px';
    container.style.height = '30px';

    container.onclick = function () {
      showingEvacuees ? hideEvacuees() : displayEvacuees();
      showingEvacuees = !showingEvacuees;
    }
    return container;
  }
});

var showingEvacuees = false;
map.addControl(new ShowEvacuee());

var ShowReports = L.Control.extend({
  options: {
    position: 'topleft'
    //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

    container.style.backgroundColor = 'black';
    container.style.backgroundImage = "url(button_icons/report.png)";
    container.style.backgroundSize = "25px 20px";
    container.style.backgroundRepeat = "no-repeat";
    container.style.backgroundPosition = "center";
    container.style.width = '30px';
    container.style.height = '30px';

    container.onclick = function () {
      showingReports ? hideReports() : displayReports();
      showingReports = !showingReports;
    }
    return container;
  }
});

var showingReports = false;
map.addControl(new ShowReports());

map.on('draw:created', addOjbectToMap);
map.on('draw:edited', showPolygonAreaEdited);

var layers = {};

var colors = {
  "order": "#A00500",
  "warning": "#F3AF22",
  "none": "#C0C0C0"
}

function showPolygonAreaEdited(e) {
  e.layers.eachLayer(function (layer) {
    showPolygonArea({ layer: layer });
  });
}

// Calls to BEE server will fail if running locally.  Determine if running locally, and if so, block transmit data
var local = false;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
  local = true;
}

var currentEvents = [];
var currentLocations = [];
var currentReports = [];
var currentEvacuees = [];

getCurrentEvents();
getAllLocations();
getAllEvacuees();
getAllReports();

setInterval(function() {
  getAllEvacuees();
  getAllReports();
}, 10000);

/**
 * Adds what was drawn on the map to our objects.
 * @param {Event from Leaflet Draw Event} drawing 
 */
function addOjbectToMap(drawing) {
  var type = drawing.layerType,
    layer = drawing.layer;
  if (type === 'polygon') {
    var event = newEvent(drawing.layer.editing.latlngs[0][0])
    drawEvent(event);
    updateEvent(event);

    currentEvents.push(event);
    if (!local) {
      event.transmitData();
    }
  }
  else if (type === "polyline") {
    addPolyline(drawing);
  }
  else if (type === "marker") {
    addLocation(drawing);
  }
}

/**
 * Adds the marker (location) to our database and local objects, also draws the marker on the map.
 * @param {Event from Leaflet Draw Event} marker 
 */
function addLocation(marker) {
  var location = new BEELocation();

  location.latitude = marker.layer._latlng.lat;
  location.longitude = marker.layer._latlng.lng;

  drawLocation(location);

  if (!local) {
    location.transmitData();
  }
}

/**
 * Draws the location on the map, with the correct icon for its type.
 * @param {BEELocation} location 
 */
function drawLocation(location) {
  var myIcon = L.icon({
    iconUrl: "location_icons/" + location.type + ".png",
    iconSize: [30, 30]
  });

  layers[location.location_id] = L.marker([location.latitude, location.longitude], { icon: myIcon });
  layers[location.location_id].addTo(map);

  layers[location.location_id].on('click', function (e) {
    displayLocation(location, e);
  });
}

/**
 * Updates the location on the map.
 * @param {BEELocation} location 
 */
function updateLocation(location) {
  map.removeLayer(layers[location.location_id]);

  drawLocation(location);
}

function getCurrentEvents() {
  if (!local) {
    var eventsRequest = "http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/get-events"

    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', eventsRequest);

    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        var parsedJSON = JSON.parse(XHR.responseText);

        parsedJSON.forEach(function (element, index) {
          var event = new BeeEvent();
          event.event_id = element["eventId"]
          event.type = element["type"];
          event.severity = element["severity"];
          event.instructions = element["instructions"]

          // Add boundary coordinates
          element["boundaryPoints"].forEach(function (coord, index) {
            var boundary = new BoundaryCoord(event.event_id, coord["ordinal"], coord.bound_coord_id);
            boundary.latitude = coord["coordinate"]["latitude"];
            boundary.longitude = coord["coordinate"]["longitude"];
            boundary.bound_coord_id = coord["bound_coord_id"]
            event.bound_coords.push(boundary);
          });

          event.bound_coords.push(event.bound_coords[0]);
          activeEvent = event;

          var latlngs = [];

          element["routes"].forEach(function (route, index) {
            var existingRoute = new Route(event.event_id, route["routeId"]);
            route["waypoints"].forEach(function (waypoint, index) {
              var newWaypoint = new Waypoint(route.route_id, waypoint["ordinal"], waypoint["checkpoint"]);
              newWaypoint.longitude = waypoint["coordinate"]["longitude"];
              newWaypoint.latitude = waypoint["coordinate"]["latitude"];
              newWaypoint.waypointId = waypoint["waypoint_id"]
              
              if (waypoint["checkpoint"]) {
                existingRoute.checkpoints.push(newWaypoint);
                latlngs.push([waypoint["coordinate"]["longitude"], waypoint["coordinate"]["latitude"]])
              }
              else {
                existingRoute.waypoints.push(newWaypoint);
              }
            });

            getDirectionsForExistingRoute(latlngs, existingRoute);            

            
            existingRoute.status = route["status"];
            activeEvent.routes.push(existingRoute);
            
          });

          currentEvents.push(event);
        });

        // Get routes
        currentEvents.forEach(function (element, index) {
          drawEvent(element);
          updateEvent(element);
        });
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };

    // Finally, send our data.
    XHR.send();
  }
  else {
    return null;
  }
}

function getCurrentReports() {
  if (!local) {
    var reportsRequest = "http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/get-reports"

    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', reportsRequest);

    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        return JSON.parse(XHR.responseText);
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };

    // Finally, send our data.
    XHR.send();
  }
  else {
    return null;
  }
}

function getAllEvacuees() {
  if (!local) {
    var locationRequest = "http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/get-evacuees"

    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', locationRequest);

    // Setup our listener to process completed requests
    XHR.onload = function () {
      currentEvacuees = []
      if (XHR.status >= 200 && XHR.status < 300) {
        var parsedJSON = JSON.parse(XHR.responseText);

        parsedJSON.forEach(function (element, index) {
          currentEvacuees.push(new Evacuee(element));
        });
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };

    // Finally, send our data.
    XHR.send();
  }
  else {
    return null;
  }
}

function displayEvacuees() {
  currentEvacuees.forEach(function (element) {
    var type = "";
    if (element.safe) {
      type = "safe";
    }
    else if (element.acknowledged) {
      type = "evacuating";
    }
    else if (element.notification_sent) {
      type = "notsafe"
    }
    else {
      type = "safe";
    }
    var myIcon = L.icon({
      iconUrl: "evacuee_icons/" + type + ".png",
      iconSize: [5, 5]
    });

    layers[element.userId] = L.marker([element.latitude, element.longitude], { icon: myIcon });
    layers[element.userId].addTo(map);
  });
}

function hideEvacuees() {
  currentEvacuees.forEach(function (element) {
    map.removeLayer(layers[element.userId]);
  });
}

function getAllReports() {
  if (!local) {
    var reportsRequest = "http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/get-reports"

    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', reportsRequest);

    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        var parsedJSON = JSON.parse(XHR.responseText);

        currentReports = []
        parsedJSON.forEach(function (element, index) {
          currentReports.push(new Report(element));
        });
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };

    // Finally, send our data.
    XHR.send();
  }
  else {
    return null;
  }
}

function getAllLocations() {
  if (!local) {
    var reportsRequest = "http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/get-locations"

    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', reportsRequest);

    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        var parsedJSON = JSON.parse(XHR.responseText);

        currentLocations = []
        parsedJSON.forEach(function (element, index) {
          var location = new BEELocation();
          location.location_id = element["locationId"];
          location.type = element["type"];
          location.name = element["name"];
          location.latitude = element["coordinate"]["latitude"];
          location.longitude = element["coordinate"]["longitude"];
          location.info = element["info"];

          currentLocations.push(location);
          drawLocation(location)
        });
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };

    // Finally, send our data.
    XHR.send();
  }
  else {
    return null;
  }
}

function displayReports() {
  currentReports.forEach(function (element) {

    var myIcon = L.icon({
      iconUrl: "button_icons/" + element.type + ".png",
      iconSize: [30, 30]
    });

    layers[element.reportId] = L.marker([element.latitude, element.longitude], { icon: myIcon });
    layers[element.reportId].addTo(map);

    layers[element.reportId].on('click', function (e) {
      displayReport(element, e);
    });
  
  });
}

function displayReport(report, e) {
  var showReport = "Report ID: " + report.reportId;
  
  showReport += "<p>";
  showReport += "Type: " + report.type + "<br/>";
  showReport += "Information: " + report.info + "<br/><br/>"
  showReport += "<button type='button' id='deleteReport'>Delete This Report</button>";
  var popup = L.popup().setLatLng(e.latlng).setContent(showReport).openOn(map);
  
    $("#deleteReport").click(function () {
      // Remove this route from the event.
      currentReports.forEach(function(element, index) {
        if (element.reportId == report.reportId) {
          currentReports.splice(index, 1);
        }
      });
  
      if (!local) {
        report.removeFromDatabase();
      }
  
      map.removeLayer(layers[report.reportId]);
    });
}

function hideReports() {
  currentReports.forEach(function (element) {
    map.removeLayer(layers[element.reportId]);
  });
}

/**
 * Displays the location in the sidebar.
 * @param {BEELocation} location 
 */
function displayLocation(location, e) {
  var showLocation = "Location ID: " + location.location_id;
  showLocation += "<br/>"
  showLocation += "Name: <input type='text' id='locationName'><br/>";
  showLocation += "Type: ";
  showLocation += "<select id='locationType'>";
  showLocation += "<option value='fire'>Fire</option>";
  showLocation += "<option value='hospital'>Hospital</option>";
  showLocation += "<option value='hurricane'>Hurricane</option>";
  showLocation += "<option value='information'>Information</option>";
  showLocation += "<option value='largeAnimalShelter'>Large Animal Shelter</option>";
  showLocation += "<option value='other'>Other</option>";
  showLocation += "<option value='police'>Police</option>";
  showLocation += "<option value='roadBlocked'>Road Blocked</option>";
  showLocation += "<option value='humanShelter'>Shelter</option>";
  showLocation += "<option value='smallAnimalShelter'>Small Animal Shelter</option>";
  showLocation += "<option value='tropicalStorm'>Tropical Storm</option>";
  showLocation += "</select><br/>";
  showLocation += "<p class='formfield'>";
  showLocation += "<label for='info'>Information:</label>";
  showLocation += "<textarea rows='20' cols='30' id='info'></textarea>";
  showLocation += "<button type='button' id='deleteLocation'>Delete This Location</button>";
  showLocation += "</p>";

  var popup = L.popup().setLatLng(e.latlng).setContent(showLocation).openOn(map);

  $("select[id=locationType]").val(location.type).change().change(function () {
    location.type = $("select[id=locationType]").val();
    updateLocation(location);
    if (!local) {
      location.transmitData();
    }
  });

  $("input[id=locationName]").val(location.name).change().change(function () {
    location.name = $("input[id=locationName]").val();
    updateLocation(location);
    if (!local) {
      location.transmitData();
    }
  })

  $("#info").val(location.info).change(function () {
    location.info = $("textarea[id=info]").val();
    if (!local) {
      location.transmitData();
    }
  });

  $("#deleteLocation").click(function () {
    // Remove this route from the event.
    currentLocations.forEach(function(element, index) {
      if (element.location_id == location.location_id) {
        currentLocations.splice(index, 1);
      }
    });

    if (!local) {
      location.removeFromDatabase();
    }

    map.removeLayer(layers[location.location_id]);
  });
}