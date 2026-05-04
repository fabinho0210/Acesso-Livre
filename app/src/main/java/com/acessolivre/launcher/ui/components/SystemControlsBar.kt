package com.acessolivre.launcher.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun SystemControlsBar(
    onVolumeUp: () -> Unit,
    onVolumeDown: () -> Unit,
    onNotifications: () -> Unit,
    onMicClick: () -> Unit,
    iconColor: Color = Color.Black,
    onBack: () -> Unit,
    onRecents: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        // Volume Menos
        IconButton(onClick = onVolumeDown) {
            Icon(Icons.Default.VolumeDown, contentDescription = "Volume Baixo", tint = iconColor)
        }
        
        // Comando de Voz
        IconButton(onClick = onMicClick) {
            Icon(Icons.Default.Mic, contentDescription = "Falar comando", tint = iconColor)
        }

        // Notificações
        IconButton(onClick = onNotifications) {
            Icon(Icons.Default.Notifications, contentDescription = "Notificações", tint = iconColor)
        }

        // Navegação Virtual (Simulada ou via Accessibility)
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Voltar", tint = iconColor)
        }

        IconButton(onClick = onRecents) {
            Icon(Icons.Default.History, contentDescription = "Recentes", tint = iconColor)
        }

        // Volume Mais
        IconButton(onClick = onVolumeUp) {
            Icon(Icons.Default.VolumeUp, contentDescription = "Volume Alto", tint = iconColor)
        }
    }
}
