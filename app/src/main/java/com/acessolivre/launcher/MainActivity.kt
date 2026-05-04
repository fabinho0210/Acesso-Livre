package com.acessolivre.launcher

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Bundle
import android.telephony.SmsManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.acessolivre.launcher.R
import com.acessolivre.launcher.services.LauncherAccessibilityService
import com.acessolivre.launcher.ui.components.*
import com.acessolivre.launcher.utils.HapticService
import com.acessolivre.launcher.utils.VoiceAssistant
import com.acessolivre.launcher.viewmodel.LauncherViewModel
import java.util.*

class MainActivity : ComponentActivity() {
    private lateinit var viewModel: LauncherViewModel
    private lateinit var voice: VoiceAssistant
    private lateinit var haptic: HapticService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel = LauncherViewModel(this)
        voice = VoiceAssistant(this, { active ->
            viewModel.setListening(active)
        }) { command ->
            processVoiceCommand(command)
        }
        haptic = HapticService(this)
        
        checkPermissions()
        viewModel.loadAllApps(this)

        if (viewModel.isFirstRun() && viewModel.tutorialEnabled.value) {
            voice.speak("Bem-vindo ao Acesso Livre. Para navegar, deslize o dedo na área amarela inferior. Quando o círculo vermelho estiver sobre um botão por algum tempo, ele será clicado automaticamente.")
        }

