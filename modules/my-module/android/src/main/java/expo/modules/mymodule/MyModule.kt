package expo.modules.mymodule

import android.app.WallpaperManager
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.InputStream

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    AsyncFunction("setWallpaper") { uriString: String, screenType: String ->
      val context = appContext.reactContext ?: throw Exception("React context not found")
      val uri = Uri.parse(uriString)
      val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
      
      if (inputStream != null) {
        val wallpaperManager = WallpaperManager.getInstance(context)
        val flags = when (screenType.lowercase()) {
          "lock" -> WallpaperManager.FLAG_LOCK
          "home" -> WallpaperManager.FLAG_SYSTEM
          "both" -> WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK
          else -> WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK
        }
        
        wallpaperManager.setStream(inputStream, null, true, flags)
        inputStream.close()
        "Success"
      } else {
        throw Exception("Could not open input stream for URI: $uriString")
      }
    }
  }
}
