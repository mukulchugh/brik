package generated

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.compose.runtime.Composable

class BrikWidgetReceiver : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = BrikWidget()
}

class BrikWidget : GlanceAppWidget(){ }