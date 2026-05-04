package com.acessolivre.launcher.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip

@Composable
fun TrackpadArea(
    onMove: (Float, Float) -> Unit,
    isListening: Boolean = false,
    modifier: Modifier = Modifier
) {
    val trackpadAlpha by animateFloatAsState(if (isListening) 1.0f else 0.7f, label = "trackpadAlpha")

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
            .padding(16.dp)
            .clip(RoundedCornerShape(32.dp))
            .background(Color.Black.copy(alpha = 0.9f))
            .alpha(trackpadAlpha)
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    // Sensibilidade dinâmica baseada em DPI ou constante para facilitar
                    onMove(dragAmount.x / 1400f, dragAmount.y / 2800f)
                }
            },
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (isListening) {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .background(Color(0xFFFACC15).copy(alpha = 0.2f), RoundedCornerShape(30.dp))
                ) {
                    Text(
                        "OUVINDO...",
                        color = Color(0xFFFACC15),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
            
            Text(
                "ÁREA DE CONTROLE",
                color = Color.White.copy(alpha = 0.6f),
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Text(
                "DESLIZE PARA MOVER O CURSOR",
                color = Color.White.copy(alpha = 0.4f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
