package com.reactnativerowndplugin
import android.app.Application
import androidx.fragment.app.FragmentActivity
import com.facebook.react.ReactActivity
import com.facebook.react.ReactFragment
import com.facebook.react.bridge.*
import com.facebook.react.shell.MainReactPackage
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import io.rownd.android.Rownd
import io.rownd.android.models.repos.GlobalState
import kotlinx.coroutines.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import android.os.Handler
import android.os.Looper

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
    fun configure(appKey: String) {
      Rownd.configure(reactApplicationContext.currentActivity as FragmentActivity, appKey)
      isRowndJSInitialized = true
    }

    @ReactMethod
    fun requestSignIn() {
      Rownd.requestSignIn()
    }

    @ReactMethod
    fun signOut() {
      Rownd.signOut()
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
