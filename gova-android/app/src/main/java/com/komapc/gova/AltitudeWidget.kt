package com.komapc.gova

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.text.format.DateFormat
import android.text.format.DateUtils
import android.widget.RemoteViews
import java.util.Date
import kotlin.math.roundToInt

/**
 * Home-screen altitude widget.
 *
 * The app has no background location (see gova#27), so the widget cannot
 * measure on its own schedule. Instead:
 *  - the open app saves every reading here ([saveReading]);
 *  - a tap on the widget runs [WidgetRefreshActivity], an invisible activity
 *    that takes one fresh GPS fix while it is in the foreground;
 *  - the last reading and its time are persisted, so a reboot or app update
 *    redraws the last value instead of "—".
 */
class AltitudeWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        render(context, appWidgetManager, appWidgetIds, Status.IDLE)
    }

    enum class Status { IDLE, MEASURING, NO_FIX }

    companion object {
        private const val PREFS = "gova_prefs"           // shared with MainActivity
        private const val PREF_USE_FEET = "use_feet"     // same key as MainActivity
        private const val KEY_ALT_BITS = "widget_msl_bits"
        private const val KEY_TIME = "widget_time"

        /** Persists a fresh MSL reading (meters) and redraws all widgets. */
        fun saveReading(context: Context, mslMeters: Double, timeMs: Long = System.currentTimeMillis()) {
            if (mslMeters.isNaN()) return
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putLong(KEY_ALT_BITS, mslMeters.toRawBits())
                .putLong(KEY_TIME, timeMs)
                .apply()
            updateAll(context, Status.IDLE)
        }

        /** Redraws all widgets from the persisted reading with the given status line. */
        fun updateAll(context: Context, status: Status) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, AltitudeWidget::class.java))
            if (ids.isNotEmpty()) render(context, manager, ids, status)
        }

        private fun render(context: Context, manager: AppWidgetManager, ids: IntArray, status: Status) {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val time = prefs.getLong(KEY_TIME, 0L)
            val meters = if (time > 0) Double.fromBits(prefs.getLong(KEY_ALT_BITS, 0L)) else null
            val useFeet = prefs.getBoolean(PREF_USE_FEET, false)

            val altitudeText = meters?.let {
                if (useFeet) "${(it * 3.28084).roundToInt()} ft" else "${it.roundToInt()} m"
            } ?: "— m"
            val statusText = when {
                status == Status.MEASURING -> context.getString(R.string.widget_measuring)
                status == Status.NO_FIX -> context.getString(R.string.widget_no_fix)
                time == 0L -> context.getString(R.string.widget_tap)
                DateUtils.isToday(time) -> DateFormat.getTimeFormat(context).format(Date(time))
                else -> DateUtils.formatDateTime(context, time,
                    DateUtils.FORMAT_SHOW_DATE or DateUtils.FORMAT_NUMERIC_DATE or DateUtils.FORMAT_SHOW_TIME)
            }

            val tap = PendingIntent.getActivity(
                context, 0,
                Intent(context, WidgetRefreshActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            val views = RemoteViews(context.packageName, R.layout.altitude_widget).apply {
                setTextViewText(R.id.widget_altitude, altitudeText)
                setTextViewText(R.id.widget_status, statusText)
                setOnClickPendingIntent(R.id.widget_root, tap)
            }
            for (id in ids) manager.updateAppWidget(id, views)
        }
    }
}
