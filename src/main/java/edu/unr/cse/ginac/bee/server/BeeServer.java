package edu.unr.cse.ginac.bee.server;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.unr.cse.ginac.bee.database.BeeDatabase;
import edu.unr.cse.ginac.bee.types.Evacuee;
import edu.unr.cse.ginac.bee.types.Event;
import edu.unr.cse.ginac.bee.types.Location;
import edu.unr.cse.ginac.bee.types.Report;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@Path("/bee-server")
public class BeeServer {

    private static final Log LOG = LogFactory.getLog(BeeServer.class);

    private final BeeDatabase database = new BeeDatabase();

    public BeeServer() {
    }

    @GET
    @Produces("text/json")
    @Path("/get-events")
    public Response getEvents(@QueryParam("id") String id) throws IOException {
        System.out.println("Getting Events for: " + id);

        List<Event> events = database.getAllEvents();
        System.out.println(events.size());
        ObjectMapper mapper = new ObjectMapper();
        String response = "{\"events\":";
        response += mapper.writeValueAsString(events) + "}";

        return Response.status(200).entity(response).build();
    }

    @GET
    @Produces("text/json")
    @Path("/get-locations")
    public Response getLocations(@QueryParam("id") String id) throws IOException {
        System.out.println("Getting locations for: " + id);

        List<Location> locations = database.getAllLocations();
        System.out.println(locations.size());
        ObjectMapper mapper = new ObjectMapper();
        String response = "{\"locations\":";
        response += mapper.writeValueAsString(locations) + "}";

        return Response.status(200).entity(response).build();
    }

    @GET
    @Produces("text/json")
    @Path("/drop-tables")
    public Response dropTables() {
        database.dropAllTables();
        return Response.status(200).entity("Dropped Tables").build();
    }

