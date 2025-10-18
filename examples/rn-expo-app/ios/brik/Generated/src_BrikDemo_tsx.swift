import SwiftUI

struct src_BrikDemo_tsx: View {
    var body: some View {
    VStack(alignment: .center, spacing: 12) {
      Text("Brik 👋").font(.system(size: 24)).fontWeight(.bold)
      AsyncImage(url: URL(string: "https://picsum.photos/200")).frame(width: 200, height: 120).cornerRadius(12)
      VStack(alignment: .leading, spacing: 0) {
        Text("Write once in JSX, run native as SwiftUI & Compose.")
      }.background(Color(.sRGB, red: 0.933, green: 0.933, blue: 1.000, opacity: 1.000)).cornerRadius(8).padding(12)
      Button("Press me", action: { /* TODO: onPress */ }).background(Color(.sRGB, red: 0.231, green: 0.510, blue: 0.965, opacity: 1.000)).cornerRadius(8).padding(12)
    }.padding(16)
    }
}