function Route(event_id) {
    this.route_id = UuidUtility.create_UUID();;
    this.event_id = event_id;
    this.status = "";
    this.last_update;

    this.waypoints = []

    this.transmitData = function () {
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

        this.waypoints.forEach(element => {
            element.transmitData();
        });
    };
}