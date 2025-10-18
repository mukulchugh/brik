import SwiftUI

struct src_WidgetDemo_tsx: View {
    var body: some View {
    VStack(alignment: .center, spacing: 8) {
      Text("📱 Widget Demo").font(.system(size: 18)).fontWeight(.bold)
      VStack(alignment: .leading, spacing: 0) {
        Text("This component can be used as a homescreen widget!").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.098, green: 0.463, blue: 0.824, opacity: 1.000))
      }.background(Color(.sRGB, red: 0.890, green: 0.949, blue: 0.992, opacity: 1.000)).cornerRadius(8).padding(8)
      AsyncImage(url: URL(string: "https://picsum.photos/150/100")).frame(width: 150, height: 100).cornerRadius(8)
      HStack(alignment: .center, spacing: 8) {
        VStack(alignment: .leading, spacing: 0) {
          Text("✅ Active").font(.system(size: 12)).foregroundStyle(Color("white"))
        }.background(Color(.sRGB, red: 0.298, green: 0.686, blue: 0.314, opacity: 1.000)).cornerRadius(6).padding(6)
        VStack(alignment: .leading, spacing: 0) {
          Text("⚡ Fast").font(.system(size: 12)).foregroundStyle(Color("white"))
        }.background(Color(.sRGB, red: 1.000, green: 0.596, blue: 0.000, opacity: 1.000)).cornerRadius(6).padding(6)
      }
      Button("Tap Widget", action: { /* TODO: onPress */ }).background(Color(.sRGB, red: 0.545, green: 0.361, blue: 0.965, opacity: 1.000)).cornerRadius(8).padding(12)
    }.background(Color(.sRGB, red: 0.973, green: 0.976, blue: 0.980, opacity: 1.000)).cornerRadius(12).padding(12)
    }
}