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

class src_LiveActivityDemo_tsxReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = src_LiveActivityDemo_tsxWidget()
}

class src_LiveActivityDemo_tsxWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            src_LiveActivityDemo_tsxContent()
        }
    }
}

@Composable
fun src_LiveActivityDemo_tsxContent() {
    Column(modifier = GlanceModifier.padding(16.dp).background(Color(0xFFFFFFFF)).cornerRadius(16.dp)) {
      Row(modifier = GlanceModifier) {
        Column(modifier = GlanceModifier.width(50.dp).height(50.dp).background(Color(0xFF3B82F6)).cornerRadius(25.dp)) {
          Text(text = "🍕", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFFFFFFFF))), style = TextStyle(fontSize = 24.sp))
        }
        Column(modifier = GlanceModifier) {
          Text(text = "Order #12345", modifier = GlanceModifier, style = TextStyle(fontSize = 16.sp))
          Text(text = "From Acme Pizza", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 14.sp))
        }
      }
      LinearProgressIndicator(progress = 0.65f, modifier = GlanceModifier.height(8.dp).cornerRadius(4.dp))
      Row(modifier = GlanceModifier) {
        Text(text = "Delivering", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF374151))), style = TextStyle(fontSize = 14.sp))
        Text(text = "• ETA: 15 min", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 14.sp))
      }
    }
}