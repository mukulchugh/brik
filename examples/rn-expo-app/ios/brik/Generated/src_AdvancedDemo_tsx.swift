import SwiftUI

struct src_AdvancedDemo_tsx: View {
    var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .center, spacing: 12) {
        AsyncImage(url: URL(string: "https://picsum.photos/60")).frame(width: 60, height: 60).cornerRadius(30)
        VStack(alignment: .center, spacing: 4) {
          Text("John Doe").font(.system(size: 20)).fontWeight(.bold).foregroundStyle(Color(.sRGB, red: 0.102, green: 0.102, blue: 0.102, opacity: 1.000))
          Text("Software Engineer • San Francisco").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
        }
      }
      HStack(alignment: .center, spacing: 8) {
        VStack(alignment: .leading, spacing: 0) {
          Text("2.5K").font(.system(size: 24)).fontWeight(.bold).foregroundStyle(Color(.sRGB, red: 0.102, green: 0.102, blue: 0.102, opacity: 1.000))
          Text("Followers").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
        }
        Color.clear.frame(width: 1).background(Color(.sRGB, red: 0.820, green: 0.835, blue: 0.859, opacity: 1.000))
        VStack(alignment: .leading, spacing: 0) {
          Text("342").font(.system(size: 24)).fontWeight(.bold).foregroundStyle(Color(.sRGB, red: 0.102, green: 0.102, blue: 0.102, opacity: 1.000))
          Text("Following").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
        }
        Color.clear.frame(width: 1).background(Color(.sRGB, red: 0.820, green: 0.835, blue: 0.859, opacity: 1.000))
        VStack(alignment: .leading, spacing: 0) {
          Text("48").font(.system(size: 24)).fontWeight(.bold).foregroundStyle(Color(.sRGB, red: 0.102, green: 0.102, blue: 0.102, opacity: 1.000))
          Text("Posts").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
        }
      }.background(Color(.sRGB, red: 0.953, green: 0.957, blue: 0.965, opacity: 1.000)).cornerRadius(12).padding(12)
      VStack(alignment: .center, spacing: 8) {
        Text("Today's Progress").font(.system(size: 14)).fontWeight(.medium).foregroundStyle(Color(.sRGB, red: 0.216, green: 0.255, blue: 0.318, opacity: 1.000))
        ProgressView(value: 0.65).frame(height: 8).cornerRadius(4)
        Text("65% Complete • 6.5 hours tracked").font(.system(size: 12)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
      }
      HStack(alignment: .center, spacing: 8) {
        Button("Open App", action: { /* TODO: onPress */ }).background(Color(.sRGB, red: 0.231, green: 0.510, blue: 0.965, opacity: 1.000)).cornerRadius(8).padding(12)
        Button("Refresh", action: { /* TODO: onPress */ }).background(Color(.sRGB, red: 0.898, green: 0.906, blue: 0.922, opacity: 1.000)).cornerRadius(8).padding(12)
      }
    }.background(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000)).cornerRadius(16).shadow(color: Color(.sRGB, red: 0.000, green: 0.000, blue: 0.000, opacity: 1.000).opacity(0.1), radius: 8, x: 0, y: 2).padding(16)
    }
}