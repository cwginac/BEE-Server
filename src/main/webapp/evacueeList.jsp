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
        <td>name</td>
        <td>notification_sent</td>
        <td>notification_sent_at</td>
        <td>acknowledged</td>
        <td>acknowledged_at</td>
        <td>safe</td>
        <td>marked_safe_at</td>
        <td>latitude</td>
        <td>longitude</td>
        <td>location_updated_at</td>
    </tr>
<%
    try {
        conn = DriverManager.getConnection(jdbcUrl);

        readStatement = conn.createStatement();
        resultSet = readStatement.executeQuery("SELECT * FROM evacuee;");

        while (resultSet.next()) {
        %>
            <tr>
                <td><%=resultSet.getString("name")%></td>
                <td><%=resultSet.getBoolean("notification_sent")%></td>
                <td><%=resultSet.getTime("notification_sent_at")%></td>
                <td><%=resultSet.getBoolean("acknowledged")%></td>
                <td><%=resultSet.getTime("acknowledged_at")%></td>
                <td><%=resultSet.getBoolean("safe")%></td>
                <td><%=resultSet.getTime("marked_safe_at")%></td>
                <td><%=resultSet.getFloat("latitude")%></td>
                <td><%=resultSet.getFloat("longitude")%></td>
                <td><%=resultSet.getTime("location_updated_at")%></td>
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
