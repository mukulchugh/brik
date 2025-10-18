import SwiftUI

struct src_SimpleTest_tsx: View {
    var body: some View {
    VStack(alignment: .center, spacing: 12) {
      Text("Hello").font(.system(size: 24))
      AsyncImage(url: URL(string: "https://picsum.photos/200")).cornerRadius(12).frame(width: 200).frame(height: 120)
      Button("Press me", action: { /* TODO: onPress */ })
    }
    }
}