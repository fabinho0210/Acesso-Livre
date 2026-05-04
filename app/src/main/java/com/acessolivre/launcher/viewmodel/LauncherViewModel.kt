package com.acessolivre.launcher.viewmodel

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.lifecycle.ViewModel
import com.acessolivre.launcher.data.AppPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class AppInfo(
    val label: String,
    val packageName: String,
    val icon: android.graphics.drawable.Drawable? = null
)

class LauncherViewModel(context: Context) : ViewModel() {
    private val prefs = AppPreferences(context)
    
    private val _allApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val allApps: StateFlow<List<AppInfo>> = _allApps

    private val _favoriteApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val favoriteApps: StateFlow<List<AppInfo>> = _favoriteApps

    init {
        loadAllApps(context)
    }

    fun loadAllApps(context: Context) {
        val pm = context.packageManager
        val mainIntent = Intent(Intent.ACTION_MAIN, null).addCategory(Intent.CATEGORY_LAUNCHER)
        
        val resolvedInfos = pm.queryIntentActivities(mainIntent, 0)
        val fullList = resolvedInfos.map {
            AppInfo(it.loadLabel(pm).toString(), it.activityInfo.packageName, it.loadIcon(pm))
        }.sortedBy { it.label }
        
        _allApps.value = fullList
        
        // Filter favorites from saved package names
        val savedFavs = prefs.getFavorites()
        _favoriteApps.value = fullList.filter { savedFavs.contains(it.packageName) }
    }

    fun toggleFavorite(context: Context, packageName: String) {
        val currentFavs = prefs.getFavorites().toMutableList()
        if (currentFavs.contains(packageName)) {
            currentFavs.remove(packageName)
        } else {
            currentFavs.add(packageName)
        }
        prefs.saveFavorites(currentFavs)
        loadAllApps(context)
    }
}
