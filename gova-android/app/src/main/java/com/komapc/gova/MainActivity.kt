package com.komapc.gova

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.os.Build
import android.os.Bundle
import android.os.Vibrator
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
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
    var teroAltitude by remember { mutableStateOf<Double?>(null) }
    var hAccuracy by remember { mutableStateOf<Float?>(null) }
    var vAccuracy by remember { mutableStateOf<Float?>(null) }
    
    var lastNetworkFetchTime by remember { mutableStateOf(0L) }
    var baseHeight by remember { mutableStateOf<Double?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }
    var isSettingsOpen by remember { mutableStateOf(false) }
    var useFeet by remember { mutableStateOf(false) }
    var currentViewMode by remember { mutableStateOf(ViewMode.INFORMATIVE) }

    var hasPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasPermission = isGranted
    }

    LaunchedEffect(hasPermission) {
        if (hasPermission) {
            startLocationUpdates(fusedLocationClient) { location ->
                gpsAltitude = location.altitude
                hAccuracy = location.accuracy
                
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
                
                // Fetch ground elevation (TERO) from Open-Elevation API
                if (System.currentTimeMillis() - lastNetworkFetchTime > 60000) {
                    lastNetworkFetchTime = System.currentTimeMillis()
                    coroutineScope.launch {
                        try {
                            val result = withContext(Dispatchers.IO) {
                                val url = URL("https://api.open-elevation.com/api/v1/lookup?locations=${location.latitude},${location.longitude}")
                                val connection = url.openConnection() as HttpURLConnection
                                connection.requestMethod = "GET"
                                connection.connectTimeout = 5000
                                connection.readTimeout = 5000
                                
                                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                                    val jsonObject = JSONObject(response)
                                    val results = jsonObject.getJSONArray("results")
                                    if (results.length() > 0) {
                                        results.getJSONObject(0).getDouble("elevation")
                                    } else null
                                } else null
                            }
                            if (result != null) {
                                teroAltitude = result
                            }
                        } catch (e: Exception) {
                            // Ignored, fallback to GPS altitude will remain
                        }
                    }
                }
            }
        } else {
            launcher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
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
                    },
                    onLongPress = {
                        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                        vibrator.vibrate(50)
                        isSettingsOpen = true
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
                        InfoGrid(gpsAltitude, mslAltitude, teroAltitude, baroAltitude.value, hAccuracy, vAccuracy, useFeet)
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
                            InfoGrid(gpsAltitude, mslAltitude, teroAltitude, baroAltitude.value, hAccuracy, vAccuracy, useFeet)
                        }
                    }
                }
            }

            // Disclaimer (very bottom, only in Informative)
            if (currentViewMode == ViewMode.INFORMATIVE) {
                Text(
                    text = "Atento: Alteco-datumoj baziĝas sur GPS/Barometro kaj eble ne estas tute precizaj.",
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
                    gpsAltitude = gpsAltitude,
                    mslAltitude = mslAltitude,
                    teroAltitude = teroAltitude,
                    baroAltitude = baroAltitude.value,
                    baseHeight = baseHeight,
                    useFeet = useFeet,
                    onClose = { isSettingsOpen = false },
                    onToggleUnits = { useFeet = !useFeet },
                    onSetBase = { baseHeight = teroAltitude ?: mslAltitude ?: baroAltitude.value ?: gpsAltitude },
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
        Text("Δ RELATIVA", color = Color(0xFF3B82F6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun InfoGrid(gps: Double?, msl: Double?, tero: Double?, baro: Double?, hAcc: Float?, vAcc: Float?, useFeet: Boolean) {
    // S.TERO calculation (GPS or MSL altitude above ground level)
    val agl = if (tero != null) {
        val currentAlt = gps ?: msl
        if (currentAlt != null) {
            maxOf(0.0, currentAlt - tero)
        } else null
    } else null

    // Raw Data Row
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        InfoItem("GPS", gps, vAcc, useFeet)
        InfoItem("TERO", tero, null, useFeet)
        InfoItem("S.TERO", agl, null, useFeet)
        if (baro != null) {
            InfoItem("BARO", baro, null, useFeet)
        }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
    
    // Accuracy Text
    val hAccDisp = if (useFeet) (hAcc ?: 0f) * 3.28084f else (hAcc ?: 0f)
    val vAccDisp = if (useFeet) (vAcc ?: 0f) * 3.28084f else (vAcc ?: 0f)
    val unitStr = if (useFeet) "ft" else "m"
    
    Text(
        text = "Precizeco: H ±${String.format("%.0f", hAccDisp)}${unitStr} | V ±${String.format("%.0f", vAccDisp)}${unitStr}",
        color = Color.Gray.copy(alpha = 0.6f),
        fontSize = 12.sp
    )
}

@Composable
fun SettingsSheet(
    gpsAltitude: Double?,
    mslAltitude: Double?,
    teroAltitude: Double?,
    baroAltitude: Double?,
    baseHeight: Double?,
    useFeet: Boolean,
    onClose: () -> Unit,
    onToggleUnits: () -> Unit,
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
                    "AGORDOJ",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Units Section
                Text("UNUOJ", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(if (useFeet) "Futoj (ft)" else "Metroj (m)", color = Color.White)
                    Switch(checked = useFeet, onCheckedChange = { onToggleUnits() })
                }

                Divider(color = Color.Gray.copy(alpha = 0.2f), modifier = Modifier.padding(vertical = 12.dp))

                // Base Height Section
                Text("BAZA ALTECO", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
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
                        Text("FIKSI BAZON")
                    }
                    Button(
                        onClick = { onClearBase(); onClose() },
                        modifier = Modifier.weight(1f),
                        enabled = baseHeight != null,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                    ) {
                        Text("FORIGI")
                    }
                }

                Divider(color = Color.Gray.copy(alpha = 0.2f), modifier = Modifier.padding(vertical = 12.dp))

                // About Section
                Text("PRI GOVA", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .background(Color.White.copy(alpha = 0.05f), MaterialTheme.shapes.medium)
                        .padding(16.dp)
                ) {
                    Text(
                        "Gova estas malfermkoda ilo por monitori altecon en Esperanto.",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Precizeco: GPS baziĝas sur WGS84. MSL uzas Geoid-modelon. TERO estas ground elevation. BARO uzas aerpremon.",
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
                    Text("FERMI", color = Color.Gray)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "v3.2.0 (Marto 2026)",
                    color = Color.Gray.copy(alpha = 0.5f),
                    fontSize = 12.sp,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )
            }
        }
    }
}

@Composable
fun InfoItem(label: String, value: Double?, accuracy: Float?, useFeet: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        val displayVal = if (value != null) {
            val converted = if (useFeet) value * 3.28084 else value
            String.format("%.1f %s", converted, if (useFeet) "ft" else "m")
        } else "—"
        
        Text(
            text = displayVal,
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
