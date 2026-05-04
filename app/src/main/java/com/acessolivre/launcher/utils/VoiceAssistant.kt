package com.acessolivre.launcher.utils

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.*

class VoiceAssistant(context: Context) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech = TextToSpeech(context, this)
    private var isReady = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.setLanguage(Locale("pt", "BR"))
            isReady = true
        }
    }

    fun speak(text: String) {
        if (isReady) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}
