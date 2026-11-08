import SwiftUI
import FusionAuth

struct LoggedInView: View {
    @EnvironmentObject private var authState: FusionAuthStateObject

    var body: some View {
        VStack(spacing: 0) {
            // Header with app logo
            HStack {
                Image("changebank")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 150)
                    .padding()
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)

            // Configuration indicator
            VStack(alignment: .leading, spacing: 16) {
                Label("Active Configuration", systemImage: "gear")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text(authState.getCurrentConfigurationDescription())
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(4)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            Divider()

            // Tab view with content
            TabView {
                HomeView().tabItem {
                    Label("Home", systemImage: "house")
                }
                MakeChangeView().tabItem {
                    Label("Make Change", systemImage: "centsign.circle")
                }
            }.accentColor(Color(red: 0.0353, green: 0.3882, blue: 0.1412))
        }
    }
}
