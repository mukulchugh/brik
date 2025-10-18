import androidx.compose.foundation.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.compose.foundation.layout.*

@Composable
fun src_WidgetDemo_tsx() {
    Column(horizontalArrangement = Arrangement.Start, verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(Color("#f8f9fa"))) {
      Text(text = "📱 Widget Demo", modifier = Modifier).fontSize(18.sp).fontWeight(FontWeight.Bold)
      Column(verticalArrangement = Arrangement.spacedBy(0.dp), modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(Color("#e3f2fd"))) {
        Text(text = "This component can be used as a homescreen widget!", modifier = Modifier, color = Color("#1976d2")).fontSize(14.sp)
      }
      AsyncImage(model = "https://picsum.photos/150/100", modifier = Modifier.width(150.dp).height(100.dp).clip(RoundedCornerShape(8.dp)))
      Column(horizontalArrangement = Arrangement.Start, verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(0.dp), modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(Color("#4caf50"))) {
          Text(text = "✅ Active", modifier = Modifier, color = Color("white")).fontSize(12.sp)
        }
        Column(verticalArrangement = Arrangement.spacedBy(0.dp), modifier = Modifier.clip(RoundedCornerShape(6.dp)).background(Color("#ff9800"))) {
          Text(text = "⚡ Fast", modifier = Modifier, color = Color("white")).fontSize(12.sp)
        }
      }
      Button(onClick = { /* TODO: onPress */ }, modifier = Modifier) { Text("Tap Widget") }
    }
}