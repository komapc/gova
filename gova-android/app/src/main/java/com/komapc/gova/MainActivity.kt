package com.komapc.gova

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.GnssStatus
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.pow

class MainActivity : ComponentActivity(), SensorEventListener {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var sensorManager: SensorManager
    private var pressureSensor: Sensor? = null
    
    // State for the UI
    private val _baroAltitude = mutableStateOf<Double?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        pressureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_PRESSURE)

        setContent {
            GovaApp(fusedLocationClient, _baroAltitude)
        }
    }

    override fun onResume() {
        super.onResume()
        pressureSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_PRESSURE) {
            val pressure = event.values[0]
            // Standard formula for altitude from pressure (P0 = 1013.25 hPa)
            val altitude = 44330 * (1 - (pressure / 1013.25f).pow(1 / 5.255f))
            _baroAltitude.value = altitude.toDouble()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

enum class ViewMode { MINIMAL, INFORMATIVE }

@Composable
fun GovaApp(fusedLocationClient: FusedLocationProviderClient, baroAltitude: State<Double?>) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var gpsAltitude by remember { mutableStateOf<Double?>(null) }
    var mslAltitude by remember { mutableStateOf<Double?>(null) }
    var terrainElevations by remember { mutableStateOf(TerrainElevations()) }
    var hAccuracy by remember { mutableStateOf<Float?>(null) }
    var vAccuracy by remember { mutableStateOf<Float?>(null) }
    var satelliteCount by remember { mutableStateOf(0) }
    
    var lastNetworkFetchTime by remember { mutableStateOf(0L) }
    // Online terrain-elevation lookup (GROUND) is opt-in and OFF by default:
    // it is the only feature that sends location off-device. Persisted so the
    // user's choice survives restarts.
    val prefs = remember { context.getSharedPreferences("gova_prefs", Context.MODE_PRIVATE) }
    var teroEnabled by remember { mutableStateOf(prefs.getBoolean("tero_enabled", false)) }
    var baseHeight by remember { mutableStateOf<Double?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }
    var isSettingsOpen by remember { mutableStateOf(false) }
    var useFeet by remember { mutableStateOf(false) }
    var currentViewMode by remember { mutableStateOf(ViewMode.INFORMATIVE) }
    var smoothedAltitude by remember { mutableStateOf<Double?>(null) }
    val smoothingFactor = 0.3

    var hasPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasPermission = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
    }

    LaunchedEffect(hasPermission) {
        if (hasPermission) {
            // Track satellites
            val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                val gnssStatusCallback = object : GnssStatus.Callback() {
                    override fun onSatelliteStatusChanged(status: GnssStatus) {
                        var count = 0
                        for (i in 0 until status.satelliteCount) {
                            if (status.usedInFix(i)) count++
                        }
                        satelliteCount = count
                    }
                }
                try {
                    locationManager.registerGnssStatusCallback(gnssStatusCallback, null)
                } catch (e: SecurityException) {}
            }

            startLocationUpdates(fusedLocationClient) { location ->
                val raw = location.altitude
                smoothedAltitude = if (smoothedAltitude == null) raw else smoothedAltitude!! + smoothingFactor * (raw - smoothedAltitude!!)
                
                gpsAltitude = smoothedAltitude
                hAccuracy = location.accuracy

                // Keep the home-screen widget in sync while the app is open
                // (no background location service — updates only in foreground).
                AltitudeWidget.updateAllWidgets(context, "${String.format("%.1f", smoothedAltitude ?: raw)}m")
                
                // Get Vertical Accuracy if available (Android 8.0+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    if (location.hasVerticalAccuracy()) {
                        vAccuracy = location.verticalAccuracyMeters
                    }
                }
                
                // Try to get MSL natively (Android 14+ / API 34)
                if (Build.VERSION.SDK_INT >= 34 /* Build.VERSION_CODES.UPSIDE_DOWN_CAKE */) {
                    if (location.hasMslAltitude()) {
                        mslAltitude = location.mslAltitudeMeters
                    }
                }
                
                // Fetch ground elevation (GROUND) — opt-in only; sends location off-device
                if (teroEnabled && System.currentTimeMillis() - lastNetworkFetchTime > 60000) {
                    lastNetworkFetchTime = System.currentTimeMillis()
                    coroutineScope.launch {
                        val result = withContext(Dispatchers.IO) {
                            fetchElevations(location.latitude, location.longitude)
                        }
                        terrainElevations = result
                    }
                }
            }
        } else {
            launcher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION))
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = {
                        currentViewMode = if (currentViewMode == ViewMode.MINIMAL) ViewMode.INFORMATIVE else ViewMode.MINIMAL
                        isRefreshing = true
                    }
                )
            }
            .pointerInput(Unit) {
                // Swipe up to open settings (replaces long-press). Fire as soon
                // as the upward travel crosses the threshold, mid-gesture, so a
                // quick short flick works — not only a slow, deliberate drag
                // that's checked on finger-lift.
                val threshold = 36.dp.toPx()
                var dragDy = 0f
                var fired = false
                detectVerticalDragGestures(
                    onDragStart = { dragDy = 0f; fired = false },
                    onVerticalDrag = { _, delta ->
                        dragDy += delta
                        if (!fired && dragDy < -threshold) {
                            fired = true
                            vibrate(context, 50)
                            isSettingsOpen = true
                        }
                    }
                )
            },
        color = Color(0xFF0A0A0A)
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val isLandscape = maxWidth > maxHeight
            
            if (isLandscape) {
                // LANDSCAPE LAYOUT
                Row(
                    modifier = Modifier.fillMaxSize().padding(32.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left Side: Altitude
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        AltitudeDisplay(gpsAltitude, mslAltitude, baroAltitude.value, baseHeight, isRefreshing, useFeet, alwaysShowMsl = (currentViewMode == ViewMode.MINIMAL))
                    }

                    // Right Side: Info Grid (Always visible in Landscape for better space usage, or could be hidden if preferred)
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        InfoGrid(gpsAltitude, mslAltitude, terrainElevations, baroAltitude.value, satelliteCount, hAccuracy, vAccuracy, useFeet)
                    }
                }
            } else {
                // PORTRAIT LAYOUT
                Box(modifier = Modifier.fillMaxSize()) {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        AltitudeDisplay(gpsAltitude, mslAltitude, baroAltitude.value, baseHeight, isRefreshing, useFeet, alwaysShowMsl = (currentViewMode == ViewMode.MINIMAL))
                    }

                    if (currentViewMode == ViewMode.INFORMATIVE) {
                        Column(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 80.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            InfoGrid(gpsAltitude, mslAltitude, terrainElevations, baroAltitude.value, satelliteCount, hAccuracy, vAccuracy, useFeet)
                        }
                    }
                }
            }

            // Disclaimer (very bottom, only in Informative)
            if (currentViewMode == ViewMode.INFORMATIVE) {
                Text(
                    text = stringResource(R.string.disclaimer),
                    color = Color.Gray.copy(alpha = 0.4f),
                    fontSize = 10.sp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 16.dp)
                )
            }

            // SETTINGS MODAL
            if (isSettingsOpen) {
                SettingsSheet(
                    baseHeight = baseHeight,
                    useFeet = useFeet,
                    teroEnabled = teroEnabled,
                    onClose = { isSettingsOpen = false },
                    onToggleUnits = { useFeet = !useFeet },
                    onToggleTero = {
                        teroEnabled = !teroEnabled
                        prefs.edit().putBoolean("tero_enabled", teroEnabled).apply()
                        // When turned off, drop any cached terrain values so GROUND clears.
                        if (!teroEnabled) terrainElevations = TerrainElevations()
                    },
                    onSetBase = { baseHeight = terrainElevations.zen ?: terrainElevations.srtm ?: terrainElevations.aster ?: mslAltitude ?: baroAltitude.value ?: gpsAltitude },
                    onClearBase = { baseHeight = null }
                )
            }
        }
    }

    LaunchedEffect(isRefreshing) {
        if (isRefreshing) {
            delay(1000)
            isRefreshing = false
        }
    }
}

