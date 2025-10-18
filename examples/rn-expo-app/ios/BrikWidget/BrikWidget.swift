import WidgetKit
import SwiftUI

@main
struct BrikWidgets: WidgetBundle {
    var body: some Widget {
        BrikWidget()
    }
}

struct BrikWidget: Widget {
    let kind: String = "BrikWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            src_AdvancedDemo_tsx()
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemMedium])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        completion(SimpleEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let timeline = Timeline(entries: [SimpleEntry(date: Date())], policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
}
