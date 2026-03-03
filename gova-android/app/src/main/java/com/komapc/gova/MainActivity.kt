package com.komapc.gova

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.os.Vibrator
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
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
import kotlinx.coroutines.delay

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Vibrator
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
import kotlinx.coroutines.delay
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
            val altitude = 44330 * (1 - (pressure / 1013.25).pow(1 / 5.255))
            _baroAltitude.value = altitude.toDouble()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

@Composable
fun GovaApp(fusedLocationClient: FusedLocationProviderClient, baroAltitude: State<Double?>) {
    val context = LocalContext.current
    var gpsAltitude by remember { mutableStateOf<Double?>(null) }
    var mslAltitude by remember { mutableStateOf<Double?>(null) }
    var hAccuracy by remember { mutableStateOf<Float?>(null) }
    var vAccuracy by remember { mutableStateOf<Float?>(null) }
    
    var baseHeight by remember { mutableStateOf<Double?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }
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
                
                // On Android, "altitude" is already Ellipsoid height.
                // We don't have a built-in EGM96 provider, but we could add one.
                // For now, let's treat the location altitude as the primary.
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
                        isRefreshing = true
                    },
                    onLongPress = {
                        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                        vibrator.vibrate(50)
                        // Set current GPS as base
                        gpsAltitude?.let { baseHeight = it }
                    }
                )
            },
        color = Color(0xFF0A0A0A)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            
            // MAIN DISPLAY (GPS or Baro)
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                val currentAlt = baroAltitude.value ?: gpsAltitude ?: 0.0
                val displayValue = if (gpsAltitude != null || baroAltitude.value != null) {
                    val valToDisplay = if (baseHeight != null) currentAlt - baseHeight!! else currentAlt
                    String.format("%.0f", valToDisplay)
                } else "—"

                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = displayValue,
                        color = if (isRefreshing) Color(0xFF3B82F6) else Color.White,
                        fontSize = 100.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "m",
                        color = Color.Gray,
                        fontSize = 30.sp,
                        modifier = Modifier.padding(bottom = 20.dp, start = 4.dp)
                    )
                }
                
                if (baseHeight != null) {
                    Text("Δ RELATIVA", color = Color(0xFF3B82F6), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            // INFO GRID (Bottom)
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Raw Data Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    InfoItem("GPS", gpsAltitude, vAccuracy)
                    InfoItem("BARO", baroAltitude.value, null)
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Accuracy Text
                Text(
                    text = "Precizeco: H ±${String.format("%.0f", hAccuracy ?: 0f)}m | V ±${String.format("%.0f", vAccuracy ?: 0f)}m",
                    color = Color.Gray.copy(alpha = 0.6f),
                    fontSize = 12.sp
                )
            }

            // Disclaimer (very bottom)
            Text(
                text = "Atento: Alteco-datumoj baziĝas sur GPS/Barometro kaj eble ne estas tute precizaj.",
                color = Color.Gray.copy(alpha = 0.4f),
                fontSize = 10.sp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 16.dp)
            )
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
fun InfoItem(label: String, value: Double?, accuracy: Float?) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Text(
            text = value?.let { String.format("%.1f m", it) } ?: "—",
            color = Color.White.copy(alpha = 0.8f),
            fontSize = 18.sp,
            fontFamily = FontFamily.Monospace
        )
        accuracy?.let {
            Text(text = "±${String.format("%.0f", it)}m", color = Color.Gray, fontSize = 9.sp)
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
