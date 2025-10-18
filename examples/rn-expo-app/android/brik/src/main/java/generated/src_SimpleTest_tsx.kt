import androidx.compose.foundation.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.compose.foundation.layout.*

@Composable
fun src_SimpleTest_tsx() {
    Column(horizontalArrangement = Arrangement.Start, verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier) {
      Text(text = "Hello", modifier = Modifier).fontSize(24.sp)
      AsyncImage(model = "https://picsum.photos/200", modifier = Modifier.width(200.dp).height(120.dp).clip(RoundedCornerShape(12.dp)))
      Button(onClick = { /* TODO: onPress */ }, modifier = Modifier) { Text("Press me") }
    }
}