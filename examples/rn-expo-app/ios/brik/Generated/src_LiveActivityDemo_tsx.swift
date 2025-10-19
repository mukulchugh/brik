import SwiftUI

struct src_LiveActivityDemo_tsx: View {
    var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .center, spacing: 12) {
        VStack(alignment: .leading, spacing: 0) {
          Text("🍕").font(.system(size: 24)).foregroundStyle(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000))
        }.frame(width: 50, height: 50).background(Color(.sRGB, red: 0.231, green: 0.510, blue: 0.965, opacity: 1.000)).cornerRadius(25)
        VStack(alignment: .center, spacing: 4) {
          Text("Order #12345").font(.system(size: 16)).fontWeight(.bold)
          Text("From Acme Pizza").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
        }
      }
      ProgressView(value: 0.65).frame(height: 8).cornerRadius(4)
      HStack(alignment: .center, spacing: 8) {
        Text("Delivering").font(.system(size: 14)).fontWeight(.medium).foregroundStyle(Color(.sRGB, red: 0.216, green: 0.255, blue: 0.318, opacity: 1.000))
        Text("• ETA: 15 min").font(.system(size: 14)).foregroundStyle(Color(.sRGB, red: 0.420, green: 0.447, blue: 0.502, opacity: 1.000))
      }
    }.background(Color(.sRGB, red: 1.000, green: 1.000, blue: 1.000, opacity: 1.000)).cornerRadius(16).padding(16)
    }
}