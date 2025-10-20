package generated

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color

class src_widgets_WeatherWidget_tsxReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = src_widgets_WeatherWidget_tsxWidget()
}

class src_widgets_WeatherWidget_tsxWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            src_widgets_WeatherWidget_tsxContent()
        }
    }
}

@Composable
fun src_widgets_WeatherWidget_tsxContent() {
    Column(modifier = GlanceModifier.padding(16.dp).background(Color(0xFF4A90E2)).cornerRadius(12.dp)) {
      Row(modifier = GlanceModifier) {
        Column(modifier = GlanceModifier) {
          Text(text = "San Francisco", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 24.sp))
          Text(text = "Partly Cloudy", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFE0E0E0))), style = TextStyle(fontSize = 14.sp))
        }
        Spacer(modifier = GlanceModifier)
        Column(modifier = GlanceModifier) {
          Text(text = "72°", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 48.sp))
        }
      }
      Column(modifier = GlanceModifier) {
        Row(modifier = GlanceModifier) {
          Column(modifier = GlanceModifier) {
            Text(text = "Mon", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 12.sp))
            Text(text = "68°", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 18.sp))
          }
          Column(modifier = GlanceModifier) {
            Text(text = "Tue", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 12.sp))
            Text(text = "70°", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 18.sp))
          }
          Column(modifier = GlanceModifier) {
            Text(text = "Wed", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 12.sp))
            Text(text = "75°", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 18.sp))
          }
          Column(modifier = GlanceModifier) {
            Text(text = "Thu", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 12.sp))
            Text(text = "73°", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 18.sp))
          }
        }
      }
      Button(text = "Refresh", onClick = actionStartActivity<MainActivity>(), modifier = GlanceModifier.padding(8.dp).background(Color(0xFFFFFF20)).cornerRadius(6.dp))
    }
}