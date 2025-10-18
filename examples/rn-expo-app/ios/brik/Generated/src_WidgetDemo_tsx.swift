import SwiftUI

struct src_WidgetDemo_tsx: View {
    var body: some View {
    VStack(alignment: .center, spacing: 8) {
      Text("📱 Widget Demo").font(.system(size: 18)).fontWeight(.bold)
      VStack(alignment: .leading, spacing: 0) {
        Text("This component can be used as a homescreen widget!").font(.system(size: 14)).foregroundStyle(Color("#1976d2"))
      }.background(Color("#e3f2fd")).cornerRadius(8)
      AsyncImage(url: URL(string: "https://picsum.photos/150/100")).cornerRadius(8).frame(width: 150).frame(height: 100)
      VStack(alignment: .center, spacing: 8) {
        VStack(alignment: .leading, spacing: 0) {
          Text("✅ Active").font(.system(size: 12)).foregroundStyle(Color("white"))
        }.background(Color("#4caf50")).cornerRadius(6)
        VStack(alignment: .leading, spacing: 0) {
          Text("⚡ Fast").font(.system(size: 12)).foregroundStyle(Color("white"))
        }.background(Color("#ff9800")).cornerRadius(6)
      }
      Button("Tap Widget", action: { /* TODO: onPress */ })
    }.background(Color("#f8f9fa")).cornerRadius(12)
    }
}