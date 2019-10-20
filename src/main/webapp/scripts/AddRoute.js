/**
 * Translate the Polyline data from Leaflet and add to our objects.
 * @param {Event from Leaflet Draw Event} line 
 */
function addPolyline(line) {
    // Add the location data to the request, and create the route and waypoints.
    var latlngs = []
    line.layer.editing.latlngs[0].forEach(function (element) {
      latlngs.push([element.lng, element.lat]);
    });
  
    getDirectionsForNewRoute(latlngs);
  }

  
  /**
   * 
   * @param {array of latlngs} latlngs 
   * @param {string} eventId
   */
  function getDirectionsForNewRoute(latlngs) {
    // Build Mapbox directions request so we can draw the route on the map.
    var directionsRequest = "https://api.mapbox.com/directions/v5/mapbox/driving/"
  
    // Add the location data to the request, and create the route and waypoints.
    latlngs.forEach(function (element) {
      directionsRequest += element[0] + "," + element[1] + ";";
    });
  
    directionsRequest = directionsRequest.substr(0, directionsRequest.length - 1);
    directionsRequest += "?geometries=geojson&access_token=" + L.mapbox.accessToken;
  
    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', directionsRequest);
  
    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        var route = newRoute(JSON.parse(XHR.responseText));
        activeEvent.routes.push(route);
        drawRoute(route, JSON.parse(XHR.responseText), activeEvent);
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };
  
    // Finally, send our data.
    XHR.send();
  }
  
  /**
   * 
   * @param {array of latlngs} latlngs 
   * @param {string} eventId
   */
  function getDirectionsForExistingRoute(latlngs, route) {
    // Build Mapbox directions request so we can draw the route on the map.
    var directionsRequest = "https://api.mapbox.com/directions/v5/mapbox/driving/"
  
    // Add the location data to the request, and create the route and waypoints.
    latlngs.forEach(function (element) {
      directionsRequest += element[0] + "," + element[1] + ";";
    });
  
    directionsRequest = directionsRequest.substr(0, directionsRequest.length - 1);
    directionsRequest += "?geometries=geojson&access_token=" + L.mapbox.accessToken;
  
    // Set up Mapbox directions Request
    var XHR = new XMLHttpRequest();
    XHR.open('GET', directionsRequest);

    activeRoute = route;
  
    // Setup our listener to process completed requests
    XHR.onload = function () {
      if (XHR.status >= 200 && XHR.status < 300) {
        activeEvent.routes.push(route);
        drawRoute(activeRoute, JSON.parse(XHR.responseText), activeEvent);
      } else {
        // Something happened.
        console.log(XHR.responseText);
      }
    };
  
    // Finally, send our data.
    XHR.send();
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
      displayRoute(route, event, e);
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
  function newRoute(directions) {
    var route = new Route(activeEvent.event_id);
    route.waypoints = [];
    directions["routes"][0]["geometry"]["coordinates"].forEach(function (element, index) {
      var waypoint = new Waypoint(route.route_id, index, false);
  
      waypoint.longitude = element[0];
      waypoint.latitude = element[1];
  
      route.waypoints.push(waypoint);
    });
  
    route.checkpoints = []
    directions["waypoints"].forEach(function (element, index) {
      var waypoint = new Waypoint(route.route_id, index, true);
  
      waypoint.longitude = element["location"][0];
      waypoint.latitude = element["location"][1];
  
      route.checkpoints.push(waypoint);
    });

    route.transmitData();

    return route;
  }
  
  
  /**
   * Displays the route in the side bar.
   * @param {Route} route 
   * @param {BeeEvent} event 
   */
  function displayRoute(route, event, e) {
    var showRoute = "Route ID: " + route.route_id;
  
    route.checkpoints.forEach(function (element, index) {
      showRoute += "\tWaypoint " + (index + 1) + ": " + element.latitude + ", " + element.longitude + "<br/>";
    });
  
    showRoute += "<p>";
    showRoute += "Use 'Delete This Route' below to redraw or remove this route.<br/>";
    showRoute += "<button type='button' id='deleteRoute'>Delete This Route</button>";
    var popup = L.popup().setLatLng(e.latlng).setContent(showRoute).openOn(map);
  
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
    });
  }
  
  