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
      drawRoute(route, JSON.parse(XHR.responseText), activeEvent);
    } else {
      // Something happened.
      console.log(XHR.responseText);
    }
  };

  // Finally, send our data.
  XHR.send();

  activeEvent.transmitData();
}

/**
 * Draw the navigation route from the Mapbox API.
 * @param {String} route_id - the id of the route being drawn.
 * @param {String - response from Mapbox API} directions - the actual directions from the Mapbox API.
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
  });

  decoded.forEach(function (element, index) {
    var waypoint = new Waypoint(route.route_id, index);
    waypoint.latitude = element[0];
    waypoint.longitude = element[1];
    
    route.waypoints.push(waypoint);

    waypoint.transmitData();
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
  zone.layer.editing.latlngs[0][0].forEach(function (element) {
    var boundary = new BoundaryCoord(event.event_id);
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
  event.transmitData()
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
  event.routes.forEach(function (element, index) {
    showEvent += "Route " + (index + 1) + "<br/>"
  });
  showEvent += "</p>";

  $("div.info_pane").html(showEvent);

  $("select[id=severity]").val(event.severity).change().change(function () {
    event.severity = $("select[id=severity]").val();
    updateZone(event);
    event.transmitData()
  });
  $("#type").val(event.type).change().change(function () {
    event.type = $("select[id=type]").val();
    event.transmitData()
  });

  $("#instructions").val(event.instructions).change(function () {
    event.instructions = $("textarea[id=instructions]").val();
    event.transmitData()
  });
}

