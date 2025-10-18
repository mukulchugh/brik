import SwiftUI

struct src_SimpleTest_tsx: View {
    var body: some View {
    VStack(alignment: .center, spacing: 12) {
      Text("Hello").font(.system(size: 24)).fontWeight(.bold)
      AsyncImage(url: URL(string: "https://picsum.photos/200")).cornerRadius(12).frame(width: 200).frame(height: 120)
      VStack(alignment: .leading, spacing: 0) {
        Text("Write once in JSX, run native as SwiftUI & Compose.")
      }.background(Color("#eef")).cornerRadius(8)
      Button("Press me", action: { /* TODO: onPress */ })
    }
    }
}