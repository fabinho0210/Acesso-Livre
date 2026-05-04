package com.acessolivre.launcher.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.Spring
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch

import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import com.acessolivre.launcher.utils.HapticService

@Composable
fun NeoBrutalistButton(
    text: String,
    backgroundColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    textColor: Color = Color.Black,
    borderColor: Color = Color.Black,
    splashColor: Color = Color(0xFFFACC15),
    haptic: HapticService? = null,
    icon: Any? = null,
    isHovered: Boolean = false,
    onPositioned: (RectData) -> Unit = {}
) {
    val scale by animateFloatAsState(if (isHovered) 1.1f else 1.0f, label = "buttonScale")
    
    // Animações de Feedback
    val scope = rememberCoroutineScope()
    val shakeOffset = remember { Animatable(0f) }
    val splashScale = remember { Animatable(0f) }
    val splashAlpha = remember { Animatable(0f) }

    Box(
        modifier = modifier
            .aspectRatio(1f)
            .padding(8.dp)
            .scale(scale)
            .offset(x = shakeOffset.value.dp) // Aplica o tremor
            .semantics { 
                role = Role.Button
                contentDescription = "Botão para abrir $text" 
            }
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
                    .border(4.dp, borderColor, RoundedCornerShape(20.dp))
                    .background(backgroundColor, RoundedCornerShape(20.dp))
                    .clip(RoundedCornerShape(20.dp))
                    .clickable { 
                        haptic?.click()
                        
                        // Gatilho das animações
                        scope.launch {
                            // Shake: Direita -> Esquerda -> Centro
                            shakeOffset.animateTo(8f, spring(dampingRatio = Spring.DampingRatioHighBouncy))
                            shakeOffset.animateTo(-8f, spring(dampingRatio = Spring.DampingRatioHighBouncy))
                            shakeOffset.animateTo(0f, spring(dampingRatio = Spring.DampingRatioMediumBouncy))
                        }
                        
                        scope.launch {
                            // Splash: Expande e some usando Amarelo Acesso Livre
                            splashScale.snapTo(0f)
                            splashAlpha.snapTo(0.7f)
                            launch { splashScale.animateTo(2.5f, tween(400)) }
                            launch { splashAlpha.animateTo(0f, tween(500)) }
                        }
                        
                        onClick() 
                    }
            ),
        contentAlignment = Alignment.Center
    ) {
        // Overlay de Splash
        Box(
            modifier = Modifier
                .size(80.dp)
                .scale(splashScale.value)
                .alpha(splashAlpha.value)
                .background(splashColor, CircleShape)
        )

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (icon != null) {
                Image(
                    painter = rememberAsyncImagePainter(icon),
                    contentDescription = null,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            Text(
                text = text.uppercase(),
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold,
                color = textColor,
                maxLines = 1
            )
        }
    }
}

data class RectData(val x: Float, val y: Float, val width: Float, val height: Float) {
    fun contains(px: Float, py: Float): Boolean {
        return px >= x && px <= x + width && py >= y && py <= y + height
    }
}
