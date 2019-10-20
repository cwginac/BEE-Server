package edu.unr.cse.ginac.bee.types;

import java.sql.Timestamp;

public class Evacuee {
    public String userId;
    public String notification_token;
    public Coordinate location;
    public boolean safe;
    public Timestamp markedSafeAt;
    public boolean acknowledged;
    public Timestamp acknowledgedAt;
    public String evacId;
    public boolean notificationSent;
    public Timestamp notificationSentAt;
    public Timestamp locationUpdatedLastAt;

    public Evacuee() { }
}
