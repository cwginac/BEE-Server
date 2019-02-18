function BeeEvent() {
    this.event_id = UuidUtility.create_UUID();
    this.type = "";
    this.severity = "";
    this.instructions = "";
    this.last_update;

    this.bound_coords = [];
    this.routes = [];

    this.transmitData = function () {
        var event = {
            event_id: this.event_id,
            severity: this.severity,
            type: this.type,
            instructions: this.instructions
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in event) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(event[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/add-event', false);

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

        this.bound_coords.forEach(element => {
            element.transmitData();
        });

        this.routes.forEach(element => {
            element.transmitData();
        });
    };
}