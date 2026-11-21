package com.komapc.gova

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

/**
 * Started by a tap on [AltitudeWidget]. While it is in the foreground the app
 * may use the location permission the user already granted ("while in use"),
 * so it takes one GPS fix, saves it to the widget and finishes. No background
 * location, no foreground service.
 *
 * It cannot be invisible: Android 12+ puts an input sink under every
 * translucent activity, so an invisible one would silently freeze the home
 * screen while the GPS warms up. Instead it is a small dialog ("Measuring
 * altitude…", Cancel) that appears only if the fix is not instant. A tap
 * outside, Back or Cancel stops the measurement and keeps the last value.
 */
class WidgetRefreshActivity : Activity() {
    private val handler = Handler(Looper.getMainLooper())
    private val cancel = CancellationTokenSource()
    private var done = false

    @SuppressLint("MissingPermission") // checked below
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.widget_measuring)
        findViewById<android.view.View>(R.id.widget_cancel).setOnClickListener { complete(null, cancelled = true) }
        setFinishOnTouchOutside(true)
        // No dim, and hidden at first: a recent fix usually arrives at once, and
        // a dialog flashing for a few milliseconds would only distract.
        window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
        window.attributes = window.attributes.apply { alpha = 0f }
        handler.postDelayed({
            if (!done) window.attributes = window.attributes.apply { alpha = 1f }
        }, SHOW_DIALOG_AFTER_MS)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            // No permission yet: open the app, which asks for it.
            startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            finishQuietly()
            return
        }

        Geoid.load(applicationContext)
        AltitudeWidget.updateAll(this, AltitudeWidget.Status.MEASURING)
        handler.postDelayed({ complete(null) }, TIMEOUT_MS)

        val request = CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .setMaxUpdateAgeMillis(MAX_FIX_AGE_MS)
            .setDurationMillis(TIMEOUT_MS)
            .build()
        LocationServices.getFusedLocationProviderClient(this)
            .getCurrentLocation(request, cancel.token)
            .addOnSuccessListener { complete(it) }
            .addOnFailureListener { complete(null) }
    }

    override fun onStop() {
        super.onStop()
        // Cancelled (tap outside, Back, Home) or the user opened something else:
        // we are no longer in the foreground, so stop rather than hold the GPS.
        complete(null, cancelled = true)
    }

    private fun complete(location: Location?, cancelled: Boolean = false) {
        if (done) return
        done = true
        handler.removeCallbacksAndMessages(null)
        cancel.cancel()
        val msl = location?.takeIf { it.hasAltitude() }?.let { mslAltitude(it) }
        when {
            msl != null -> AltitudeWidget.saveReading(this, msl)
            cancelled -> AltitudeWidget.updateAll(this, AltitudeWidget.Status.IDLE)
            else -> AltitudeWidget.updateAll(this, AltitudeWidget.Status.NO_FIX)
        }
        finishQuietly()
    }

    /** Same MSL rule as the app's headline: native MSL (API 34+) or EGM96 geoid. */
    private fun mslAltitude(location: Location): Double {
        if (Build.VERSION.SDK_INT >= 34 && location.hasMslAltitude()) return location.mslAltitudeMeters
        val n = Geoid.meanSeaLevel(location.latitude, location.longitude)
        return if (n != null) location.altitude - n else location.altitude
    }

    @Suppress("DEPRECATION")
    private fun finishQuietly() {
        finish()
        if (Build.VERSION.SDK_INT >= 34) {
            overrideActivityTransition(OVERRIDE_TRANSITION_CLOSE, 0, 0)
        } else {
            overridePendingTransition(0, 0)
        }
    }

    private companion object {
        const val SHOW_DIALOG_AFTER_MS = 600L
        const val TIMEOUT_MS = 30_000L
        const val MAX_FIX_AGE_MS = 15_000L
    }
}
