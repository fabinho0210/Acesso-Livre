package com.acessolivre.launcher.services

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class LauncherAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Monitorar eventos se necessário
    }

    override fun onInterrupt() {
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("AccessibilityService", "Serviço Conectado")
        instance = this
    }

    companion object {
        var instance: LauncherAccessibilityService? = null
            private set

        fun performGlobalBack(): Boolean {
            return instance?.performGlobalAction(GLOBAL_ACTION_BACK) ?: false
        }

        fun performGlobalHome(): Boolean {
            return instance?.performGlobalAction(GLOBAL_ACTION_HOME) ?: false
        }

        fun performGlobalRecents(): Boolean {
            return instance?.performGlobalAction(GLOBAL_ACTION_RECENTS) ?: false
        }
    }
}
