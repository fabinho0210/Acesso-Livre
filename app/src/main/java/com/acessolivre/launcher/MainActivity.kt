package com.acessolivre.launcher

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.acessolivre.launcher.ui.components.NeoBrutalistButton
import com.acessolivre.launcher.ui.components.CursorOverlay
import com.acessolivre.launcher.ui.components.TrackpadArea
import com.acessolivre.launcher.viewmodel.LauncherViewModel
import com.acessolivre.launcher.utils.VoiceAssistant
import androidx.compose.foundation.shape.RoundedCornerShape

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import com.acessolivre.launcher.ui.components.SystemControlsBar
import com.acessolivre.launcher.ui.components.RectData
import com.acessolivre.launcher.utils.HapticService
import com.acessolivre.launcher.utils.VoiceAssistant
import androidx.compose.foundation.border

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

import com.acessolivre.launcher.services.LauncherAccessibilityService
import androidx.compose.ui.res.stringResource
import com.acessolivre.launcher.R
import java.util.*

class MainActivity : ComponentActivity() {
    private lateinit var viewModel: LauncherViewModel
    private lateinit var voice: VoiceAssistant
    private lateinit var haptic: HapticService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel = LauncherViewModel(this)
        voice = VoiceAssistant(this) { command ->
            processVoiceCommand(command)
        }
        haptic = HapticService(this)
        
        checkPermissions()
        viewModel.loadAllApps(this)

        setContent {
            val isDark = isSystemInDarkTheme()
            val themeBg = if (isDark) Color(0xFF000000) else Color(0xFFFACC15)
            val cardBg = if (isDark) Color(0xFF1A1A1A) else Color.White
            val contentColor = if (isDark) Color.White else Color.Black
            val borderColor = if (isDark) Color.White else Color.Black
            val splashColor = if (isDark) Color(0xFFFACC15) else Color.Black.copy(alpha = 0.2f)

            val apps by viewModel.favoriteApps.collectAsState()
            val cursorPos by viewModel.cursorPos.collectAsState()
            val dwellProgress by viewModel.dwellProgress.collectAsState()
            val isLocked by viewModel.isEditLocked.collectAsState()
            val showSelection by viewModel.showAppSelection.collectAsState()
            val allApps by viewModel.allApps.collectAsState()
            val time by viewModel.currentTime.collectAsState()
            val battery by viewModel.batteryLevel.collectAsState()

            BoxWithConstraints(modifier = Modifier.fillMaxSize().background(themeBg)) {
                val screenWidth = constraints.maxWidth.toFloat()
                val screenHeight = constraints.maxHeight.toFloat()
                
                val cursorX = cursorPos.first * screenWidth
                val cursorY = cursorPos.second * screenHeight

                Column(modifier = Modifier.fillMaxSize()) {
                    // Status Bar Customizada
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.`Alignment`.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .border(3.dp, borderColor, RoundedCornerShape(12.dp))
                                .background(cardBg, RoundedCornerShape(12.dp))
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = time,
                                fontSize = 24.sp,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Black,
                                color = contentColor
                            )
                        }

                        Row(
                            verticalAlignment = androidx.compose.ui.`Alignment`.CenterVertically,
                            modifier = Modifier
                                .border(3.dp, borderColor, RoundedCornerShape(12.dp))
                                .background(cardBg, RoundedCornerShape(12.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                Icons.Default.BatteryChargingFull,
                                contentDescription = null,
                                tint = if (battery < 20) Color.Red else contentColor,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "$battery%",
                                fontSize = 18.sp,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                color = contentColor
                            )
                        }
                    }

                    // Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.`Alignment`.CenterVertically
                    ) {
                        Text(
                            "ACESSO LIVRE",
                            color = contentColor,
                            style = MaterialTheme.typography.displaySmall.copy(
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Black
                            )
                        )
                        
                        IconButton(
                            onClick = { 
                                haptic.click()
                                viewModel.toggleEditLocked() 
                            },
                            modifier = Modifier
                                .border(3.dp, borderColor, RoundedCornerShape(12.dp))
                                .background(cardBg, RoundedCornerShape(12.dp))
                        ) {
                            Icon(
                                if (isLocked) Icons.Default.Lock else Icons.Default.LockOpen,
                                contentDescription = null,
                                tint = contentColor
                            )
                        }
                    }

