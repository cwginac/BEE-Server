function Report(jsonObject) {
    this.reportId = jsonObject["reportId"];
    this.type = jsonObject["type"];
    this.reporterId = jsonObject["reporterId"];
    this.evacId = jsonObject["evacId"];
    this.latitude = jsonObject["coordinate"]["latitude"];
    this.longitude = jsonObject["coordinate"]["longitude"];
    this.info = jsonObject["info"];

    this.removeFromDatabase = function () {
        var report = {
            report_id: this.reportId
        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in report) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(report[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Set up our request
        XHR.open('POST', 'http://bee-server.us-west-1.elasticbeanstalk.com/web-service/bee-server/e-m/remove-report', false);

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