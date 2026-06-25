package com.komapc.gova

import android.content.Context
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.floor

/**
 * EGM96 geoid undulation N (geoid height above the WGS84 ellipsoid), used to
 * convert GPS ellipsoidal altitude to mean-sea-level (MSL):
 *
 *   mslAltitude = ellipsoidalGpsAltitude - Geoid.meanSeaLevel(lat, lon)
 *
 * Android's FusedLocation reports an ellipsoidal altitude; terrain elevations
 * (opentopodata SRTM/ASTER/Mapzen) are MSL-referenced. Mixing the two leaks N
 * in as a constant error — e.g. ~+23 m in Stockholm, ~+36 m around Goteborg —
 * which made the headline and GROUND readings nonsensical in Scandinavia.
 *
 * location.mslAltitudeMeters (API 34+, native EGM2008) is preferred when the
 * device supplies it, but most phones don't, so this grid provides the
 * fallback so the correction always applies.
 *
 * Data: the same 1-degree grid the web app embeds (assets/egm96_geoid_1deg.bin),
 * resampled from the NGA EGM96 model. Signed 16-bit centimeters, little-endian,
 * rows lat -90..90 (181), cols lon -180..179 (360). Bilinear interpolation.
 */
object Geoid {
    private const val LAT_N = 181
    private const val LON_N = 360
    private const val ASSET = "egm96_geoid_1deg.bin"

    @Volatile private var grid: ShortArray? = null

    /** Load the grid from assets once. Safe to call repeatedly. */
    fun load(context: Context) {
        if (grid != null) return
        synchronized(this) {
            if (grid != null) return
            val bytes = context.assets.open(ASSET).use { it.readBytes() }
            val buf = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
            val g = ShortArray(LAT_N * LON_N)
            for (i in g.indices) g[i] = buf.short
            grid = g
        }
    }

    private fun at(g: ShortArray, r: Int, c: Int): Int = g[r * LON_N + c].toInt()

    /**
     * Geoid undulation N in meters at (lat, lon), bilinearly interpolated.
     * Returns null if the grid has not been loaded via [load].
     */
    fun meanSeaLevel(lat: Double, lon: Double): Double? {
        val g = grid ?: return null
        var la = lat
        if (la > 90) la = 90.0 else if (la < -90) la = -90.0
        // normalize lon to [-180, 180)
        val lo = ((lon + 180) % 360 + 360) % 360 - 180
        val fr = la + 90       // fractional grid coords (step 1 degree)
        val fc = lo + 180
        val r0 = floor(fr).toInt()
        val c0 = floor(fc).toInt()
        val r1 = minOf(r0 + 1, LAT_N - 1)
        val c1 = (c0 + 1) % LON_N        // wrap longitude
        val dr = fr - r0
        val dc = fc - c0
        val v00 = at(g, r0, c0); val v01 = at(g, r0, c1)
        val v10 = at(g, r1, c0); val v11 = at(g, r1, c1)
        val top = v00 + (v01 - v00) * dc
        val bot = v10 + (v11 - v10) * dc
        return (top + (bot - top) * dr) / 100.0   // cm -> m
    }
}
