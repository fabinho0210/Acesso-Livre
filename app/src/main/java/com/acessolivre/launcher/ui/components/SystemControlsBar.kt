package com.acessolivre.launcher.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.acessolivre.launcher.R

@Composable
fun SystemControlsBar(
    onVolumeUp: () -> Unit,
    onVolumeDown: () -> Unit,
    onNotifications: () -> Unit,
    onMicClick: () -> Unit,
    isListening: Boolean = false,
    iconColor: Color = Color.Black,
    onBack: () -> Unit,
    onRecents: () -> Unit
) {
    val micTint = if (isListening) Color.Red else iconColor
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        // Volume Menos
        IconButton(onClick = onVolumeDown) {
            Icon(Icons.Default.VolumeDown, contentDescription = stringResource(R.string.volume_down), tint = iconColor)
        }
        
        // Comando de Voz
        IconButton(onClick = onMicClick) {
            Icon(Icons.Default.Mic, contentDescription = stringResource(R.string.voice_help), tint = micTint)
        }

        // Notificações
        IconButton(onClick = onNotifications) {
            Icon(Icons.Default.Notifications, contentDescription = stringResource(R.string.opening_notifications), tint = iconColor)
        }

        // Navegação Virtual (Simulada ou via Accessibility)
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = stringResource(R.string.voice_back), tint = iconColor)
        }

        IconButton(onClick = onRecents) {
            Icon(Icons.Default.History, contentDescription = stringResource(R.string.voice_recents), tint = iconColor)
        }

        // Volume Mais
        IconButton(onClick = onVolumeUp) {
            Icon(Icons.Default.VolumeUp, contentDescription = stringResource(R.string.volume_up), tint = iconColor)
        }
    }
}
