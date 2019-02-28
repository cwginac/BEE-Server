function Waypoint(route_id, order) {
    this.waypoint_id = UuidUtility.create_UUID();
    this.route_id = route_id;
    this.latitude;
    this.longitude;
    this.order = order;

    this.transmitData = function () {
        var waypoint = {
            waypoint_id: this.waypoint_id,
            route_id: this.route_id,
            latitude: this.latitude,
            longitude: this.longitude,
            order: this.order
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in waypoint) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(waypoint[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/add-waypoint');

        // Add the required HTTP header for form data POST requests
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Setup our listener to process completed requests
        XHR.onload = function () {
            if (XHR.status == 500) {
                // Something happened.
                console.log(XHR.responseText);
            }
        };

        // Finally, send our data.
        XHR.send(urlEncodedData);
    };

    this.removeFromDatabase = function () {
        var waypoint = {
            waypoint_id: this.waypoint_id,
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in waypoint) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(waypoint[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/remove-waypoint');

        // Add the required HTTP header for form data POST requests
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Setup our listener to process completed requests
        XHR.onload = function () {
            if (XHR.status == 500) {
                // Something happened.
                console.log(XHR.responseText);
            }
        };

        // Finally, send our data.
        XHR.send(urlEncodedData);
    };
}