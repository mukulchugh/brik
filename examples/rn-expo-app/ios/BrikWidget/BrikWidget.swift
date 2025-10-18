import WidgetKit
import SwiftUI

@main
struct BrikWidgets: WidgetBundle {
  var body: some Widget {
    BrikWidget()
  }
}

struct BrikWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "BrikWidget", provider: Provider()) { entry in
      src_BrikDemo_tsx()
    }
  }
}

struct Provider: TimelineProvider {
  typealias Entry = SimpleEntry
  func placeholder(in context: Context) -> SimpleEntry { SimpleEntry(date: Date()) }
  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) { completion(SimpleEntry(date: Date())) }
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    let timeline = Timeline(entries: [SimpleEntry(date: Date())], policy: .never)
    completion(timeline)
  }
}

struct SimpleEntry: TimelineEntry { let date: Date }