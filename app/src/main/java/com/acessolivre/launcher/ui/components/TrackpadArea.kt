package com.acessolivre.launcher.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TrackpadArea(
    onMove: (Float, Float) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
            .padding(16.dp)
            .background(Color.Black, RoundedCornerShape(32.dp))
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    // dx e dy normalizados para sensibilidade
                    onMove(dragAmount.x / 1200f, dragAmount.y / 2400f)
                }
            },
        contentAlignment = Alignment.Center
    ) {
        Text(
            "CONTROLE O CURSOR",
            color = Color.White.copy(alpha = 0.5f),
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
    }
}
