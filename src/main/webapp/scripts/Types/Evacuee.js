function Evacuee(jsonObject) {
    this.userId = jsonObject["userId"];
    this.safe = jsonObject["safe"];
    this.acknowledged = jsonObject["acknowledged"];
    this.evacId = jsonObject["evacId"];
    this.latitude = jsonObject["location"]["latitude"];
    this.longitude = jsonObject["location"]["longitude"];
    this.notification_sent = jsonObject["notificationSent"];
}