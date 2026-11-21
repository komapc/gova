# Gova R8 rules (on top of proguard-android-optimize.txt and the consumer
# rules shipped by AndroidX / Play services).
#
# Nothing extra is needed today: the app uses no reflection or serialization
# libraries. MainActivity and AltitudeWidget are kept via the manifest, and
# org.json is part of the platform.

# Keep line numbers in crash reports; the mapping file restores names.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