    @GET
    @Produces("text/json")
    @Path("/create-tables")
    public Response createTables() {
        database.createTables();
        return Response.status(200).entity("Created Tables").build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/acknowledge-evacuation")
    public Response acknowledgeEvacuation(@FormParam("userId") String userId,
                                          @FormParam("evacId") String evacId) {
        System.out.println("User: " + userId + " acknowledged evacuation: " + evacId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", userId);
        parameters.put("evac_id", evacId);
        parameters.put("acknowledged", true);
        parameters.put("acknowledged_at", Timestamp.valueOf(LocalDateTime.now()));


        String error = database.updateTable("evacuee", parameters);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/evacuation-update-location")
    public Response evacuationUpdateLocation(@FormParam("userId") String userId,
                                             @FormParam("name") String name,
                                             @FormParam("evacId") String evacId,
                                             @FormParam("latitude") double latitude,
                                             @FormParam("longitude") double longitude) {
        System.out.println("User: " + userId + " updated location for evacuation: " + evacId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", userId);
        parameters.put("name", name);
        parameters.put("evac_id", evacId);
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);
        parameters.put("location_updated_at", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("evacuee", parameters);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/evacuation-safe")
    public Response evacuationSafe(@FormParam("userId") String userId,
                                   @FormParam("evacId") String evacId) {
        System.out.println("User: " + userId + " marked safe for evacuation: " + evacId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", userId);
        parameters.put("evac_id", evacId);
        parameters.put("safe", true);
        parameters.put("marked_safe_at", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("evacuee", parameters);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/update-location")
    public Response updateLocation(@FormParam("id") String id,
                                   @FormParam("latitude") double latitude,
                                   @FormParam("longitude") double longitude) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", id);
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);
        parameters.put("location_updated_at", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("evacuee", parameters);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/report")
    public Response report(@FormParam("userId") String userId,
                           @FormParam("evacId") String evacId,
                           @FormParam("type") String type,
                           @FormParam("info") String info,
                           @FormParam("latitude") double latitude,
                           @FormParam("longitude") double longitude) {


        Map<String, Object> parameters = new HashMap<>();
        parameters.put("report_id", UUID.randomUUID().toString());
        parameters.put("reporter_id", userId);
        parameters.put("evac_id", evacId);
        parameters.put("type", type);
        parameters.put("info", info);
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);
        parameters.put("reported_at", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("reports", parameters);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/add-event")
    public Response addEvent(@FormParam("event_id") String eventId,
                             @FormParam("severity") String severity,
                             @FormParam("type") String type,
                             @FormParam("instructions") String instructions) {
        System.out.println("Adding Event: " + eventId);
        Map<String, Object> event = new HashMap<>();
        event.put("event_id", eventId);
        event.put("type", type);
        event.put("severity", severity);
        event.put("instructions", instructions);
        event.put("last_update", Timestamp.valueOf(LocalDateTime.now()));
        String error = database.updateTable("events", event);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/add-boundary")
    public Response addBoundary(@FormParam("event_id") String eventId,
                                @FormParam("bound_coord_id") String boundaryIds,
                                @FormParam("latitude") Double boundaryLatitude,
                                @FormParam("longitude") Double boundaryLongitude,
                                @FormParam("ordinal") Integer ordinal) {
        System.out.println("Adding Boundary: " + eventId);
        Map<String, Object> boundary_coordinate = new HashMap<>();
        boundary_coordinate.put("bound_coord_id", boundaryIds);
        boundary_coordinate.put("event_id", eventId);
        boundary_coordinate.put("latitude", boundaryLatitude);
        boundary_coordinate.put("longitude", boundaryLongitude);
        boundary_coordinate.put("ordinal", ordinal);
        String error = database.updateTable("bound_coords", boundary_coordinate);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/add-route")
    public Response addRoute(@FormParam("route_id") String routeId,
                             @FormParam("status") String status,
                             @FormParam("event_id") String eventId) {
        System.out.println("Adding Route: " + routeId);

        Map<String, Object> route = new HashMap<>();
        route.put("route_id", routeId);
        route.put("event_id", eventId);
        route.put("status", "open");
        route.put("last_update", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("routes", route);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/remove-route")
    public Response remove(@FormParam("route_id") String routeId) {
        System.out.println("Removing Route: " + routeId);

        Map<String, Object> route = new HashMap<>();
        route.put("route_id", routeId);

        String error = database.deleteFromTable("routes", route);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/add-waypoint")
    public Response addWaypoint(@FormParam("route_id") String routeId,
                                @FormParam("waypoint_id") String waypointId,
                                @FormParam("latitude") Double waypointLatitude,
                                @FormParam("longitude") Double waypointLongitude,
                                @FormParam("ordinal") Double ordinal,
                                @FormParam("checkpoint") Boolean checkpoint) {
        System.out.println("Adding Waypoint: " + waypointId);

        Map<String, Object> waypoint = new HashMap<>();
        waypoint.put("waypoint_id", waypointId);
        waypoint.put("route_id", routeId);
        waypoint.put("latitude", waypointLatitude);
        waypoint.put("longitude", waypointLongitude);
        waypoint.put("ordinal", ordinal);
        waypoint.put("checkpoint", checkpoint);

        String error = database.updateTable("waypoints", waypoint);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/remove-waypoint")
    public Response removeWaypoint(@FormParam("waypoint_id") String waypointId) {
        System.out.println("Removing Waypoint: " + waypointId);

        Map<String, Object> waypoint = new HashMap<>();
        waypoint.put("waypoint_id", waypointId);

        String error = database.deleteFromTable("waypoints", waypoint);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("e-m/add-location")
    public Response addLocation(@FormParam("location_id") String location_id,
                                @FormParam("name") String name,
                                @FormParam("type") String type,
                                @FormParam("info") String info,
                                @FormParam("latitude") double latitude,
                                @FormParam("longitude") double longitude) {

        System.out.println("Adding Location: " + location_id);
        System.out.println(location_id + ", " + name + ", " + type + ", " + info + ", " + latitude + ", " + longitude);

        Map<String, Object> location = new HashMap<>();
        location.put("location_id", location_id);
        location.put("name", name);
        location.put("type", type);
        location.put("info", info);
        location.put("latitude", latitude);
        location.put("longitude", longitude);

        String error = database.updateTable("locations", location);


        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @GET
    @Produces("text/json")
    @Path("/e-m/get-events")
    public Response getEMEvents() throws IOException {
        List<Event> events = database.getAllEvents();

        if (events == null) {
            return Response.status(500).build();
        }

        ObjectMapper mapper = new ObjectMapper();
        String response = mapper.writeValueAsString(events);

        return Response.status(200).entity(response).build();
    }

    @GET
    @Produces("text/json")
    @Path("/e-m/get-reports")
    public Response getEMReports() throws IOException {
        List<Report> reports = database.getAllReports();

        if (reports == null) {
            return Response.status(500).build();
        }

        ObjectMapper mapper = new ObjectMapper();
        String response = mapper.writeValueAsString(reports);

        return Response.status(200).entity(response).build();
    }

    @GET
    @Produces("text/json")
    @Path("/e-m/add-test-event")
    public Response addTestEvent() throws IOException {
        String event_id = "test1234";
        String route_id = "route1234";

        Map<String, Object> event = new HashMap<>();
        event.put("event_id", event_id);
        event.put("type", "evacuation");
        event.put("severity", "order");
        event.put("instructions", "this is a test");
        event.put("last_update", Timestamp.valueOf(LocalDateTime.now()));
        database.updateTable("events", event);

        Map<String, Object> boundary = new HashMap<>();
        boundary.put("bound_coord_id", "whatever");
        boundary.put("latitude", 12.34);
        boundary.put("longitude", 56.78);
        boundary.put("event_id", event_id);
        database.updateTable("bound_coords", boundary);

        Map<String, Object> route = new HashMap<>();
        route.put("event_id", event_id);
        route.put("route_id", route_id);
        route.put("status", "open");
        route.put("last_update", Timestamp.valueOf(LocalDateTime.now()));
        database.updateTable("routes", route);

        Map<String, Object> waypoint = new HashMap<>();
        waypoint.put("waypoint_id", "waypoint1");
        waypoint.put("route_id", route_id);
        waypoint.put("latitude", 12.34);
        waypoint.put("longitude", 56.78);
        database.updateTable("waypoints", waypoint);


        return Response.status(200).build();
    }

    @POST
    @Produces("text/json")
    @Path("/e-m/push-notifications-for-event")
    public Response pushNotificationsForEvent(@FormParam("event_id") String eventId,
                                @FormParam("notification_title") String notificationTitle,
                                @FormParam("notification_subtitle") String notificationSubtitle,
                                @FormParam("notification_text") String notificationText) {
        List<Evacuee> evacuees = database.getEvacueesByEvent(eventId);

        List<String> deviceIds = new ArrayList<>();

        for (Evacuee evacuee: evacuees) {
            deviceIds.add(evacuee.userId);
        }

        BEEPushNotification pushNotification = new BEEPushNotification(deviceIds, notificationTitle,
                notificationSubtitle, notificationText, database);
        pushNotification.push();

        return Response.status(200).build();
    }
}
