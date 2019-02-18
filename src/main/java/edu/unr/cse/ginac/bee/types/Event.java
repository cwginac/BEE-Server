package edu.unr.cse.ginac.bee.types;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Event {
    public String eventId;
    public String type;
    public String severity;
    public String instructions;
    public Timestamp lastUpdate;

    public List<Route> routes;
    public List<Coordinate> boundaryPoints;

    public Event() {
        routes = new ArrayList<>();
        boundaryPoints = new ArrayList<>();
    }
}
