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

class MainActivity : ComponentActivity() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        setContent {
            GovaApp(fusedLocationClient)
        }
    }
}

@Composable
fun GovaApp(fusedLocationClient: FusedLocationProviderClient) {
    val context = LocalContext.current
    var altitude by remember { mutableStateOf<Double?>(null) }
    var accuracy by remember { mutableStateOf<Float?>(null) }
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
                altitude = location.altitude
                accuracy = location.accuracy
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
                        // Simulas refreŝon
                    },
                    onLongPress = {
                        // Vibras kiam longpremas por agordoj
                        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                        vibrator.vibrate(50)
                        // Ĉi tie oni povus malfermi agordan folion
                    }
                )
            },
        color = Color(0xFF0A0A0A) // Malhela fono defaŭlte
    ) {
        Box(contentAlignment = Alignment.Center) {
            // Alteca Valoro
            Row(verticalAlignment = Alignment.Bottom) {
                val displayValue = if (altitude != null) {
                    val valToDisplay = if (baseHeight != null) altitude!! - baseHeight!! else altitude!!
                    String.format("%.0f", valToDisplay)
                } else "—"

                val prefix = if (baseHeight != null && altitude != null && altitude!! - baseHeight!! > 0) "+" else ""

                Text(
                    text = "$prefix$displayValue",
                    color = if (isRefreshing) Color(0xFF3B82F6) else Color.White,
                    fontSize = 120.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "m",
                    color = Color.Gray,
                    fontSize = 40.sp,
                    modifier = Modifier.padding(bottom = 24.dp)
                )
            }

            // Delta indikilo
            if (baseHeight != null) {
                Text(
                    text = "Δ",
                    color = Color.Gray.copy(alpha = 0.5f),
                    fontSize = 24.sp,
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(16.dp)
                )
            }
            
            // Precizeco (malsupre)
            accuracy?.let {
                Text(
                    text = "±${String.format("%.0f", it)}m",
                    color = Color.Gray.copy(alpha = 0.5f),
                    fontSize = 14.sp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 64.dp)
                )
            }

            // Disclaimer
            Text(
                text = "Atento: Alteco-datumoj eble ne estas tute precizaj pro GPS-limigoj.",
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
