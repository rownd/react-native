package com.reactnativerowndplugin

import android.content.res.Configuration
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.rownd.android.*
import io.rownd.android.Rownd
import io.rownd.android.RowndSignInHint
import io.rownd.android.RowndSignInOptions
import io.rownd.android.models.RowndCustomizations
import io.rownd.android.models.repos.GlobalState
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json

class AppCustomizations(app: FragmentActivity) : RowndCustomizations() {
  private var app: FragmentActivity
  open var reactNativeSheetBackgroundColor: Color? = null

  init {
    this.app = app
  }

  override val dynamicSheetBackgroundColor: Color
    get() {
      if (reactNativeSheetBackgroundColor != null) {
        return reactNativeSheetBackgroundColor as Color
      }
      val uiMode = app.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
      return if (uiMode == Configuration.UI_MODE_NIGHT_YES) {
        Color(0xff123456)
      } else {
        Color(0xfffedcba)
      }
    }

  override var sheetCornerBorderRadius: Dp = 25.dp
}


class RowndPluginModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var uiThreadHandler = Handler(Looper.getMainLooper())
    private var coroutineScope: Job? = null
    private var coroutineScope2: Job? = null
    private var isRowndJSInitialized = false

    override fun getName(): String {
      return "RowndPlugin"
    }

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
    }

    init {
      coroutineScope = CoroutineScope(Dispatchers.IO).launch {
        Rownd.state.collect {
          uiThreadHandler.post {
            val params = Arguments.createMap().apply {
              putString("state", Json.encodeToString(GlobalState.serializer(), it))
            }
            if (isRowndJSInitialized) {
              sendEvent(reactApplicationContext, "update_state", params)
            } else {
              println("ROWND JS: NOT INITIALIZED YET")
            }
          }
        }
      }
    }

    @ReactMethod
    fun customizations(config: ReadableMap) {
      val appCustomizations = AppCustomizations(reactApplicationContext.currentActivity as FragmentActivity)

      val sheetBackgroundHexColor: String? = config.getString("sheetBackgroundHexColor")
      if (sheetBackgroundHexColor != null) {
        appCustomizations.reactNativeSheetBackgroundColor = Color(android.graphics.Color.parseColor(sheetBackgroundHexColor))
      }

      val sheetCornerBorderRadius: String? = config.getString("sheetCornerBorderRadius")
      if (sheetCornerBorderRadius != null && sheetCornerBorderRadius.toDoubleOrNull() != null) {
        appCustomizations.sheetCornerBorderRadius = sheetCornerBorderRadius.toDouble().dp
      }

      val loadingAnimation: String? = config.getString("loadingAnimation")
      if (loadingAnimation != null) {
        appCustomizations.loadingAnimationJsonString = loadingAnimation
      }

      Rownd.config.customizations = appCustomizations
    }

    @ReactMethod
    fun configure(config: ReadableMap) {
      val appKey = config.getString("appKey")
      val apiUrl = config.getString("apiUrl")
      val baseUrl = config.getString("baseUrl")

      if (apiUrl != null) {
        Rownd.config.apiUrl = apiUrl
      }

      if (baseUrl != null) {
        Rownd.config.baseUrl = baseUrl
      }

      if (appKey != null) {
        Rownd.configure(reactApplicationContext.currentActivity as FragmentActivity, appKey)
        isRowndJSInitialized = true
      }
    }

    @ReactMethod
    fun requestSignIn(signInConfig: ReadableMap) {
      val rowndSignInOptions = RowndSignInOptions()

      val intentString = signInConfig.getString("intent")
      if (intentString != null) {
        when (intentString) {
          "sign_in" -> {
            rowndSignInOptions.intent = RowndSignInIntent.SignIn
          }
          "sign_up" -> {
            rowndSignInOptions.intent = RowndSignInIntent.SignUp
          }
          else -> {
            println("ROWND: Invalid intent type")
          }
        }
      }

      val postSignInRedirect = signInConfig.getString("postSignInRedirect")
      if (postSignInRedirect != null) {
        rowndSignInOptions.postSignInRedirect = postSignInRedirect
      }

      fun requestSignInHub() {
        Rownd.requestSignIn(signInOptions = rowndSignInOptions)
      }

      val method = signInConfig.getString("method")
      if (method != null) {
        when (method) {
          "google" -> Rownd.requestSignIn(with = RowndSignInHint.Google, signInOptions = rowndSignInOptions)
          "apple" -> {
            println("ROWND: Apple sign is setup through the Rownd hub")
            requestSignInHub()
          }
          "guest" -> Rownd.requestSignIn(with = RowndSignInHint.Guest, signInOptions = rowndSignInOptions)
          "passkey" -> Rownd.requestSignIn(with = RowndSignInHint.Passkey, signInOptions = rowndSignInOptions)
          else -> {
            requestSignInHub()
          }
        }
      } else {
        requestSignInHub()
      }
    }

    @ReactMethod
    fun signOut() {
      Rownd.signOut()
    }

    @ReactMethod
    fun manageAccount() {
      Rownd.manageAccount()
    }

    @ReactMethod
    fun setUserData(data: ReadableMap) {
      Rownd.user.set(data.toHashMap())
    }

    @ReactMethod
    fun setUserDataValue(key: String, array: ReadableMap) {
      val value = array.toHashMap().entries.find { it.key == "value" }?.value
      if (value != null) {
        Rownd.user.set(key, value)
      } else {
        println("ROWND ANDROID PLUGIN: Missing content for value")
      }
    }

    @ReactMethod
    fun getAccessToken(token: String?, promise: Promise) {
      coroutineScope = CoroutineScope(Dispatchers.IO).launch {
        try {
          if (token != null) {
            promise.resolve(Rownd.getAccessToken(token) ?: "")
          } else {
            promise.resolve(Rownd.getAccessToken() ?: "")
          }
        } catch (e: Throwable) {
          promise.reject("ROWND PLUGIN MODULE ERROR: ${e.message}")
        }
      }
    }

  @ReactMethod
  fun getFirebaseIdToken(promise: Promise) {
    CoroutineScope(Dispatchers.IO).async {
      try {
        val token: String? = Rownd.Firebase().getIdToken().await()
        promise.resolve(token ?: "")
      } catch (e: Throwable) {
        promise.reject("ROWND PLUGIN MODULE ERROR: ${e.message}")
      }
    }
  }
}
