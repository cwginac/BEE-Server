function Route(event_id, route_id) {
    if (route_id == null) {
        this.route_id = UuidUtility.create_UUID();
    }
    else {
        this.route_id = route_id;
    }
    this.event_id = event_id;
    this.status = "";
    this.last_update;

    this.waypoints = []
    this.checkpoints = []

    this.transmitData = function () {
        this.removeFromDatabase()
        
        var route = {
            route_id: this.route_id,
            event_id: this.event_id,
            status: this.status
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in route) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(route[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/add-route', false);

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

        this.waypoints.forEach(function (element) {
            if (!local) {
                element.transmitData();
            }
        });

        this.checkpoints.forEach(function (element) {
            if (!local) {
                element.transmitData();
            }
        });
    };

    this.removeFromDatabase = function () {
        var route = {
            route_id: this.route_id
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in route) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(route[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/remove-route', false);

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