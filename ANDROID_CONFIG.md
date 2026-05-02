# Guia Definitivo: Lógica Android e Manifest (API 30+)

Para garantir compatibilidade total do Android 11 ao 16+, siga estas implementações no seu projeto nativo.

## 1. AndroidManifest.xml (Obrigatoriedade API 30+)
A tag `<queries>` é essencial para que o sistema permita que seu Launcher "veja" os outros apps instalados.

```xml
<manifest xmlns:android="http://schemas.microsoft.com/apk/res/android">
    
    <!-- Permissão Master para Launchers (Android 11+) -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <queries>
        <!-- Filtro para encontrar apenas apps que podem ser abertos (com ícone na grade) -->
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <application ...>
        <!-- Marcar como Home App -->
        <activity android:name=".MainActivity" ...>
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 2. Função abrirApp Robusta (Kotlin)
Utilize este código para evitar que o Launcher trave (crash) se o app alvo sumir ou for bloqueado por políticas de segurança.

```kotlin
import android.content.ActivityNotFoundException
import android.widget.Toast
import android.view.Gravity
import android.widget.TextView

fun abrirApp(packageName: String) {
    try {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            startActivity(intent)
        } else {
            // Caso o intent retorne nulo, o app pode ser de sistema sem UI
            exibirErroAcessivel("Aplicativo não possui tela inicial")
        }
    } catch (e: ActivityNotFoundException) {
        exibirErroAcessivel("Este aplicativo foi removido")
    } catch (e: SecurityException) {
        exibirErroAcessivel("Acesso bloqueado pelo sistema")
    } catch (e: Exception) {
        exibirErroAcessivel("Não foi possível abrir o app")
    }
}

/**
 * Exibe um Toast com texto grande para o idoso
 */
fun exibirErroAcessivel(mensagem: String) {
    val toast = Toast.makeText(this, mensagem, Toast.LENGTH_LONG)
    val view = toast.view
    val text = view?.findViewById<TextView>(android.R.id.message)
    text?.textSize = 24f // Texto grande e legível
    toast.setGravity(Gravity.CENTER, 0, 0)
    toast.show()
}
```

## 3. Listagem Eficiente e Filtro de Apps de Sistema
Para listar apenas o que interessa ao usuário (apps com ícone atual), use o `queryIntentActivities` em vez de listar todos os pacotes brutos.

```kotlin
fun listarAppsInstalados(): List<AppInfo> {
    val intent = Intent(Intent.ACTION_MAIN, null)
    intent.addCategory(Intent.CATEGORY_LAUNCHER)
    
    // Obtém apenas apps que estão na grade do sistema (Launcher Category)
    val resolveInfos = packageManager.queryIntentActivities(intent, 0)
    
    return resolveInfos.map { info ->
        AppInfo(
            nome = info.loadLabel(packageManager).toString(),
            pacote = info.activityInfo.packageName,
            icone = info.loadIcon(packageManager) // Carrega o ícone de forma otimizada
        )
    }
}
```

## 4. Por que QUERY_ALL_PACKAGES?
Como você está criando um **Launcher Acessível**, o Google permite o uso dessa permissão "ampla" (`QUERY_ALL_PACKAGES`). No entanto, ao subir para a Play Store, você precisará declarar no console que seu app é de categoria "Launcher/Accessibility" para que a permissão não seja rejeitada.
