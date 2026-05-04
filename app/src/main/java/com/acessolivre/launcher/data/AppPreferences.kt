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
        val json = prefs.getString("favorite_apps", null) ?: return listOf("com.android.settings")
        val type = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(json, type)
    }
}
