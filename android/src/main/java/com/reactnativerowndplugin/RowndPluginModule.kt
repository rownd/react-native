package com.reactnativerowndplugin

import android.content.res.Configuration
import android.os.Handler
import android.os.Looper
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.rownd.android.Rownd
import io.rownd.android.RowndSignInHint
import io.rownd.android.RowndSignInOptions
import io.rownd.android.models.RowndCustomizations
import io.rownd.android.models.repos.GlobalState
import io.rownd.android.models.repos.UserRepo
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

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
          uiThreadHandler.post{
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

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun multiply(a: Int, b: Int, promise: Promise) {
         promise.resolve(a * b * 10)
    }

    @ReactMethod
    fun customizations(config: ReadableMap) {
      var appCustomizations = AppCustomizations(reactApplicationContext.currentActivity as FragmentActivity)

      val sheetBackgroundHexColor = config.getString("sheetBackgroundHexColor")
      if (sheetBackgroundHexColor != null) {
        appCustomizations.reactNativeSheetBackgroundColor = Color(android.graphics.Color.parseColor(sheetBackgroundHexColor))
      }

      val sheetCornerBorderRadius: String? = config.getString("sheetCornerBorderRadius")
      if (sheetCornerBorderRadius != null && sheetCornerBorderRadius.toDoubleOrNull() != null) {
        appCustomizations.sheetCornerBorderRadius = sheetCornerBorderRadius.toDouble().dp
      }

      val loadingAnimation: String? = config.getString("loadingAnimation")
      if (loadingAnimation != null) {
        // println("ANNIE $loadingAnimation")
      }



      Rownd.config.customizations = appCustomizations
    }

    @ReactMethod
    fun configure(config: ReadableMap) {
      val appKey = config.getString("appKey")
      if (appKey != null) {
        Rownd.configure(reactApplicationContext.currentActivity as FragmentActivity, appKey)
        isRowndJSInitialized = true
      }
    }

    @ReactMethod
    fun requestSignIn(signInConfig: ReadableMap) {
      fun requestSignInHub() {
        val postSignInRedirect = signInConfig.getString("postSignInRedirect")
        if (postSignInRedirect != null) {
          Rownd.requestSignIn(RowndSignInOptions(postSignInRedirect))
        } else {
          Rownd.requestSignIn()
        }
      }

      val method = signInConfig.getString("method")
      if (method != null) {
        when (method) {
          "google" -> Rownd.requestSignIn(RowndSignInHint.Google)
          "apple" -> println("ROWND: Apple sign in is not setup yet")
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
      UserRepo.set(data.toHashMap())
    }

    @ReactMethod
    fun setUserDataValue(key: String, array: ReadableMap) {
      val value = array.toHashMap().entries.find { it.key == "value" }?.value
      if (value != null) {
        UserRepo.set(key, value)
      } else {
        println("ROWND ANDROID PLUGIN: Missing content for value")
      }
    }

//    @ReactMethod
//    suspend fun getAccessToken(promise: Promise) {
//      try {
//        val accessToken = Rownd.getAccessToken()
//        promise.resolve(accessToken ?: "")
//      } catch (e: Throwable) {
//        promise.reject("GET_ACCESS_TOKEN_ERROR: ", e)
//      }
//    }
}
