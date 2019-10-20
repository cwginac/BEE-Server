
function newEvent(latlngs) {
  var event = new BeeEvent();
  // Set up default information
  event.type = "evacuation";
  event.severity = "order";
  event.instructions = "";

  // Add boundary coordinates
  latlngs.forEach(function (element, index) {
    var boundary = new BoundaryCoord(event.event_id, index);
    boundary.latitude = element.lat;
    boundary.longitude = element.lng;

    event.bound_coords.push(boundary);
  });

  // Show the event in the sidebar, and show on map.
  activeEvent = event;

  return event;
}

/**
 * Draw the Event on the map.
 * @param {Event} event object that holds the parent event that this route is a part of.
 */
function drawEvent(event) {
  var latlngs = [];
  event.bound_coords.forEach(function (element, index) {
    latlngs.push([element.latitude, element.longitude]);
  });

  layers[event.event_id] = L.polygon(latlngs, {color: 'blue'});
  layers[event.event_id].addTo(map);
}

/**
 * Update the zone color and add in click event handler.
 * @param {Event} event - the event object.
 */
function updateEvent(event) {
  map.removeLayer(layers[event.event_id]);
  layers[event.event_id].options.color = colors[event.severity];
  layers[event.event_id].options.fillOpacity = 0.2;
  layers[event.event_id].addTo(map)

  layers[event.event_id].on('click', function (e) {
    displayEvent(event, e);
  });
}

/**
 * Display the event in the side bar.
 * @param {Event} event - the current event.
 */
function displayEvent(event, e) {
  activeEvent = event;
  var showEvent = "Event ID: " + event.event_id + "<br/>";
  showEvent += "Severity: ";
  showEvent += "<select id='severity'>";
  showEvent += "<option value='none'>None</option>"
  showEvent += "<option value='order'>Order</option>";
  showEvent += "<option value='warning'>Warning</option>";
  showEvent += "</select><br/>";
  showEvent += "<p class='formfield'>";
  showEvent += "<label for='instructions'>Instructions:</label>";
  showEvent += "<textarea rows='20' cols='30' id='instructions'></textarea>";
  showEvent += "</p>";

  showEvent += "<p>";
  showEvent += "<button type='button' id='PushNotification'>Push Notifications</button>";
  showEvent += "<button type='button' id='DeleteEvent'>Delete Event</button>";
  showEvent += "</p>";

  showEvent += "<p id='routeInfo'>";
  showEvent += "</p>";

  var popup = L.popup().setLatLng(e.latlng).setContent(showEvent).openOn(map);

  $("select[id=severity]").val(event.severity).change().change(function () {
    event.severity = $("select[id=severity]").val();
    updateEvent(event);
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

  $("#DeleteEvent").click(function() {
    currentEvents.forEach(function(element, index) {
      if (element.event_id == event.event_id) {
        currentEvents.splice(index, 1);
      }
    });

    event.routes.forEach(function(element, index) {
      element.removeFromDatabase();
      element.checkpoints.forEach(function(element) {
        map.removeLayer(layers[element.waypoint_id]);
      });
  
      map.removeLayer(layers[element.route_id]);
    });

    event.removeFromDatabase();
    map.removeLayer(layers[event.event_id]);
  });

  $("#PushNotification").click(function () {
    var push_notification = {};

    if (event.severity == "order") {
      push_notification = {
        event_id: event.event_id,
        notification_title: "Evacuation",
        notification_subtitle: "Evacutaion Order Issued!",
        notification_text: "An Evacuation has been ordered for your area.  Tap this notification for more information."
      };
    }
    else if (event.severity == "warning") {
      push_notification = {
        event_id: event.event_id,
        notification_title: "Evacuation",
        notification_subtitle: "Evacutaion Warning Issued!",
        notification_text: "An Evacuation might be ordered for your area.  Tap this notification for more information."
      };
    }
    else if (event.severity == "none") {
      push_notification = {
        event_id: event.event_id,
        notification_title: "Emergency",
        notification_subtitle: "Emergency Information",
        notification_text: "There is an emergency in your area.  Tap this notification for more information."
      };
    }
  
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