package com.acessolivre.launcher.viewmodel

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.ViewModel
import com.acessolivre.launcher.data.AppPreferences
import com.acessolivre.launcher.ui.components.RectData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.text.SimpleDateFormat
import java.util.*

data class AppInfo(
    val label: String,
    val packageName: String,
    val icon: android.graphics.drawable.Drawable? = null
)

class LauncherViewModel(context: Context) : ViewModel() {
    private val prefs = AppPreferences(context)
    
    // State: Apps
    private val _allApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val allApps: StateFlow<List<AppInfo>> = _allApps

    private val _favoriteApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val favoriteApps: StateFlow<List<AppInfo>> = _favoriteApps

    // State: Cursor and Dwell
    private val _cursorPos = MutableStateFlow(Pair(0.5f, 0.4f))
    val cursorPos: StateFlow<Pair<Float, Float>> = _cursorPos

    private val _dwellProgress = MutableStateFlow(0f)
    val dwellProgress: StateFlow<Float> = _dwellProgress

    // State: Security Lock
    private val _isEditLocked = MutableStateFlow(true)
    val isEditLocked: StateFlow<Boolean> = _isEditLocked

    // State: Status Bar
    private val _currentTime = MutableStateFlow("--:--")
    val currentTime: StateFlow<String> = _currentTime

    private val _batteryLevel = MutableStateFlow(0)
    val batteryLevel: StateFlow<Int> = _batteryLevel

    private val components = mutableMapOf<String, RectData>()
    private var hoveredId: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var dwellRunnable: Runnable? = null
    
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as android.media.AudioManager

    private val timeHandler = Handler(Looper.getMainLooper())
    private val timeRunnable = object : Runnable {
        override fun run() {
            val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
            _currentTime.value = sdf.format(Date())
            timeHandler.postDelayed(this, 10000)
        }
    }

    init {
        loadAllApps(context)
        startClock()
        monitorBattery(context)
    }

    private fun startClock() {
        timeHandler.post(timeRunnable)
    }

    private fun monitorBattery(context: Context) {
        val batteryStatus: Intent? = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        if (scale > 0) {
            _batteryLevel.value = (level * 100 / scale.toFloat()).toInt()
        }

        val batteryReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val newLevel = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
                val newScale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
                if (newScale > 0) {
                    _batteryLevel.value = (newLevel * 100 / newScale.toFloat()).toInt()
                }
            }
        }
        context.registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    }

    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening

    private val _isFlashlightOn = MutableStateFlow(false)
    val isFlashlightOn: StateFlow<Boolean> = _isFlashlightOn

    fun setListening(active: Boolean) {
        _isListening.value = active
    }

    fun toggleFlashlight(context: Context) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
            val cameraId = cameraManager.cameraIdList[0]
            _isFlashlightOn.value = !_isFlashlightOn.value
            cameraManager.setTorchMode(cameraId, _isFlashlightOn.value)
        } catch (e: Exception) {
            _isFlashlightOn.value = false
        }
    fun loadAllApps(context: Context) {
        val pm = context.packageManager
        val mainIntent = Intent(Intent.ACTION_MAIN, null).addCategory(Intent.CATEGORY_LAUNCHER)
        
        val resolvedInfos = pm.queryIntentActivities(mainIntent, 0)
        val fullList = resolvedInfos.map {
            AppInfo(it.loadLabel(pm).toString(), it.activityInfo.packageName, it.loadIcon(pm))
        }.sortedBy { it.label.lowercase() }
        
        _allApps.value = fullList
        val savedFavs = prefs.getFavorites()
        _favoriteApps.value = fullList.filter { savedFavs.contains(it.packageName) }
    }

    // State: App Selection Modal
    private val _showAppSelection = MutableStateFlow(false)
    val showAppSelection: StateFlow<Boolean> = _showAppSelection

    fun toggleAppSelection() {
        _showAppSelection.value = !_showAppSelection.value
    }

    fun toggleEditLocked() {
        _isEditLocked.value = !_isEditLocked.value
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

    fun registerComponent(id: String, rect: RectData) {
        components[id] = rect
    }

    fun updateCursor(deltaX: Float, deltaY: Float, screenWidth: Float, screenHeight: Float, onTrigger: (String) -> Unit) {
        val newX = (_cursorPos.value.first + deltaX).coerceIn(0f, 1f)
        val newY = (_cursorPos.value.second + deltaY).coerceIn(0f, 1f)
        _cursorPos.value = Pair(newX, newY)

        val px = newX * screenWidth
        val py = newY * screenHeight

        var foundId: String? = null
        for ((id, rect) in components) {
            if (rect.contains(px, py)) {
                foundId = id
                break
            }
        }

        if (foundId != hoveredId) {
            cancelDwell()
            hoveredId = foundId
            if (foundId != null) {
                startDwell(foundId, onTrigger)
            }
        }
    }

    private fun startDwell(id: String, onTrigger: (String) -> Unit) {
        _dwellProgress.value = 0f
        dwellRunnable = object : Runnable {
            override fun run() {
                if (_dwellProgress.value < 100f) {
                    _dwellProgress.value += 5f
                    handler.postDelayed(this, 75) // 1.5s total time for 20 steps
                } else {
                    onTrigger(id)
                    cancelDwell()
                }
            }
        }
        handler.post(dwellRunnable!!)
    }

    private fun cancelDwell() {
        dwellRunnable?.let { handler.removeCallbacks(it) }
        _dwellProgress.value = 0f
        hoveredId = null
    }

    fun launchApp(context: Context, packageName: String) {
        val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        intent?.let { 
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(it) 
        }
    }

    fun adjustVolume(up: Boolean) {
        val direction = if (up) android.media.AudioManager.ADJUST_RAISE else android.media.AudioManager.ADJUST_LOWER
        audioManager.adjustStreamVolume(android.media.AudioManager.STREAM_MUSIC, direction, android.media.AudioManager.FLAG_SHOW_UI)
    }

    fun expandNotifications(context: Context) {
        try {
            val statusBarService = context.getSystemService("statusbar")
            val statusBarManager = Class.forName("android.app.StatusBarManager")
            val method = statusBarManager.getMethod("expandNotificationsPanel")
            method.invoke(statusBarService)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
