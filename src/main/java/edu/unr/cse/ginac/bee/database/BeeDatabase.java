package edu.unr.cse.ginac.bee.database;

import edu.unr.cse.ginac.bee.server.BeeServer;
import edu.unr.cse.ginac.bee.types.Coordinate;
import edu.unr.cse.ginac.bee.types.Event;
import edu.unr.cse.ginac.bee.types.Route;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class BeeDatabase {
    private static final Log LOG = LogFactory.getLog(BeeServer.class);
    private Connection dbConnection;

    public BeeDatabase() {
        dbConnection = getRemoteConnection();
        //dropAllTables();
        createTables();
    }

    public static Connection getRemoteConnection() {
        System.out.println("Getting remote connection");
        if (System.getProperty("RDS_HOSTNAME") != null) {
            try {
                // Load the JDBC driver
                try {
                    System.out.println("Loading driver...");
                    Class.forName("com.mysql.jdbc.Driver");
                    System.out.println("Driver loaded!");
                } catch (ClassNotFoundException e) {
                    throw new RuntimeException("Cannot find the driver in the classpath!", e);
                }
                String dbName = System.getProperty("RDS_DB_NAME");
                String userName = System.getProperty("RDS_USERNAME");
                String password = System.getProperty("RDS_PASSWORD");
                String hostname = System.getProperty("RDS_HOSTNAME");
                String port = System.getProperty("RDS_PORT");
                String jdbcUrl = "jdbc:mysql://" + hostname + ":" +
                        port + "/" + dbName + "?user=" + userName + "&password=" + password;
                System.out.println("Getting remote connection with connection string from environment variables.");
                Connection con = DriverManager.getConnection(jdbcUrl);
                System.out.println("Remote connection successful.");
                return con;
            }
            catch (SQLException e) { System.out.println(e.toString());}
        }
        return null;
    }

    private void setUpUsersTable() {
        try {

            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE users (" +
                    "id varchar(36) NOT NULL," +
                    "latitude float NOT NULL," +
                    "longitude float NOT NULL," +
                    "PRIMARY KEY (id)" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpEvacueeTable() {
        try {

            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE evacuee (" +
                    "user_id varchar(36) NOT NULL," +
                    "evac_id varchar(36) NOT NULL," +
                    "acknowledged boolean," +
                    "safe boolean," +
                    "latitude float," +
                    "longitude float," +
                    "PRIMARY KEY (user_id, evac_id)" +
                    ");";

            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpReportTable() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE reports (" +
                    "report_id varchar(36) NOT NULL," +
                    "reporter_id varchar(36) NOT NULL," +
                    "evac_id varchar(36) NOT NULL," +
                    "type varchar(100) NOT NULL," +
                    "latitude float NOT NULL," +
                    "longitude float NOT NULL," +
                    "PRIMARY KEY (report_id)" +
                    ");";

            System.out.println(createTable);

            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpEventsTable() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE events (" +
                    "event_id varchar(36) NOT NULL," +
                    "type varchar(36) NOT NULL," +
                    "severity varchar(10) NOT NULL," +
                    "instructions varchar(1000)," +
                    "last_update timestamp NOT NULL," +
                    "PRIMARY KEY (event_id)" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setupBoundCoordsTable() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE bound_coords (" +
                    "bound_coord_id varchar(36) NOT NULL," +
                    "latitude float NOT NULL," +
                    "longitude float NOT NULL," +
                    "event_id varchar(36) NOT NULL," +
                    "PRIMARY KEY (bound_coord_id)," +
                    "FOREIGN KEY (event_id)" +
                    " REFERENCES events(event_id)" +
                    " ON DELETE CASCADE" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpRoutes() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE routes (" +
                    "route_id varchar(36) NOT NULL," +
                    "status varchar(36) NOT NULL," +
                    "last_update timestamp NOT NULL," +
                    "event_id varchar(36) NOT NULL," +
                    "PRIMARY KEY (route_id)," +
                    "FOREIGN KEY (event_id)" +
                    " REFERENCES events(event_id)" +
                    " ON DELETE CASCADE" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpWaypoints() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE waypoints (" +
                    "waypoint_id varchar(36) NOT NULL," +
                    "latitude float NOT NULL," +
                    "longitude float NOT NULL," +
                    "route_id varchar(36) NOT NULL," +
                    "ordinal int NOT NULL," +
                    "PRIMARY KEY (waypoint_id)," +
                    "FOREIGN KEY (route_id)" +
                    " REFERENCES routes(route_id)" +
                    " ON DELETE CASCADE" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    private void setUpLocations() {
        try {
            Statement setupStatement = dbConnection.createStatement();
            String createTable = "CREATE TABLE locations (" +
                    "location_id varchar(36) NOT NULL," +
                    "name varchar(100) NOT NULL," +
                    "type varchar(36) NOT NULL," +
                    "latitude float NOT NULL," +
                    "longitude float NOT NULL," +
                    "info varchar(1000)," +
                    "PRIMARY KEY (location_id)" +
                    ");";
            System.out.println(createTable);
            setupStatement.addBatch(createTable);
            setupStatement.executeBatch();
            setupStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    public void dropAllTables() {
        System.out.println("Dropping Tables.");
        try {

            Statement dropStatement = dbConnection.createStatement();
            String dropUsers = "DROP TABLE users";
            String dropEvacuees = "DROP TABLE evacuee";
            String dropReports = "DROP TABLE reports";
            String dropEvents = "DROP TABLE events";
            String dropBoundCoords = "DROP TABLE bound_coords";
            String dropWaypoints = "DROP TABLE waypoints";
            String dropLocations = "DROP TABLE locations";
            String dropRoutes = "DROP TABLE routes";
            dropStatement.addBatch(dropUsers);
            dropStatement.addBatch(dropEvacuees);
            dropStatement.addBatch(dropReports);
            dropStatement.addBatch(dropBoundCoords);
            dropStatement.addBatch(dropWaypoints);
            dropStatement.addBatch(dropLocations);
            dropStatement.addBatch(dropRoutes);
            dropStatement.addBatch(dropEvents);

            dropStatement.executeBatch();
            dropStatement.close();
        }
        catch (SQLException ex) {
            // Handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        }
    }

    public void createTables() {
        System.out.println("Creating Tables.");
        setUpUsersTable();
        setUpEvacueeTable();
        setUpReportTable();
        setUpEventsTable();
        setupBoundCoordsTable();
        setUpRoutes();
        setUpWaypoints();
        setUpLocations();
    }

    public String updateTable(String tableName, Map<String, Object> parameters) {
        String keys = "(";
        String values = "(";
        String update = "";
        for (Map.Entry entry: parameters.entrySet()) {
            keys += entry.getKey() + ",";

            update += entry.getKey() + "=";

            if (entry.getValue().getClass() == String.class) {
                values += "\"" + entry.getValue() + "\",";
                update += "\"" + entry.getValue() + "\",";
            }
            else if (entry.getValue().getClass() == Timestamp.class) {
                values += "'" + entry.getValue() + "',";
                update += "'" + entry.getValue() + "',";
            }
            else {
                values += entry.getValue() + ",";
                update += entry.getValue() + ",";
            }
        }
        keys = keys.substring(0, keys.length() - 1);
        keys += ")";

        values = values.substring(0, values.length() - 1);
        values += ")";

        update = update.substring(0, update.length() - 1);

        String addString = "INSERT INTO " + tableName + " " + keys + " VALUES " + values + " ON DUPLICATE KEY UPDATE " + update;

        System.out.println(addString);

        try {
            Statement addStatement = dbConnection.createStatement();
            addStatement.addBatch(addString);
            addStatement.executeBatch();
            addStatement.close();

            return null;
        }
        catch (Exception ex) {
            System.out.println(ex.toString());
            return ex.getLocalizedMessage();
        }
    }

    public String deleteFromTable(String tableName, Map<String, Object> parameters) {
        String condition = "";

        for (Map.Entry entry: parameters.entrySet()) {
            condition += entry.getKey() + "=";

            if (entry.getValue().getClass() == String.class) {
                condition += "\"" + entry.getValue() + "\"";
            }
            else if (entry.getValue().getClass() == Timestamp.class) {
                condition += "'" + entry.getValue() + "'";
            }
            else {
                condition += entry.getValue();
            }
        }

        String deleteString = "DELETE FROM " + tableName + " WHERE " + condition;

        System.out.println(deleteString);

        try {
            Statement addStatement = dbConnection.createStatement();
            addStatement.addBatch(deleteString);
            addStatement.executeBatch();
            addStatement.close();

            return null;
        }
        catch (Exception ex) {
            System.out.println(ex.toString());
            return ex.getLocalizedMessage();
        }
    }

    public List<Event> getAllEvents() {
        System.out.println("Getting Events.");
        String events = "SELECT * FROM events";

        List<Event> eventList = new ArrayList<>();
        try {
            Statement selectStatement = dbConnection.createStatement();
            selectStatement.addBatch(events);

            ResultSet results = selectStatement.executeQuery(events);

            while (results.next()) {
                System.out.println("event!");
                Event newEvent = new Event();
                newEvent.eventId = results.getString("event_id");
                newEvent.type = results.getString("type");
                newEvent.severity = results.getString("severity");
                newEvent.instructions = results.getString("instructions");
                newEvent.lastUpdate = results.getTimestamp("last_update");
                newEvent.inUsersArea = true;

                String routes = "SELECT * FROM routes WHERE event_id = \"" + newEvent.eventId + "\"";
                Statement routeStatement = dbConnection.createStatement();
                ResultSet routeResults = routeStatement.executeQuery(routes);

                while (routeResults.next()) {
                    System.out.println("route!");
                    Route newRoute = new Route();
                    newRoute.routeId = routeResults.getString("route_id");
                    newRoute.status = routeResults.getString("status");
                    newRoute.lastUpdate = routeResults.getTimestamp("last_update");

                    String waypoints = "SELECT * FROM waypoints WHERE route_id = \"" + newRoute.routeId + "\" ORDER BY ordinal";
                    Statement waypointStatement = dbConnection.createStatement();
                    ResultSet waypointResults = waypointStatement.executeQuery(waypoints);

                    while (waypointResults.next()) {
                        System.out.println("waypoint " + waypointResults.getInt("ordinal"));
                        Coordinate newCoordinate = new Coordinate();
                        newCoordinate.latitude = waypointResults.getDouble("latitude");
                        newCoordinate.longitude = waypointResults.getDouble("longitude");

                        newRoute.waypoints.add(newCoordinate);
                    }

                    waypointStatement.close();
                    newEvent.routes.add(newRoute);
                }
                routeStatement.close();

                String boundaries = "SELECT * FROM bound_coords WHERE event_id = \"" + newEvent.eventId + "\"";
                Statement boundaryStatement = dbConnection.createStatement();
                ResultSet boundaryResult = boundaryStatement.executeQuery(boundaries);

                while (boundaryResult.next()) {
                    System.out.println("boundary!");
                    Coordinate newCoordinate = new Coordinate();
                    newCoordinate.latitude = boundaryResult.getDouble("latitude");
                    newCoordinate.longitude = boundaryResult.getDouble("longitude");

                    newEvent.boundaryPoints.add(newCoordinate);
                }

                boundaryStatement.close();

                eventList.add(newEvent);
            }

            selectStatement.close();

            return eventList;
        }
        catch (Exception ex) {
            System.out.println(ex.toString());
            ex.printStackTrace();
            return null;
        }

    }
}
