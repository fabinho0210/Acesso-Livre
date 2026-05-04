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

class MainActivity : ComponentActivity() {
    private val viewModel = LauncherViewModel()
    private lateinit var voice: VoiceAssistant

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        voice = VoiceAssistant(this)
        viewModel.loadApps(this)

        setContent {
            val apps by viewModel.apps.collectAsState()
            val cursorPos by viewModel.cursorPosition.collectAsState()
            val dwellProgress by viewModel.dwellProgress.collectAsState()

            BoxWithConstraints(modifier = Modifier.fillMaxSize().background(Color(0xFFFACC15))) {
                val screenWidth = constraints.maxWidth.toFloat()
                val screenHeight = constraints.maxHeight.toFloat()
                
                val cursorX = cursorPos.first * screenWidth
                val cursorY = cursorPos.second * screenHeight

                Column(modifier = Modifier.fillMaxSize()) {
                    // Header Neo-Brutalista
                    Box(modifier = Modifier.fillMaxWidth().padding(24.dp)) {
                        Text(
                            "ACESSO LIVRE",
                            style = MaterialTheme.typography.displaySmall.copy(
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Black
                            )
                        )
                    }

                    // Grid de Apps Reais
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier.weight(1f).padding(16.dp),
                        contentPadding = PaddingValues(bottom = 20.dp)
                    ) {
                        items(apps) { app ->
                            NeoBrutalistButton(
                                text = app.label,
                                backgroundColor = Color.White,
                                onClick = { 
                                    voice.speak("Abrindo " + app.label)
                                    viewModel.launchApp(this@MainActivity, app.packageName) 
                                },
                                onPositioned = { rect ->
                                    viewModel.registerComponent(app.packageName, rect)
                                }
                            )
                        }
                    }

                    // Trackpad de Controle (Fixo na Base)
                    TrackpadArea(
                        onMove = { dx, dy -> 
                            viewModel.updateCursor(dx, dy, screenWidth, screenHeight) { targetId ->
                                // Callback disparado pelo Dwell Click
                                apps.find { it.packageName == targetId }?.let {
                                    voice.speak("Abrindo " + it.label)
                                    viewModel.launchApp(this@MainActivity, it.packageName)
                                }
                            }
                        }
                    )
                }

                // Cursor Overlay
                CursorOverlay(
                    screenX = cursorX,
                    screenY = cursorY,
                    progress = dwellProgress
                )
            }
        }
    }

    override fun onDestroy() {
        voice.shutdown()
        super.onDestroy()
    }
}
