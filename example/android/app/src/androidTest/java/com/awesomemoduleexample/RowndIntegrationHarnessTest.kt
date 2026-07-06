package com.awesomemoduleexample

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

@RunWith(AndroidJUnit4::class)
class RowndIntegrationHarnessTest {
  private val targetContext = InstrumentationRegistry.getInstrumentation().targetContext
  private val harnessUrl = InstrumentationRegistry.getArguments().getString("harnessUrl")
    ?: "http://10.0.2.2:3137"

  @Test
  fun harnessProvidesReactNativeConfiguration() {
    val config = JSONObject(get("/config"))

    assertEquals("test_app_key", config.getString("appKey"))
    assertEquals("app_test_rownd_android", config.getString("appId"))
    assertEquals(true, config.getString("androidUrl").isNotBlank())
    assertEquals(true, config.getString("hubUrl").isNotBlank())
  }

  @Test
  fun reactNativeExampleLaunchesWithHarnessConfiguration() {
    val config = JSONObject(get("/config"))
    val intent = Intent(targetContext, MainActivity::class.java).apply {
      putExtra("appKey", config.getString("appKey"))
      putExtra("apiDomain", config.getString("androidUrl"))
      putExtra("apiBasePath", "/auth")
      putExtra("hubUrlOverride", config.getString("hubUrl"))
    }

    ActivityScenario.launch<MainActivity>(intent).use {
      onView(withText("Sign In (Anonymous)")).check(matches(isDisplayed()))
    }
  }

  @Test
  fun rowndDeepLinkResolvesToMainActivity() {
    val intent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("rowndsupertokens://account/login?preAuthSessionId=test#link-code")
    ).apply {
      addCategory(Intent.CATEGORY_DEFAULT)
      addCategory(Intent.CATEGORY_BROWSABLE)
      setPackage(targetContext.packageName)
    }

    val resolved = targetContext.packageManager.resolveActivity(
      intent,
      PackageManager.MATCH_DEFAULT_ONLY
    )

    assertNotNull(resolved)
    assertEquals(MainActivity::class.java.name, resolved?.activityInfo?.name)
  }

  private fun get(path: String): String {
    val connection = URL("$harnessUrl$path").openConnection() as HttpURLConnection
    connection.requestMethod = "GET"
    connection.connectTimeout = 5000
    connection.readTimeout = 5000

    val status = connection.responseCode
    val stream = if (status in 200..299) connection.inputStream else connection.errorStream
    val body = BufferedReader(InputStreamReader(stream)).use { it.readText() }

    if (status !in 200..299) {
      throw AssertionError("Harness GET $path returned $status: $body")
    }

    return body
  }
}
