package edu.unr.cse.ginac.bee.server;

import com.turo.pushy.apns.ApnsClient;
import com.turo.pushy.apns.ApnsClientBuilder;
import com.turo.pushy.apns.PushNotificationResponse;
import com.turo.pushy.apns.util.ApnsPayloadBuilder;
import com.turo.pushy.apns.util.SimpleApnsPushNotification;
import com.turo.pushy.apns.util.TokenUtil;
import com.turo.pushy.apns.util.concurrent.PushNotificationFuture;
import edu.unr.cse.ginac.bee.database.BeeDatabase;
import java.io.File;
import java.net.URL;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ExecutionException;


public class BEEPushNotification {

    private List<String> deviceIds;
    private String notificationTitle;
    private String notificationSubtitle;
    private String notificationText;
    private BeeDatabase database;
    private URL keystoreLocation = BEEPushNotification.class
            .getClassLoader().getResource("BEEPushCertificate.p12");

    public BEEPushNotification(List<String> deviceIds, String notificationTitle, String notificationSubtitle,
                               String notificationText, BeeDatabase database) {
        this.deviceIds = deviceIds;
        this.notificationTitle = notificationTitle;
        this.notificationSubtitle = notificationSubtitle;
        this.notificationText = notificationText;
        this.database = database;
    }

    public void push() {
        try {

            final File file = Paths.get(keystoreLocation.toURI()).toFile();

            final ApnsClient apnsClient = new ApnsClientBuilder()
                    .setApnsServer(ApnsClientBuilder.DEVELOPMENT_APNS_HOST)
                    .setClientCredentials(file, "ginac123")
                    .build();


            for (String deviceId: deviceIds) {
                Calendar cal = Calendar.getInstance();
                cal.setTimeZone(TimeZone.getTimeZone("PST"));
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
                System.out.println("Push Notification attempt at " + sdf.format(cal.getTime()));
                System.out.println(deviceId);

                final ApnsPayloadBuilder payloadBuilder = new ApnsPayloadBuilder();
                payloadBuilder.setAlertTitle(notificationTitle);
                payloadBuilder.setAlertSubtitle(notificationSubtitle);
                payloadBuilder.setAlertBody(notificationText);

                final String payload = payloadBuilder.buildWithDefaultMaximumLength();
                final String token = TokenUtil.sanitizeTokenString(deviceId);

                System.out.println(payload);

                final SimpleApnsPushNotification pushNotification = new SimpleApnsPushNotification(token,
                        "edu.unr.cse.ginac.BEE", payload);

                final PushNotificationFuture<SimpleApnsPushNotification, PushNotificationResponse<SimpleApnsPushNotification>>
                        sendNotificationFuture = apnsClient.sendNotification(pushNotification);

                try {
                    final PushNotificationResponse<SimpleApnsPushNotification> pushNotificationResponse =
                            sendNotificationFuture.get();

                    if (pushNotificationResponse.isAccepted()) {
                        System.out.println("Push notification accepted by APNs gateway.");
                        Map<String, Object> notification_sent = new HashMap<>();
                        notification_sent.put("user_id", deviceId);
                        notification_sent.put("notification_sent", true);
                        notification_sent.put("notification_sent_at", Timestamp.valueOf(LocalDateTime.now()));

                        String error = database.updateTable("evacuee", notification_sent);

                        if (error != null) {
                            System.out.println(error);
                        }
                    }
                    else {
                        System.out.println("Notification rejected by the APNs gateway: " +
                                pushNotificationResponse.getRejectionReason());

                        if (pushNotificationResponse.getTokenInvalidationTimestamp() != null) {
                            System.out.println("\t…and the token is invalid as of " +
                                    pushNotificationResponse.getTokenInvalidationTimestamp());
                        }
                    }
                } catch (final ExecutionException e) {
                    System.err.println("Failed to send push notification.");
                    e.printStackTrace();
                }
            }


        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}

