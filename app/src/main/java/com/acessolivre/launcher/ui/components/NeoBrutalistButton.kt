package com.acessolivre.launcher.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NeoBrutalistButton(
    text: String,
    backgroundColor: Color,
    onClick: () -> Unit,
    isHovered: Boolean = false,
    onPositioned: (RectData) -> Unit = {}
) {
    val scale by animateFloatAsState(if (isHovered) 1.05f else 1.0f)
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .scale(scale)
            .onGloballyPositioned { layoutCoordinates ->
                val pos = layoutCoordinates.positionInRoot()
                val size = layoutCoordinates.size
                onPositioned(RectData(pos.x, pos.y, size.width.toFloat(), size.height.toFloat()))
            }
            .offset(x = 6.dp, y = 6.dp)
            .background(Color.Black, RoundedCornerShape(20.dp))
            .then(
                Modifier
                    .offset(x = (-6).dp, y = (-6).dp)
                    .border(4.dp, Color.Black, RoundedCornerShape(20.dp))
                    .background(backgroundColor, RoundedCornerShape(20.dp))
                    .clickable { onClick() }
            )
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text.uppercase(),
            fontSize = 20.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color.Black
        )
    }
}

data class RectData(val x: Float, val y: Float, val width: Float, val height: Float) {
    fun contains(px: Float, py: Float): Boolean {
        return px >= x && px <= x + width && py >= y && py <= y + height
    }
}
