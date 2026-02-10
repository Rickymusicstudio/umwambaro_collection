import { Capacitor } from "@capacitor/core"
import { FirebaseMessaging } from "@capacitor-firebase/messaging"

export async function initPush() {
  // Only run on native mobile platforms
  if (!Capacitor.isNativePlatform()) {
    return
  }

  try {
    const perm = await FirebaseMessaging.requestPermissions()

    if (perm.receive === "granted") {
      const { token } = await FirebaseMessaging.getToken()
      console.log("FCM TOKEN:", token)
    } else {
      console.log("Push permission denied")
    }
  } catch (err) {
    console.error("Push init error:", err)
  }
}
