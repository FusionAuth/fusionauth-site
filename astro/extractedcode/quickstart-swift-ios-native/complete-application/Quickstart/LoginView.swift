import SwiftUI
import FusionAuth

struct LoginView: View {
    @State private var errorWhileLogin = false
    @State private var error: String?

    /// Reads the optional `prompt` value injected by UI tests via the
    /// `--prompt-parameter <value>` launch argument.
    private var promptFromLaunchArguments: String? {
        let args = ProcessInfo.processInfo.arguments
        guard let idx = args.firstIndex(of: "--prompt-parameter"),
              args.indices.contains(idx + 1)
        else { return nil }
        return args[idx + 1]
    }

    var body: some View {
        VStack {
            Image("changebank")
                .resizable()
                .scaledToFit()

            Text("Welcome to ChangeBank!")

            Button("Login") {
                Task {
                    do {
                        try await AuthorizationManager
                            .oauth()
                            .authorize(options: OAuthAuthorizeOptions(prompt: promptFromLaunchArguments))
                    } catch let error as NSError {
                        self.errorWhileLogin = true
                        self.error = error.localizedDescription
                    }
                }
            }.buttonStyle(PrimaryButtonStyle())
        }
        .padding()
        .alert(
            "Error occurred while logging in",
            isPresented: $errorWhileLogin,
            presenting: error
        ) { _ in
            Button("OK", role: .cancel) { errorWhileLogin = false }
        } message: { error in
            Text(error)
        }
    }
}
