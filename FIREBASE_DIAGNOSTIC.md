# 🛠 Diagnóstico de Integração Firebase (Android)

Este guia ajuda a validar se o Firebase foi configurado corretamente no seu projeto Android/Launcher.

---

## 1. Verificação de Configuração (Gradle)

Para que o Firebase funcione, os plugins e SDKs devem estar sincronizados.

### Build.gradle (Projeto - Root)
Certifique-se de que o plugin do Google Services está declarado:
```kotlin
// Usando Kotlin DSL
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("com.android.library") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
    // LINHA OBRIGATÓRIA:
    id("com.google.gms.google-services") version "4.4.0" apply false
}
```

### Build.gradle (App - Módulo)
Aplique o plugin e adicione as dependências (usando o Firebase BoM para gerenciar versões):
```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    // LINHA OBRIGATÓRIA:
    id("com.google.gms.google-services")
}

dependencies {
    // Importa o BoM (Bill of Materials)
    implementation(platform("com.google.firebase:firebase-bom:32.7.1"))

    // Adicione as bibliotecas que deseja usar:
    implementation("com.google.firebase:firebase-analytics-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-auth-ktx")
}
```

---

## 2. Código de Teste de Conexão (Kotlin)

Adicione este código no final do `onCreate` da sua `MainActivity.kt` para verificar se o app consegue "falar" com o Firebase.

```kotlin
import android.util.Log
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.firestore.FirebaseFirestore

fun testFirebaseConnection(context: android.content.Context) {
    // 1. Teste Analytics
    val analytics = FirebaseAnalytics.getInstance(context)
    val bundle = android.os.Bundle()
    bundle.putString("test_event", "launcher_diagnostic")
    analytics.logEvent("diagnostic_check", bundle)
    Log.d("FirebaseTest", "Evento de Analytics enviado.")

    // 2. Teste Firestore (Escrita Temporária)
    val db = FirebaseFirestore.getInstance()
    val testData = hashMapOf(
        "timestamp" to System.currentTimeMillis(),
        "status" to "Conectado",
        "device" to android.os.Build.MODEL
    )

    db.collection("diagnostico").document("teste_conexao")
        .set(testData)
        .addOnSuccessListener {
            Log.i("FirebaseTest", "🔥 SUCESSO: Firebase Firestore conectado e gravando!")
        }
        .addOnFailureListener { e ->
            Log.e("FirebaseTest", "❌ ERRO: Falha ao gravar no Firestore: ${e.message}")
        }
}
```

---

## 3. Monitoramento de Logs (Logcat)

No Android Studio, abra a aba **Logcat** e use os seguintes filtros na barra de busca:

*   **Para ver a inicialização**: `FirebaseInitProvider`
*   **Para ver o Analytics**: `AppMeasurement` ou `FA-SVG` (Firebase Analytics)
*   **Para ver erros gerais**: `FirebaseApp`
*   **Para o nosso teste customizado**: `FirebaseTest`

**Dica**: Se você ver a mensagem `FirebaseApp initialization successful`, o núcleo do Firebase está rodando.

---

## 4. Checklist de Erros Comuns

Se os logs mostrarem erro ou nada for gravado, verifique:

1.  **google-services.json**: Verifique se o `package_name` dentro do JSON é **exatamente igual** ao `applicationId` no seu `build.gradle` (app).
2.  **SHA-1 / SHA-256**: Se estiver usando **Firebase Auth (Google Login)** ou **App Check**, você DEVE cadastrar a chave SHA-1 do seu computador (debug) e da Play Store (release) no console do Firebase.
3.  **Permisões**: Garanta que o arquivo `AndroidManifest.xml` tenha a permissão de internet:
    `<uses-permission android:name="android.permission.INTERNET" />`
4.  **Firestore Rules**: No console do Firebase, verifique se as regras do banco de dados permitem escrita. Para testes, use:
    `allow read, write: if request.auth != null;` (exige usuário logado).
5.  **Data/Hora do Dispositivo**: O Firebase falha violentamente se o relógio do celular estiver errado. Verifique se está no modo automático.
