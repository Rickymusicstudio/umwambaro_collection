package com.umwambaro.collections;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.content.Context;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationManager manager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

            NotificationChannel channel = new NotificationChannel(
                "default",
                "Default Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );

            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 500, 500});
            channel.setDescription("App notifications");

            manager.createNotificationChannel(channel);
        }
    }
}
