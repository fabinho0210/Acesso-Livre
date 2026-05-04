# Standard Android ProGuard rules
-dontwarn android.util.**
-keep class android.support.v7.widget.** { *; }
-keep interface android.support.v7.widget.** { *; }

# Jetpack Compose rules (usually handled by R8 automatically, but good to keep)
-keepclassmembers class * extends androidx.compose.ui.node.LayoutNode {
    *;
}

# Gson rules (Essential for your AppPreferences)
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.reflect.TypeToken
-keep class * extends com.google.gson.reflect.TypeToken
-keep public class * implements com.google.gson.TypeAdapterFactory
-keep public class * implements com.google.gson.JsonSerializer
-keep public class * implements com.google.gson.JsonDeserializer
-keep public class * implements com.google.gson.InstanceCreator

# Your Data Models (Keep them to avoid Gson serialization issues)
-keep class com.acessolivre.launcher.data.** { *; }
-keep class com.acessolivre.launcher.viewmodel.RectData { *; }
-keep class com.acessolivre.launcher.viewmodel.AppInfo { *; }
