<%@ page import="java.sql.*" %>
<%
  // Read RDS connection information from the environment
  String dbName = System.getProperty("RDS_DB_NAME");
  String userName = System.getProperty("RDS_USERNAME");
  String password = System.getProperty("RDS_PASSWORD");
  String hostname = System.getProperty("RDS_HOSTNAME");
  String port = System.getProperty("RDS_PORT");
  String jdbcUrl = "jdbc:mysql://" + hostname + ":" +
    port + "/" + dbName + "?user=" + userName + "&password=" + password;

  // Load the JDBC driver
  try {
    System.out.println("Loading driver...");
    Class.forName("com.mysql.jdbc.Driver");
    System.out.println("Driver loaded!");
  } catch (ClassNotFoundException e) {
    throw new RuntimeException("Cannot find the driver in the classpath!", e);
  }

  Connection conn = null;
  Statement setupStatement = null;
  Statement readStatement = null;
  ResultSet resultSet = null;
  String results = "";
  int numresults = 0;
  String statement = null;
%>

<html>
<body>
<table border="2">
    <tr>
        <td>userId</td>
        <td>latitude</td>
        <td>longitude</td>
    </tr>
    <%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT id, latitude, longitude FROM users;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("id")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>
<br>
<table border="2">
    <tr>
        <td>userId</td>
        <td>evacId</td>
        <td>acknowledged</td>
        <td>safe</td>
        <td>latitude</td>
        <td>longitude</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT user_id, evac_id, acknowledged, safe, latitude, longitude FROM evacuee;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("user_id")%></td>
                <td><%=resultSet.getString("evac_id")%></td>
                <td><%=resultSet.getBoolean("acknowledged")%></td>
                <td><%=resultSet.getBoolean("safe")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>
<br>
<table border="2">
    <tr>
        <td>report_id</td>
        <td>reporter_id</td>
        <td>evac_id</td>
        <td>type</td>
        <td>latitude</td>
        <td>longitude</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT report_id, reporter_id, evac_id, type, latitude, longitude FROM evacuee;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("report_id")%></td>
                <td><%=resultSet.getString("reporter_id")%></td>
                <td><%=resultSet.getString("evac_id")%></td>
                <td><%=resultSet.getString("type")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>

<br>
<table border="2">
    <tr>
        <td>event_id</td>
        <td>type</td>
        <td>severity</td>
        <td>last_update</td>
        <td>instructions</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT event_id, type, severity, last_update, instructions FROM events;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("event_id")%></td>
                <td><%=resultSet.getString("type")%></td>
                <td><%=resultSet.getString("severity")%></td>
                <td><%=resultSet.getTime("last_update")%></td>
                <td><%=resultSet.getString("instructions")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>

<br>
<table border="2">
    <tr>
        <td>bound_coord_id</td>
        <td>latitude</td>
        <td>longitude</td>
        <td>event_id</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT bound_coord_id, latitude, longitude, event_id FROM bound_coords;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("bound_coord_id")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
                <td><%=resultSet.getString("event_id")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>


<br>
<table border="2">
    <tr>
        <td>route_id</td>
        <td>status</td>
        <td>last_update</td>
        <td>event_id</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT route_id, status, last_update, event_id FROM routes;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("route_id")%></td>
                <td><%=resultSet.getString("status")%></td>
                <td><%=resultSet.getTime("last_update")%></td>
                <td><%=resultSet.getString("event_id")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>

<br>
<table border="2">
    <tr>
        <td>waypoint_id</td>
        <td>latitude</td>
        <td>longitude</td>
        <td>route_id</td>
        <td>ordinal</td>
        <td>checkpoint?</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT waypoint_id, latitude, longitude, route_id, ordinal, checkpoint FROM waypoints order by checkpoint, ordinal;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("waypoint_id")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
                <td><%=resultSet.getString("route_id")%></td>
                <td><%=resultSet.getInt("ordinal")%></td>
                <td><%=resultSet.getBoolean("checkpoint")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>

<br>
<table border="2">
    <tr>
        <td>location_id</td>
        <td>name</td>
        <td>type</td>
        <td>latitude</td>
        <td>longitude</td>
        <td>info</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT location_id, name, type, latitude, longitude, info FROM locations;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("location_id")%></td>
                <td><%=resultSet.getString("name")%></td>
                <td><%=resultSet.getString("type")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
                <td><%=resultSet.getString("info")%></td>
            </tr>
        <%
        }
        %>

</table>
        <%

        resultSet.close();
        readStatement.close();
        conn.close();

    } catch (SQLException ex) {
        ex.printStackTrace();
    }
%>
</body>
</html>
