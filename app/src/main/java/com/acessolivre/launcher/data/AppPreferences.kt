package com.acessolivre.launcher.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class AppPreferences(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("launcher_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun saveFavorites(packageNames: List<String>) {
        prefs.edit().putString("favorite_apps", gson.toJson(packageNames)).apply()
    }

    fun getFavorites(): List<String> {
        val json = prefs.getString("favorite_apps", null) ?: return listOf("com.android.settings", "com.whatsapp", "com.google.android.apps.maps")
        val type = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(json, type)
    }

    fun saveTheme(mode: String) {
        prefs.edit().putString("theme_mode", mode).apply()
    }

    fun getTheme(): String {
        return prefs.getString("theme_mode", "CLASSIC") ?: "CLASSIC"
    }

    fun saveSosContact(number: String) {
        prefs.edit().putString("sos_contact", number).apply()
    }

    fun getSosContact(): String {
        return prefs.getString("sos_contact", "") ?: ""
    }

    fun isFirstRun(): Boolean {
        val first = prefs.getBoolean("first_run", true)
        if (first) prefs.edit().putBoolean("first_run", false).apply()
        return first
    }
}