                    SystemControlsBar(
                        onVolumeUp = { 
                            haptic.click()
                            viewModel.adjustVolume(true) 
                        },
                        onVolumeDown = { 
                            haptic.click()
                            viewModel.adjustVolume(false) 
                        },
                        onNotifications = { 
                            haptic.success()
                            viewModel.expandNotifications(this@MainActivity) 
                        },
                        onMicClick = {
                            haptic.click()
                            voice.startListening()
                        },
                        onBack = { 
                            haptic.click()
                            LauncherAccessibilityService.performGlobalBack()
                        },
                        onRecents = { 
                            haptic.click()
                            LauncherAccessibilityService.performGlobalRecents()
                        },
                        iconColor = contentColor
                    )

                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier.weight(1f).padding(16.dp),
                        contentPadding = PaddingValues(bottom = 20.dp)
                    ) {
                        items(apps) { app ->
                            NeoBrutalistButton(
                                text = app.label,
                                icon = app.icon,
                                backgroundColor = cardBg,
                                textColor = contentColor,
                                borderColor = borderColor,
                                splashColor = splashColor,
                                haptic = haptic,
                                onClick = { 
                                    voice.speak(getString(R.string.opening_app, app.label))
                                    viewModel.launchApp(this@MainActivity, app.packageName) 
                                },
                                onPositioned = { rect ->
                                    viewModel.registerComponent(app.packageName, rect)
                                }
                            )
                        }

                        if (!isLocked) {
                            item {
                                NeoBrutalistButton(
                                    text = stringResource(R.string.btn_add),
                                    backgroundColor = Color(0xFF4ADE80),
                                    textColor = Color.Black,
                                    borderColor = borderColor,
                                    splashColor = Color.Black.copy(alpha = 0.3f),
                                    icon = Icons.Default.Add,
                                    haptic = haptic,
                                    onClick = { 
                                        haptic.success()
                                        viewModel.toggleAppSelection() 
                                    },
                                    onPositioned = { rect ->
                                        viewModel.registerComponent("btn_add_apps", rect)
                                    }
                                )
                            }
                        }
                    }

                    TrackpadArea(
                        onMove = { dx, dy -> 
                            viewModel.updateCursor(dx, dy, screenWidth, screenHeight) { targetId ->
                                haptic.success()
                                if (targetId == "btn_add_apps") {
                                    viewModel.toggleAppSelection()
                                } else if (targetId == "btn_close_selection") {
                                    viewModel.toggleAppSelection()
                                } else if (targetId.startsWith("select_")) {
                                    val pkg = targetId.removePrefix("select_")
                                    viewModel.toggleFavorite(this@MainActivity, pkg)
                                } else {
                                    apps.find { it.packageName == targetId }?.let {
                                        voice.speak(getString(R.string.opening_app, it.label))
                                        viewModel.launchApp(this@MainActivity, it.packageName)
                                    }
                                }
                            }
                        }
                    )
                }

                if (showSelection) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.8f))
                            .padding(32.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .border(4.dp, borderColor, RoundedCornerShape(24.dp))
                                .background(cardBg, RoundedCornerShape(24.dp))
                                .padding(16.dp)
                        ) {
                
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                            ) {
                                Text(
                                    stringResource(R.string.btn_select_apps),
                                    color = contentColor,
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = androidx.compose.ui.text.font.FontWeight.Black
                                    )
                                )
                                NeoBrutalistButton(
                                    text = stringResource(R.string.btn_close),
                                    backgroundColor = Color.Red,
                                    textColor = Color.White,
                                    borderColor = borderColor,
                                    splashColor = Color.White.copy(alpha = 0.4f),
                                    haptic = haptic,
                                    modifier = Modifier.width(120.dp),
                                    onClick = { viewModel.toggleAppSelection() },
                                    onPositioned = { rect -> viewModel.registerComponent("btn_close_selection", rect) }
                                )
                            }

                            LazyVerticalGrid(
                                columns = GridCells.Fixed(2),
                                modifier = Modifier.weight(1f)
                            ) {
                                items(allApps) { app ->
                                    val isFav = apps.any { it.packageName == app.packageName }
                                    NeoBrutalistButton(
                                        text = app.label,
                                        icon = app.icon,
                                        backgroundColor = if (isFav) Color(0xFF4ADE80) else cardBg,
                                        textColor = if (isFav) Color.Black else contentColor,
                                        borderColor = borderColor,
                                        splashColor = if (isFav) Color.Black.copy(alpha = 0.3f) else splashColor,
                                        haptic = haptic,
                                        onClick = { viewModel.toggleFavorite(this@MainActivity, app.packageName) },
                                        onPositioned = { rect -> 
                                            viewModel.registerComponent("select_${app.packageName}", rect) 
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                CursorOverlay(
                    screenX = cursorX,
                    screenY = cursorY,
                    progress = dwellProgress
                )
            }
        }
    }

    private fun checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), 101)
        }
    }

    private fun processVoiceCommand(command: String) {
        val allApps = viewModel.allApps.value
        val locale = Locale.getDefault().language
        
        // Comandos mapeados por idioma
        val cmdOpen = when(locale) {
            "pt" -> "abrir"
            "es" -> "abrir"
            else -> "open"
        }
        
        when {
            command.contains(cmdOpen) -> {
                val appName = command.replace(cmdOpen, "").trim().lowercase()
                val targetApp = allApps.find { it.label.lowercase().contains(appName) }
                if (targetApp != null) {
                    voice.speak(getString(R.string.opening_app, targetApp.label))
                    viewModel.launchApp(this, targetApp.packageName)
                } else {
                    voice.speak(getString(R.string.app_not_found, appName))
                }
            }
            command.contains("volume") && (command.contains("mais") || command.contains("up") || command.contains("más")) -> {
                viewModel.adjustVolume(true)
                voice.speak(getString(R.string.volume_up))
            }
            command.contains("volume") && (command.contains("menos") || command.contains("down") || command.contains("menos")) -> {
                viewModel.adjustVolume(false)
                voice.speak(getString(R.string.volume_down))
            }
            command.contains("notificações") || command.contains("notifications") || command.contains("notificaciones") -> {
                viewModel.expandNotifications(this)
                voice.speak(getString(R.string.opening_notifications))
            }
            command.contains("horas") || command.contains("time") || command.contains("tiempo") -> {
                voice.speak(getString(R.string.current_time, viewModel.currentTime.value))
            }
            command.contains("bateria") || command.contains("battery") -> {
                voice.speak(getString(R.string.battery_status, viewModel.batteryLevel.value))
            }
            command.contains("voltar") || command.contains("back") || command.contains("atrás") -> {
                LauncherAccessibilityService.performGlobalBack()
                voice.speak(getString(R.string.voice_back))
            }
            command.contains("início") || command.contains("home") || command.contains("inicio") -> {
                LauncherAccessibilityService.performGlobalHome()
                voice.speak(getString(R.string.voice_home))
            }
            command.contains("recentes") || command.contains("recent") || command.contains("recientes") -> {
                LauncherAccessibilityService.performGlobalRecents()
                voice.speak(getString(R.string.voice_recents))
            }
            else -> {
                voice.speak(getString(R.string.voice_unknown, command))
            }
        }
    }

    override fun onDestroy() {
        voice.shutdown()
        super.onDestroy()
    }
}
