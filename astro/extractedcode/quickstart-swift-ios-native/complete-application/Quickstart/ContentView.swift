import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authState: FusionAuthStateObject

    var body: some View {
        VStack {
            if authState.isLoggedIn() {
                LoggedInView()
            } else {
                LoginView()
            }
        }
        .padding()
    }
}