@Composable
fun AltitudeDisplay(gps: Double?, msl: Double?, baro: Double?, base: Double?, isRefreshing: Boolean, useFeet: Boolean, alwaysShowMsl: Boolean = false) {
    val currentAlt = gps ?: msl ?: baro ?: 0.0
    val rawValue = if (gps != null || msl != null || baro != null) {
        if (base != null && !alwaysShowMsl) currentAlt - base else currentAlt
    } else null
    
    val displayValue = if (rawValue != null) {
        val convertedValue = if (useFeet) rawValue * 3.28084 else rawValue
        String.format("%.1f", convertedValue)
    } else "—"

    Row(verticalAlignment = Alignment.Bottom) {
        Text(
            text = displayValue,
            color = if (isRefreshing) Color(0xFF3B82F6) else Color.White,
            fontSize = 120.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Text(
            text = if (useFeet) "ft" else "m",
            color = Color.Gray,
            fontSize = 30.sp,
            modifier = Modifier.padding(bottom = 24.dp, start = 4.dp)
        )
    }
    
    if (base != null && !alwaysShowMsl) {
        Text(stringResource(R.string.relative_label), color = Color(0xFF3B82F6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun InfoGrid(gps: Double?, msl: Double?, terrain: TerrainElevations, baro: Double?, sats: Int, hAcc: Float?, vAcc: Float?, useFeet: Boolean) {
    // GROUND = current altitude above the terrain. The terrain elevations from
    // opentopodata are referenced to mean sea level (the geoid), so we must use
    // the geoid-corrected MSL altitude here, NOT the raw WGS84-ellipsoidal GPS
    // altitude. Mixing the two adds the geoid undulation N as a constant error
    // (≈ +20–30 m in Scandinavia — the "GROUND makes no sense in Sweden" bug).
    // Prefer MSL (API 34+ native geoid model); fall back to GPS only when the
    // device can't supply MSL, where GROUND is necessarily approximate.
    val bestGround = terrain.zen ?: terrain.srtm ?: terrain.aster
    val agl = if (bestGround != null) {
        val currentAlt = msl ?: gps
        if (currentAlt != null) {
            maxOf(0.0, currentAlt - bestGround)
        } else null
    } else null

    // Layout: Two rows for better space usage
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        // Row 1: GPS, BARO, GROUND, SATS
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            InfoItem("GPS", gps, vAcc, useFeet)
            if (baro != null) {
                InfoItem("BARO", baro, null, useFeet)
            }
            if (agl != null) {
                InfoItem("GROUND", agl, null, useFeet)
            }
            InfoItem(stringResource(R.string.sat_label), sats.toDouble(), null, false, isInt = true)
        }

        // Row 2: SRTM, ASTER, ZEN — only when terrain lookup returned data.
        val hasTerrain = terrain.srtm != null || terrain.aster != null || terrain.zen != null
        if (hasTerrain) {
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                if (terrain.srtm != null) InfoItem("SRTM", terrain.srtm, null, useFeet)
                if (terrain.aster != null) InfoItem("ASTER", terrain.aster, null, useFeet)
                if (terrain.zen != null) InfoItem("ZEN", terrain.zen, null, useFeet)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        
        // Accuracy Text
        val hAccDisp = if (useFeet) (hAcc ?: 0f) * 3.28084f else (hAcc ?: 0f)
        val vAccDisp = if (useFeet) (vAcc ?: 0f) * 3.28084f else (vAcc ?: 0f)
        val unitStr = if (useFeet) "ft" else "m"
        
        Text(
            text = stringResource(
                R.string.accuracy_format,
                String.format("%.0f", hAccDisp),
                unitStr,
                String.format("%.0f", vAccDisp),
                unitStr
            ),
            color = Color.Gray.copy(alpha = 0.6f),
            fontSize = 12.sp
        )
    }
}

private fun vibrate(context: Context, durationMs: Long) {
    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
    } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(durationMs)
    }
}

@Composable
fun SettingsSheet(
    baseHeight: Double?,
    useFeet: Boolean,
    teroEnabled: Boolean,
    onClose: () -> Unit,
    onToggleUnits: () -> Unit,
    onToggleTero: () -> Unit,
    onSetBase: () -> Unit,
    onClearBase: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.8f))
            .clickable { onClose() }
    ) {
        Surface(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .clickable(enabled = false) {}, // Prevent closing when clicking the sheet itself
            color = Color(0xFF1A1A1A),
            shape = MaterialTheme.shapes.large
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .navigationBarsPadding()
            ) {
                Text(
                    stringResource(R.string.settings_title),
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Units Section
                Text(stringResource(R.string.units_label), color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(stringResource(if (useFeet) R.string.unit_feet else R.string.unit_meters), color = Color.White)
                    Switch(checked = useFeet, onCheckedChange = { onToggleUnits() })
                }

                Divider(color = Color.Gray.copy(alpha = 0.2f), modifier = Modifier.padding(vertical = 12.dp))

                // Online terrain elevation (GROUND) — opt-in; only feature that sends location
                Text(stringResource(R.string.tero_label), color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(stringResource(R.string.tero_switch_label), color = Color.White)
                    Switch(checked = teroEnabled, onCheckedChange = { onToggleTero() })
                }
                Text(
                    stringResource(R.string.tero_privacy_note),
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                )

                Divider(color = Color.Gray.copy(alpha = 0.2f), modifier = Modifier.padding(vertical = 12.dp))

                // Base Height Section
                Text(stringResource(R.string.base_height_label), color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = { onSetBase(); onClose() },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Text(stringResource(R.string.set_base_btn))
                    }
                    Button(
                        onClick = { onClearBase(); onClose() },
                        modifier = Modifier.weight(1f),
                        enabled = baseHeight != null,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                    ) {
                        Text(stringResource(R.string.clear_base_btn))
                    }
                }

                Divider(color = Color.Gray.copy(alpha = 0.2f), modifier = Modifier.padding(vertical = 12.dp))

                // About Section
                Text(stringResource(R.string.about_label), color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .background(Color.White.copy(alpha = 0.05f), MaterialTheme.shapes.medium)
                        .padding(16.dp)
                ) {
                    Text(
                        stringResource(R.string.about_desc),
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        stringResource(R.string.precision_desc),
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Close Button
                TextButton(
                    onClick = { onClose() },
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Text(stringResource(R.string.close_btn), color = Color.Gray)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "v${BuildConfig.VERSION_NAME}",
                    color = Color.Gray.copy(alpha = 0.5f),
                    fontSize = 12.sp,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )
            }
        }
    }
}

