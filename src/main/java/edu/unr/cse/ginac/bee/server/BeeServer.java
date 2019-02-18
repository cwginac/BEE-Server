package edu.unr.cse.ginac.bee.server;

import com.amazonaws.util.IOUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.unr.cse.ginac.bee.database.BeeDatabase;
import edu.unr.cse.ginac.bee.types.Event;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    BeeDatabase database = new BeeDatabase();

    public BeeServer() {
    }

    @GET
    @Produces("text/json")
    @Path("/get-events")
    public Response getEvents(@QueryParam("id") String id) throws IOException {
        System.out.println("Getting Events for: " + id);
//        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
//        InputStream is = classloader.getResourceAsStream("response.json");
//        return Response.status(200).entity(IOUtils.toString(is)).build();

        List<Event> events = database.getAllEvents();
        ObjectMapper mapper = new ObjectMapper();
        String response = mapper.writeValueAsString(events);

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
                                             @FormParam("evacId") String evacId,
                                             @FormParam("latitude") double latitude,
                                             @FormParam("longitude") double longitude) {
        System.out.println("User: " + userId + " updated location for evacuation: " + evacId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", userId);
        parameters.put("evac_id", evacId);
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);

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
                                             @FormParam("evacId") String evacId,
                                             @FormParam("safe") boolean safe) {
        System.out.println("User: " + userId + " marked safe for evacuation: " + evacId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("user_id", userId);
        parameters.put("evac_id", evacId);
        parameters.put("safe", safe);

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
        parameters.put("id", id);
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);

        String error = database.updateTable("user", parameters);

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
                            @FormParam("latitude") double latitude,
                            @FormParam("longitude") double longitude) {


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
                                  @FormParam("longitude") Double boundaryLongitude) {
        System.out.println("Adding Boundary: " + eventId);
        Map<String, Object> boundary_coordinate = new HashMap<>();
        boundary_coordinate.put("bound_coord_id", boundaryIds);
        boundary_coordinate.put("event_id", eventId);
        boundary_coordinate.put("latitude", boundaryLatitude);
        boundary_coordinate.put("longitude", boundaryLongitude);
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
        route.put("status", status);
        route.put("last_update", Timestamp.valueOf(LocalDateTime.now()));

        String error = database.updateTable("routes", route);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("/e-m/add-waypoint")
    public Response addWaypoints(@FormParam("route_id") String routeId,
                                 @FormParam("waypoint_id") String waypointId,
                                 @FormParam("latitude") Double waypointLatitude,
                                 @FormParam("longitude") Double waypointLongitude,
                                 @FormParam("order") Double order) {
        System.out.println("Adding Waypoint: " + waypointId);

        Map<String, Object> waypoint = new HashMap<>();
        waypoint.put("waypoint_id", waypointId);
        waypoint.put("route_id", routeId);
        waypoint.put("latitude", waypointLatitude);
        waypoint.put("longitude", waypointLongitude);
        waypoint.put("order", order);

        String error = database.updateTable("waypoints", waypoint);

        if (error != null) {
            return Response.status(500).entity(error).build();
        }
        return Response.status(200).build();
    }

    @POST
    @Consumes("application/x-www-form-urlencoded")
    @Path("e-m/add-location")
    public Response addLocation(@FormParam("location_id") String eventId,
                                @FormParam("name") String name,
                                @FormParam("type") String type,
                                @FormParam("info") String info,
                                @FormParam("latitude") double latitude,
                                @FormParam("longitude") double longitude) {

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
}
