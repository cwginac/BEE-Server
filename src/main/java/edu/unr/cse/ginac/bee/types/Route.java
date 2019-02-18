package edu.unr.cse.ginac.bee.types;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Route {
    public String routeId;
    public String status;
    public Timestamp lastUpdate;

    public List<Coordinate> waypoints;

    public Route() {
        waypoints = new ArrayList<>();
    }
}
