package com.reactnativerowndplugin

import android.os.Handler
import android.os.Looper
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.rownd.android.*
import io.rownd.android.Rownd
import io.rownd.android.models.repos.GlobalState
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json


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
      Rownd.userRepo.set(data.toHashMap())
    }

    @ReactMethod
    fun setUserDataValue(key: String, array: ReadableMap) {
      val value = array.toHashMap().entries.find { it.key == "value" }?.value
      if (value != null) {
        Rownd.userRepo.set(key, value)
      } else {
        println("ROWND ANDROID PLUGIN: Missing content for value")
      }
    }

    @ReactMethod
    fun getAccessToken(promise: Promise) {
      coroutineScope = CoroutineScope(Dispatchers.IO).launch {
        try {
          promise.resolve(Rownd.getAccessToken() ?: "")
        } catch (e: Throwable) {
          promise.reject("ROWND PLUGIN MODULE ERROR: ")
        }
      }
    }
}
