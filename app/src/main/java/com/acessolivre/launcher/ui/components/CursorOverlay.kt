package com.acessolivre.launcher.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun CursorOverlay(
    screenX: Float,
    screenY: Float,
    progress: Float
) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val radius = 24.dp.toPx()
        
        drawCircle(
            color = Color.Black.copy(alpha = 0.3f),
            radius = radius + 4f,
            center = Offset(screenX + 4f, screenY + 4f)
        )

        drawCircle(
            color = Color.White,
            radius = radius,
            center = Offset(screenX, screenY),
            style = Stroke(width = 4.dp.toPx())
        )

        if (progress > 0) {
            drawArc(
                color = Color(0xFFFACC15),
                startAngle = -90f,
                sweepAngle = (progress / 100f) * 360f,
                useCenter = false,
                topLeft = Offset(screenX - radius, screenY - radius),
                size = androidx.compose.ui.geometry.Size(radius * 2, radius * 2),
                style = Stroke(width = 6.dp.toPx())
            )
        }
    }
}
