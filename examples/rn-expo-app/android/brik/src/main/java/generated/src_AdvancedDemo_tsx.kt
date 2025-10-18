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

class src_AdvancedDemo_tsxReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = src_AdvancedDemo_tsxWidget()
}

class src_AdvancedDemo_tsxWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            src_AdvancedDemo_tsxContent()
        }
    }
}

@Composable
fun src_AdvancedDemo_tsxContent() {
    Column(modifier = GlanceModifier.padding(16.dp).background(Color(0xFFFFFFFF)).cornerRadius(16.dp)) {
      Row(modifier = GlanceModifier) {
        Image(provider = ImageProvider(R.drawable.placeholder), contentDescription = null, modifier = GlanceModifier.width(60.dp).height(60.dp).cornerRadius(30.dp).clickable(actionStartActivity<MainActivity>()))
        Column(modifier = GlanceModifier) {
          Text(text = "John Doe", modifier = GlanceModifier.clickable(actionStartActivity<MainActivity>()), style = TextStyle(color = ColorProvider(Color(0xFF1A1A1A))), style = TextStyle(fontSize = 20.sp))
          Text(text = "Software Engineer • San Francisco", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 14.sp))
        }
      }
      Row(modifier = GlanceModifier.padding(12.dp).background(Color(0xFFF3F4F6)).cornerRadius(12.dp)) {
        Column(modifier = GlanceModifier) {
          Text(text = "2.5K", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF1A1A1A))), style = TextStyle(fontSize = 24.sp))
          Text(text = "Followers", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 12.sp))
        }
        Spacer(modifier = GlanceModifier.width(1.dp).background(Color(0xFFD1D5DB)))
        Column(modifier = GlanceModifier) {
          Text(text = "342", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF1A1A1A))), style = TextStyle(fontSize = 24.sp))
          Text(text = "Following", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 12.sp))
        }
        Spacer(modifier = GlanceModifier.width(1.dp).background(Color(0xFFD1D5DB)))
        Column(modifier = GlanceModifier) {
          Text(text = "48", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF1A1A1A))), style = TextStyle(fontSize = 24.sp))
          Text(text = "Posts", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 12.sp))
        }
      }
      Column(modifier = GlanceModifier) {
        Text(text = "Today's Progress", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF374151))), style = TextStyle(fontSize = 14.sp))
        LinearProgressIndicator(progress = 0.65f, modifier = GlanceModifier.height(8.dp).cornerRadius(4.dp))
        Text(text = "65% Complete • 6.5 hours tracked", modifier = GlanceModifier, style = TextStyle(color = ColorProvider(Color(0xFF6B7280))), style = TextStyle(fontSize = 12.sp))
      }
      Row(modifier = GlanceModifier) {
        Button(text = "Open App", onClick = actionStartActivity<MainActivity>(), modifier = GlanceModifier.padding(12.dp).background(Color(0xFF3B82F6)).cornerRadius(8.dp))
        Button(text = "Refresh", onClick = actionRunCallback<RefreshAction>(), modifier = GlanceModifier.padding(12.dp).background(Color(0xFFE5E7EB)).cornerRadius(8.dp))
      }
    }
}