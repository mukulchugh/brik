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

class src_BrikDemo_tsxReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = src_BrikDemo_tsxWidget()
}

class src_BrikDemo_tsxWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            src_BrikDemo_tsxContent()
        }
    }
}

@Composable
fun src_BrikDemo_tsxContent() {
    Column(modifier = GlanceModifier.padding(16.dp)) {
      Text(text = "Brik 👋", modifier = GlanceModifier, style = TextStyle(fontSize = 24.sp))
      Image(provider = ImageProvider(R.drawable.placeholder), contentDescription = null, modifier = GlanceModifier.width(200.dp).height(120.dp).cornerRadius(12.dp))
      Column(modifier = GlanceModifier.padding(12.dp).background(Color(0xFFEEEEFF)).cornerRadius(8.dp)) {
        Text(text = "Write once in JSX, run native as SwiftUI & Compose.", modifier = GlanceModifier)
      }
      Button(text = "Press me", onClick = actionStartActivity<MainActivity>(), modifier = GlanceModifier.padding(12.dp).background(Color(0xFF3B82F6)).cornerRadius(8.dp))
    }
}