@Composable
fun InfoItem(label: String, value: Double?, accuracy: Float?, useFeet: Boolean, isInt: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
        val displayValue = if (value != null) {
            if (isInt) {
                String.format("%.0f", value)
            } else {
                val converted = if (useFeet) value * 3.28084 else value
                String.format("%.1f", converted)
            }
        } else "—"

        Text(
            text = displayValue,
            color = Color.White.copy(alpha = 0.8f),
            fontSize = 18.sp,
            fontFamily = FontFamily.Monospace
        )
        accuracy?.let {
            val accDisp = if (useFeet) it * 3.28084f else it
            Text(text = "±${String.format("%.0f", accDisp)}", color = Color.Gray, fontSize = 9.sp)
        }
    }
}

data class TerrainElevations(
    val srtm: Double? = null,
    val aster: Double? = null,
    val zen: Double? = null
)

/** Fetches terrain elevation from multiple sources. */
fun fetchElevations(lat: Double, lon: Double): TerrainElevations {
    var srtm: Double? = null
    var aster: Double? = null
    var zen: Double? = null

    // Fetch SRTM and ASTER from OpenTopoData in one go
    try {
        val url = URL("https://api.opentopodata.org/v1/srtm30m,aster30m?locations=$lat,$lon")
        val conn = url.openConnection() as HttpURLConnection
        conn.connectTimeout = 8000
        if (conn.responseCode == HttpURLConnection.HTTP_OK) {
            val json = JSONObject(conn.inputStream.bufferedReader().use { it.readText() })
            if (json.optString("status") == "OK") {
                val results = json.getJSONArray("results")
                if (results.length() >= 2) {
                    srtm = results.getJSONObject(0).optDouble("elevation").takeIf { !it.isNaN() }
                    aster = results.getJSONObject(1).optDouble("elevation").takeIf { !it.isNaN() }
                }
            }
        }
    } catch (_: Exception) {}

    // Fetch Mapzen
    try {
        val url = URL("https://api.opentopodata.org/v1/mapzen?locations=$lat,$lon")
        val conn = url.openConnection() as HttpURLConnection
        conn.connectTimeout = 5000
        if (conn.responseCode == HttpURLConnection.HTTP_OK) {
            val json = JSONObject(conn.inputStream.bufferedReader().use { it.readText() })
            if (json.optString("status") == "OK") {
                val results = json.getJSONArray("results")
                if (results.length() > 0) {
                    zen = results.getJSONObject(0).optDouble("elevation").takeIf { !it.isNaN() }
                }
            }
        }
    } catch (_: Exception) {}

    return TerrainElevations(srtm, aster, zen)
}

@SuppressLint("MissingPermission")
fun startLocationUpdates(
    fusedLocationClient: FusedLocationProviderClient,
    onLocationReceived: (Location) -> Unit
) {
    val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 2000)
        .setWaitForAccurateLocation(false)
        .setMinUpdateIntervalMillis(1000)
        .setMaxUpdateDelayMillis(3000)
        .build()

    val locationCallback = object : LocationCallback() {
        override fun onLocationResult(p0: LocationResult) {
            for (location in p0.locations) {
                onLocationReceived(location)
            }
        }
    }

    fusedLocationClient.requestLocationUpdates(
        locationRequest,
        locationCallback,
        null
    )
}
