function BoundaryCoord(event_id, ordinal, bound_coord_id) {

  this.bound_coord_id = bound_coord_id == null ? UuidUtility.create_UUID() : bound_coord_id;
  this.event_id = event_id;
  this.latitude = 0.0;
  this.longitude = 0.0;
  this.ordinal = ordinal;

  this.transmitData = function() {
    var boundary = {
        event_id: this.event_id,
        bound_coord_id: this.bound_coord_id,
        latitude: this.latitude,
        longitude: this.longitude,
        ordinal: this.ordinal
      }
    
      var XHR = new XMLHttpRequest();
      var urlEncodedData = "";
      var urlEncodedDataPairs = [];
      var name;
    
      // Turn the data object into an array of URL-encoded key/value pairs.
      for(name in boundary) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(boundary[name]));
      }
    
      // Combine the pairs into a single string and replace all %-encoded spaces to 
      // the '+' character; matches the behaviour of browser form submissions.
      urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    
      // Set up our request
      XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/add-boundary');
    
      // Add the required HTTP header for form data POST requests
      XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
      // Finally, send our data.
      XHR.send(urlEncodedData);
    };
}