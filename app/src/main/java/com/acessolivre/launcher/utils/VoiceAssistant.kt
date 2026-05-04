package com.acessolivre.launcher.utils

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.*

class VoiceAssistant(
    private val context: Context,
    private val onStateChange: (Boolean) -> Unit,
    private val onCommand: (String) -> Unit
) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech = TextToSpeech(context, this)
    private var isReady = false
    private var speechRecognizer: SpeechRecognizer? = null

    init {
        setupSpeechRecognizer()
    }

    private fun setupSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d("VoiceAssistant", "Pronto para ouvir")
                    onStateChange(true)
                }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    onStateChange(false)
                }
                override fun onError(error: Int) {
                    Log.e("VoiceAssistant", "Erro reconhecimento: $error")
                    onStateChange(false)
                }
                override fun onResults(results: Bundle?) {
                    onStateChange(false)
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    matches?.firstOrNull()?.let { command ->
                        onCommand(command.lowercase())
                    }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    fun startListening() {
        val locale = Locale.getDefault()
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale.toLanguageTag())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            // Tenta forçar modo offline se disponível
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
    }

    fun speak(text: String, onDone: (() -> Unit)? = null) {
        if (!isReady) return
        
        val params = Bundle()
        val targetUtteranceId = UUID.randomUUID().toString()
        
        if (onDone != null) {
            tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(uid: String) {}
                override fun onDone(uid: String) {
                    if (uid == targetUtteranceId) onDone()
                }
                @Deprecated("Deprecated in Java")
                override fun onError(uid: String) {}
                override fun onError(uid: String, errorCode: Int) {
                    // No-op
                }
            })
        }

        tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, targetUtteranceId)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val locale = Locale.getDefault()
            tts.language = locale
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
