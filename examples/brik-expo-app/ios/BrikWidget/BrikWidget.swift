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
            // Import your generated widget views here
            // Example: src_AdvancedDemo_tsx()
            WidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Brik Widget")
        .description("Native widget built with Brik")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    // App Group identifier - MUST match BrikWidgetManager
    let appGroupIdentifier = "group.com.anonymous.rnexpoapp.widgets"

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), widgetData: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), widgetData: getWidgetData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let widgetData = getWidgetData()

        let entry = SimpleEntry(date: currentDate, widgetData: widgetData)

        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    // Read widget data from shared UserDefaults
    private func getWidgetData() -> [String: Any]? {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            print("[Brik] Failed to access App Group: \(appGroupIdentifier)")
            return nil
        }

        // Read from the same key pattern as BrikWidgetManager
        let storageKey = "widget_data_BrikWidget"

        guard let jsonString = sharedDefaults.string(forKey: storageKey),
              let jsonData = jsonString.data(using: .utf8),
              let data = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            print("[Brik] No widget data found for key: \(storageKey)")
            return nil
        }

        return data
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let widgetData: [String: Any]?
}

struct WidgetEntryView: View {
    var entry: SimpleEntry

    var body: some View {
        if let data = entry.widgetData {
            // TODO: Replace with your generated widget view
            // Example: src_AdvancedDemo_tsx(data: data)
            VStack {
                Text("Brik Widget")
                    .font(.headline)
                Text("Data loaded: \(data.count) keys")
                    .font(.caption)
            }
        } else {
            VStack {
                Text("Brik Widget")
                    .font(.headline)
                Text("Waiting for data...")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
    }
}
