package edu.unr.cse.ginac.bee.types;

public class Coordinate {
    public double latitude;
    public double longitude;


    public Coordinate(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Coordinate() {
        this.latitude = 0.0;
        this.longitude = 0.0;
    }
}
