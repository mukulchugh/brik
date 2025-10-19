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

class src_WidgetDemo_tsxReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = src_WidgetDemo_tsxWidget()
}

class src_WidgetDemo_tsxWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            src_WidgetDemo_tsxContent()
        }
    }
}

@Composable
fun src_WidgetDemo_tsxContent() {
    Column(modifier = GlanceModifier.padding(12.dp).background(Color(0xFFF8F9FA)).cornerRadius(12.dp)) {
      Text(text = "📱 Widget Demo", modifier = GlanceModifier, style = TextStyle(fontSize = 18.sp))
      Column(modifier = GlanceModifier.padding(8.dp).background(Color(0xFFE3F2FD)).cornerRadius(8.dp)) {
        Text(text = "This component can be used as a homescreen widget!", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF1976D2))), style = TextStyle(fontSize = 14.sp))
      }
      Image(provider = ImageProvider(R.drawable.placeholder), contentDescription = null, modifier = GlanceModifier.width(150.dp).height(100.dp).cornerRadius(8.dp))
      Row(modifier = GlanceModifier) {
        Column(modifier = GlanceModifier.padding(6.dp).background(Color(0xFF4CAF50)).cornerRadius(6.dp)) {
          Text(text = "✅ Active", modifier = GlanceModifier, style = TextStyle(fontSize = 12.sp))
        }
        Column(modifier = GlanceModifier.padding(6.dp).background(Color(0xFFFF9800)).cornerRadius(6.dp)) {
          Text(text = "⚡ Fast", modifier = GlanceModifier, style = TextStyle(fontSize = 12.sp))
        }
      }
      Button(text = "Tap Widget", onClick = actionStartActivity<MainActivity>(), modifier = GlanceModifier.padding(12.dp).background(Color(0xFF8B5CF6)).cornerRadius(8.dp))
    }
}