        setContent {
            val themeMode by viewModel.themeMode.collectAsState()
            val themeBg = viewModel.themeBg
            val cardBg = viewModel.themeCard
            val contentColor = viewModel.themeContent
            val borderColor = viewModel.themeContent // O contorno segue a cor do conteúdo
            val splashColor = contentColor.copy(alpha = 0.2f)

            val apps by viewModel.favoriteApps.collectAsState()
            val cursorPos by viewModel.cursorPos.collectAsState()
            val dwellProgress by viewModel.dwellProgress.collectAsState()
            val isLocked by viewModel.isEditLocked.collectAsState()
            val showSelection by viewModel.showAppSelection.collectAsState()
            val allApps by viewModel.allApps.collectAsState()
            val time by viewModel.currentTime.collectAsState()
            val battery by viewModel.batteryLevel.collectAsState()

            val isListening by viewModel.isListening.collectAsState()
        val isFlashlightOn by viewModel.isFlashlightOn.collectAsState()

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
                        isListening = isListening,
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
                        if (!isLocked) {
                            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(bottom = 16.dp)) {
                                    Text("Escolha o Tema:", color = contentColor, fontWeight = androidx.compose.ui.text.font.FontWeight.Black)
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                        horizontalArrangement = Arrangement.SpaceEvenly
                                    ) {
                                        ThemeButton("Amarelo", Color(0xFFFACC15), Color.Black) { viewModel.setTheme("CLASSIC") }
                                        ThemeButton("Branco", Color(0xFFFFFFFF), Color.Black) { viewModel.setTheme("CLOUD") }
                                        ThemeButton("Preto", Color(0xFF18181B), Color.White) { viewModel.setTheme("NIGHT") }
                                        ThemeButton("Azul", Color(0xFF1E40AF), Color.White) { viewModel.setTheme("OCEAN") }
                                    }
                                    
                                    val isTutorialOn by viewModel.tutorialEnabled.collectAsState()
                                    Button(
                                        onClick = { viewModel.setTutorialEnabled(!isTutorialOn) },
                                        modifier = Modifier.padding(top = 16.dp).border(4.dp, Color.Black, RoundedCornerShape(12.dp)),
                                        colors = ButtonDefaults.buttonColors(containerColor = if (isTutorialOn) Color.Green else Color.Gray)
                                    ) {
                                        Text(if (isTutorialOn) "TUTORIAL: LIGADO" else "TUTORIAL: DESLIGADO", fontWeight = androidx.compose.ui.text.font.FontWeight.Black)
                                    }
                                }
                            }
                        }

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
                        isListening = isListening,
                        onMove = { dx, dy -> 
                            viewModel.updateCursor(dx, dy, screenWidth, screenHeight) { targetId ->
                                haptic.hover()
                                if (targetId == "btn_add_apps") {
                                    viewModel.toggleAppSelection()
                                } else if (targetId == "btn_close_selection") {
                                    viewModel.toggleAppSelection()
                                } else if (targetId.startsWith("select_")) {
                                    val pkg = targetId.removePrefix("select_")
                                    viewModel.toggleFavorite(this@MainActivity, pkg)
                                } else if (targetId == "btn_sos") {
                                    sendSos()
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

                // Botão SOS Flutuante
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .padding(end = 16.dp, bottom = 300.dp)
                ) {
                    IconButton(
                        onClick = { sendSos() },
                        modifier = Modifier
                            .size(100.dp)
                            .border(4.dp, Color.Black, RoundedCornerShape(16.dp))
                            .background(Color.Red, RoundedCornerShape(16.dp))
                            .onGloballyPositioned { layoutCoordinates ->
                                val rect = layoutCoordinates.boundsInRoot()
                                viewModel.registerComponent("btn_sos", RectData(rect.left, rect.top, rect.width, rect.height))
                            }
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Warning, contentDescription = "SOS", tint = Color.White, modifier = Modifier.size(48.dp))
                            Text("SOS", color = Color.White, fontWeight = androidx.compose.ui.text.font.FontWeight.Black)
                        }
                    }
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
        val permissions = arrayOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.SEND_SMS
        )
        val toRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (toRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, toRequest.toTypedArray(), 100)
        }
    }

    private fun processVoiceCommand(command: String) {
        val allApps = viewModel.allApps.value
        val locale = Locale.getDefault().language
        val isLocked = viewModel.isEditLocked.value
        
        val cmdOpen = when(locale) {
            "pt" -> "abrir"
            "es" -> "abrir"
            else -> "open"
        }

        val cmdRemove = when(locale) {
            "pt" -> "remover"
            "es" -> "eliminar"
            else -> "remove"
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

            command.contains(cmdRemove) -> {
                val appName = command.replace(cmdRemove, "").trim().lowercase()
                val favs = viewModel.favoriteApps.value
                val targetApp = favs.find { it.label.lowercase().contains(appName) }
                if (targetApp != null) {
                    viewModel.toggleFavorite(this, targetApp.packageName)
                    voice.speak("Removido " + targetApp.label)
                } else {
                    voice.speak(getString(R.string.app_not_found, appName))
                }
            }

            command.contains("configura") || command.contains("ajuste") || command.contains("ajustes") -> {
                viewModel.toggleEditLocked()
                val status = if (viewModel.isEditLocked.value) "Travado" else "Destravado"
                voice.speak("Configurações: $status")
            }

            (command.contains("adicionar") || command.contains("escolher")) && command.contains("app") -> {
                if (isLocked) {
                    voice.speak("As configurações estão travadas. Destrave primeiro.")
                } else {
                    viewModel.toggleAppSelection()
                    voice.speak(getString(R.string.btn_select_apps))
                }
            }

            command.contains("fechar") || command.contains("encerrar") -> {
                if (viewModel.showAppSelection.value) {
                    viewModel.toggleAppSelection()
                    voice.speak(getString(R.string.btn_close))
                }
            }

            command.contains("volume") && (command.contains("mais") || command.contains("up") || command.contains("más")) -> {
                viewModel.adjustVolume(true)
                voice.speak(getString(R.string.volume_up))
            }
            command.contains("volume") && (command.contains("menos") || command.contains("down") || command.contains("bajo")) -> {
                viewModel.adjustVolume(false)
                voice.speak(getString(R.string.volume_down))
            }
            command.contains("notificações") || command.contains("notifications") || command.contains("notificaciones") -> {
                viewModel.expandNotifications(this)
                voice.speak(getString(R.string.opening_notifications))
            }
            command.contains("lanterna") || command.contains("flashlight") || command.contains("linterna") -> {
                viewModel.toggleFlashlight(this)
                val status = if (viewModel.isFlashlightOn.value) "Ligada" else "Desligada"
                voice.speak("Lanterna: $status")
            }
            command.contains("horas") || command.contains("time") || command.contains("tiempo") -> {
                voice.speak(getString(R.string.current_time, viewModel.currentTime.value))
            }
            command.contains("desativar") && command.contains("tutorial") -> {
                viewModel.setTutorialEnabled(false)
                voice.speak("Tutorial desativado.")
            }
            command.contains("ativar") && command.contains("tutorial") -> {
                viewModel.setTutorialEnabled(true)
                voice.speak("Tutorial ativado. Ele será reproduzido na próxima vez que o app abrir.")
            }
            command.contains("socorro") || command.contains("emergência") || command.contains("sos") -> {
                sendSos()
            }
            command.contains("configurar") && (command.contains("número") || command.contains("contato")) && command.contains("sos") -> {
                val number = command.replace(Regex("[^0-9]"), "")
                if (number.length >= 8) {
                    viewModel.updateSosContact(number)
                    voice.speak("Número de SOS configurado para $number")
                } else {
                    voice.speak("Número inválido. DigaConfigurar SOS seguido do número com DDD.")
                }
            }
            command.contains("bateria") || command.contains("battery") || command.contains("batería") -> {
                voice.speak(getString(R.string.battery_status, viewModel.batteryLevel.value))
            }
            command.contains("voltar") || command.contains("back") || command.contains("atrás") || command.contains("regresar") -> {
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
            command.contains("ajuda") || command.contains("help") || command.contains("ayuda") -> {
                voice.speak(getString(R.string.voice_help))
            }
            // Comandos de Tema
            command.contains("tema") || command.contains("color") -> {
                when {
                    command.contains("amarelo") || command.contains("clássico") || command.contains("classic") || command.contains("amarillo") -> {
                        viewModel.setTheme("CLASSIC")
                        voice.speak("Cores alteradas para Amarelo Clássico")
                    }
                    command.contains("branco") || command.contains("claro") || command.contains("white") || command.contains("blanco") -> {
                        viewModel.setTheme("CLOUD")
                        voice.speak("Cores alteradas para Branco Nuvem")
                    }
                    command.contains("preto") || command.contains("escuro") || command.contains("noite") || command.contains("black") || command.contains("noche") -> {
                        viewModel.setTheme("NIGHT")
                        voice.speak("Cores alteradas para Preto Noite")
                    }
                    command.contains("azul") || command.contains("mar") || command.contains("blue") -> {
                        viewModel.setTheme("OCEAN")
                        voice.speak("Cores alteradas para Azul Mar")
                    }
                    else -> voice.speak("Tema não reconhecido. Tente: Amarelo, Branco, Preto ou Azul.")
                }
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

    private fun sendSos() {
        val contact = viewModel.sosContact.value
        if (contact.isBlank()) {
            voice.speak("Nenhum contato de SOS configurado. Por favor, adicione um número nas configurações.")
            haptic.error()
            return
        }

        voice.speak("Iniciando modo de emergência. Enviando sua localização para o contato de confiança.")
        haptic.success()

        val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        try {
            val location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            val msg = if (location != null) {
                "SOCORRO! Preciso de ajuda. Minha localização: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}"
            } else {
                "SOCORRO! Preciso de ajuda. (Localização não disponível)"
            }
            
            val smsManager = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                this.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            smsManager.sendTextMessage(contact, null, msg, null, null)
            voice.speak("Mensagem de emergência enviada.")
        } catch (e: SecurityException) {
            voice.speak("Erro de permissão ao acessar localização.")
            haptic.error()
        } catch (e: Exception) {
            voice.speak("Ocorreu um erro ao enviar o SOS.")
            haptic.error()
        }
    }
}

@androidx.compose.runtime.Composable
fun ThemeButton(label: String, color: Color, textColor: Color, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = color),
        border = androidx.compose.foundation.BorderStroke(3.dp, Color.Black),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.padding(2.dp)
    ) {
        Text(label, color = textColor, fontWeight = androidx.compose.ui.text.font.FontWeight.Black, fontSize = 12.sp)
    }
}
