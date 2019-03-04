function BEELocation() {
    this.location_id = UuidUtility.create_UUID();
    this.type = "other";
    this.name = "";
    this.latitude;
    this.longitude;
    this.info = "";

    this.transmitData = function () {
        var location = {
            location_id: this.location_id,
            type: this.type,
            name: this.name,
            info: this.info,
            latitude: this.latitude,
            longitude: this.longitude
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in location) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(location[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/add-location', false);

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