// Access Token for the mapbox API
L.mapbox.accessToken = 'pk.eyJ1IjoiY3dnaW5hYyIsImEiOiJjanBrNzV0b3MwMGM3NDltbGFkNXRoeGs5In0.IPKWBAfhpSTHopPUrFWGUQ';

// Launch Map (no user location due to no HTTPS)
var map = L.mapbox.map('map', 'mapbox.streets').setView([39.5296, -119.8138], 12);

var activeEvent = {}

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

map.on('draw:created', addOjbectToMap);
map.on('draw:edited', showPolygonAreaEdited);

var layers = {};

var colors = {
  "order": "#A00500",
  "warning": "#F3AF22"
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

/**
 * Adds what was drawn on the map to our objects.
 * @param {Event from Leaflet Draw Event} drawing 
 */
function addOjbectToMap(drawing) {
  var type = drawing.layerType,
    layer = drawing.layer;
  if (type === 'polygon') {
    addZone(drawing);
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
  
  if(!local) {
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
    iconSize:     [30, 30]
  });
  
  layers[location.location_id] = L.marker([location.latitude, location.longitude], {icon: myIcon});
  layers[location.location_id].addTo(map);

  layers[location.location_id].on('click', function (e) {
    displayLocation(location);
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

/**
 * Translate the Polyline data from Leaflet and add to our objects.
 * @param {Event from Leaflet Draw Event} line 
 */
function addPolyline(line) {
  // Build Mapbox directions request so we can draw the route on the map.
  var directionsRequest = "https://api.mapbox.com/directions/v5/mapbox/driving/"

  // Add the location data to the request, and create the route and waypoints.
  var route = new Route(activeEvent.event_id);
  line.layer.editing.latlngs[0].forEach(function (element) {
    directionsRequest += element.lng + "," + element.lat + ";";
  });

  directionsRequest = directionsRequest.substr(0, directionsRequest.length - 1);
  directionsRequest += "?geometries=geojson&access_token=" + L.mapbox.accessToken;

  // Add the route to the current Event.
  activeEvent.routes.push(route);

  // Set up Mapbox directions Request
  var XHR = new XMLHttpRequest();
  XHR.open('GET', directionsRequest);

  // Setup our listener to process completed requests
  XHR.onload = function () {
    if (XHR.status >= 200 && XHR.status < 300) {
      updateRoute(route, JSON.parse(XHR.responseText));
      drawRoute(route, JSON.parse(XHR.responseText), activeEvent);
    } else {
      // Something happened.
      console.log(XHR.responseText);
    }
  };

  // Finally, send our data.
  XHR.send();

  if (!local) {
    activeEvent.transmitData();
  }
}

/**
 * Draw the navigation route from the Mapbox API.
 * @param {Route} route object that holds the route.
 * @param {Json Object} directions object that holds the response from the Mapbox API.
 * @param {Event} event object that holds the parent event that this route is a part of.
 */
function drawRoute(route, directions, event) {
  // Decode the GeoJSON into encoded polyline, then decode that.
  var line = polyline.fromGeoJSON(directions["routes"][0]["geometry"]);
  var decoded = polyline.decode(line);

  // Add the polyline/route to the layers and add to the map.
  layers[route.route_id] = L.polyline(decoded);
  layers[route.route_id].addTo(map);

  layers[route.route_id].on('click', function (e) {
    displayEvent(event);
    displayRoute(route, event);
  });

  route.checkpoints.forEach(function (element) {
    var myIcon = L.icon({
      iconUrl: "waypoint_icons/" + (element.order + 1) + ".png",
      iconRetinaUrl: "waypoint_icons/" + (element.order + 1) + "@2x.png",
    });
    
    layers[element.waypoint_id] = L.marker([element.latitude, element.longitude], {icon: myIcon});
    layers[element.waypoint_id].addTo(map);
  });
}

/**
 * Updates the route with the information held in directions (response from the Mapbox Navigation API).
 * @param {Route} route object that holds the route.
 * @param {Json Object} directions object that holds the response from the Mapbox API.
 */
function updateRoute(route, directions) {
  if (!local) {
    route.waypoints.forEach(function (element) {
      element.removeFromDatabase();
    });

    route.checkpoints.forEach(function (element) {
      element.removeFromDatabase();
    });
  }

  route.waypoints = [];
  directions["routes"][0]["geometry"]["coordinates"].forEach(function (element, index) {
    var waypoint = new Waypoint(route.route_id, index, false);

    waypoint.longitude = element[0];
    waypoint.latitude = element[1];

    route.waypoints.push(waypoint);
  });

  route.waypoints.forEach(function (element) {
    if (!local) {
      element.transmitData();
    }
  });

  route.checkpoints = []
  directions["waypoints"].forEach(function (element, index) {
    var waypoint = new Waypoint(route.route_id, index, true);

    waypoint.longitude = element["location"][0];
    waypoint.latitude = element["location"][1];

    route.checkpoints.push(waypoint);
  });

  route.checkpoints.forEach(function (element) {
    if (!local) {
      element.transmitData();
    }
  });
}

/**
 * Add the drawn event/zone.
 * @param {*} zone - the event from the leaflet Draw event.
 */
function addZone(zone) {
  var event = new BeeEvent();

  // Set up default information
  event.type = "evacuation";
  event.severity = "order";
  event.instructions = "class based events!"

  // Add boundary coordinates
  zone.layer.editing.latlngs[0][0].forEach(function (element, index) {
    var boundary = new BoundaryCoord(event.event_id, index);
    boundary.latitude = element.lat;
    boundary.longitude = element.lng;

    event.bound_coords.push(boundary);
  });

  // Show the event in the sidebar, and show on map.
  displayEvent(event);

  layers[event.event_id] = zone.layer;
  featureGroup.addLayer(layers[event.event_id]);

  // Update the zone, then send the information to the server.
  updateZone(event);
  if (!local) {
    event.transmitData();
  }
}

/**
 * Update the zone color and add in click event handler.
 * @param {Event} event - the event object.
 */
function updateZone(event) {
  featureGroup.removeLayer(layers[event.event_id]);
  layers[event.event_id].options.color = colors[event.severity];
  layers[event.event_id].options.fillOpacity = 0.2;
  featureGroup.addLayer(layers[event.event_id]);

  layers[event.event_id].on('click', function (e) {
    displayEvent(event);
  });
}

/**
 * Display the event in the side bar.
 * @param {Event} event - the current event.
 */
function displayEvent(event) {
  activeEvent = event;
  var showEvent = "Event ID: " + event.event_id + "<br/>";
  showEvent += "Severity: ";
  showEvent += "<select id='severity'>";
  showEvent += "<option value='order'>Order</option>";
  showEvent += "<option value='warning'>Warning</option>";
  showEvent += "</select><br/>";
  showEvent += "Type: ";
  showEvent += "<select id='type'>";
  showEvent += "<option value='evacuation'>Evacuation</option>";
  showEvent += "<option value='shelter'>Shelter In Place</option>";
  showEvent += "</select><br/>";
  showEvent += "<p class='formfield'>";
  showEvent += "<label for='instructions'>Instructions:</label>";
  showEvent += "<textarea rows='20' cols='50' id='instructions'></textarea>";
  showEvent += "</p>";

  showEvent += "<p>";
  showEvent += "<button type='button' id='PushNotification'>Push Notifications</button>";
  showEvent += "</p>";

  showEvent += "<p id='routeInfo'>";
  showEvent += "</p>";

  $("div.info_pane").html(showEvent);

  $("select[id=severity]").val(event.severity).change().change(function () {
    event.severity = $("select[id=severity]").val();
    updateZone(event);
    if (!local) { 
      event.transmitData(); 
    }
  });
  $("#type").val(event.type).change().change(function () {
    event.type = $("select[id=type]").val();
    if (!local) { 
      event.transmitData(); 
    }
  });

  $("#instructions").val(event.instructions).change(function () {
    event.instructions = $("textarea[id=instructions]").val();
    if (!local) { 
      event.transmitData(); 
    }
  });

  $("#PushNotification").click(function () {
    var push_notification = {
      event_id: event.event_id,
      notification_title: "Evacuation Order",
      notification_subtitle: "An Evacuation Has Been Ordered For Your Area.",
      notification_text: "Open BEE for more information."
    };
  
    var XHR = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    var name;
  
    // Turn the data object into an array of URL-encoded key/value pairs.
    for(name in push_notification) {
      urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(push_notification[name]));
    }
  
    // Combine the pairs into a single string and replace all %-encoded spaces to 
    // the '+' character; matches the behaviour of browser form submissions.
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    console.log(urlEncodedData);
  
    // Set up our request
    XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/push-notifications-for-event');
  
    // Add the required HTTP header for form data POST requests
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
    // Finally, send our data.
    XHR.send(urlEncodedData);

  });
}

/**
 * Displays the route in the side bar.
 * @param {Route} route 
 * @param {BeeEvent} event 
 */
function displayRoute(route, event) {
  var showRoute = "Route ID: " + route.route_id;

  route.checkpoints.forEach(function (element, index) {
    showRoute += "\tWaypoint " + (index + 1) + ": " + element.latitude + ", " + element.longitude + "<br/>";
  });

  showRoute += "<p>";
  showRoute += "Use 'Delete This Route' below to redraw or remove this route.<br/>";
  showRoute += "<button type='button' id='deleteRoute'>Delete This Route</button>";
  $("#routeInfo").html(showRoute);

  $("#deleteRoute").click(function () {
    // Remove this route from the event.
    event.routes.forEach(function(element, index) {
      if (element.route_id == route.route_id) {
        event.routes.splice(index, 1);
      }
    });

    if (!local) {
      route.removeFromDatabase();
    }

    route.checkpoints.forEach(function(element) {
      map.removeLayer(layers[element.waypoint_id]);
    });

    map.removeLayer(layers[route.route_id]);
    $("#routeInfo").html("");
  });
}

/**
 * Displays the location in the sidebar.
 * @param {BEELocation} location 
 */
function displayLocation(location) {
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
  showLocation += "<textarea rows='20' cols='50' id='info'></textarea>";
  showLocation += "</p>";

  $("div.info_pane").html(showLocation);

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
}


