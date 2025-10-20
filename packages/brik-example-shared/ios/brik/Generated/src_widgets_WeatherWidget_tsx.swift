import SwiftUI

struct src_widgets_WeatherWidget_tsx: View {
    var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .center, spacing: 0) {
        VStack(alignment: .leading, spacing: 0) {
          Text("San Francisco").font(.system(size: 24)).fontWeight(.bold).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
          Text("Partly Cloudy").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.878, green: 0.878, blue: 0.878, opacity: 1.000))
        }
        Spacer()
        VStack(alignment: .leading, spacing: 0) {
          Text("72°").font(.system(size: 48)).fontWeight(.regular).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
        }
      }
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .center, spacing: 0) {
          VStack(alignment: .leading, spacing: 0) {
            Text("Mon").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
            Text("68°").font(.system(size: 18)).fontWeight(.regular).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
          }
          VStack(alignment: .leading, spacing: 0) {
            Text("Tue").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
            Text("70°").font(.system(size: 18)).fontWeight(.regular).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
          }
          VStack(alignment: .leading, spacing: 0) {
            Text("Wed").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
            Text("75°").font(.system(size: 18)).fontWeight(.regular).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
          }
          VStack(alignment: .leading, spacing: 0) {
            Text("Thu").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
            Text("73°").font(.system(size: 18)).fontWeight(.regular).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
          }
        }
      }
      Button("Refresh", action: { /* TODO: onPress */ }).background(Color(.sRGB, red: 1.000, green: 1.000, blue: 0.125, opacity: 1.000)).cornerRadius(6).padding(8)
    }.background(Color(.sRGB, red: 0.290, green: 0.565, blue: 0.886, opacity: 1.000)).cornerRadius(12).padding(16)
    }
}