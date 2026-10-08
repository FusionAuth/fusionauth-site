import SwiftUI

struct MakeChangeView: View {
    @State private var dollarValue: String = ""
    @State private var nickels: Int = 0
    @State private var pennies: Int = 0
    @State private var changeOutput: String = ""
    var body: some View {
        VStack {
            Text("Make Change").font(.largeTitle)
            TextField("Enter dollar value", text: $dollarValue)
                .textFieldStyle(CurrencyTextFieldStyle())
                .frame(maxWidth: 200)
            Button("Make Change") {
                makeChange()
            }
            .buttonStyle(PrimaryButtonStyle())

            Text(changeOutput).padding([.top, .leading, .trailing], 50).font(.callout)
        }
        .padding()
    }

    private func makeChange() {
        guard var value = Double(dollarValue) else {
            print("no dollars found :( \(dollarValue)")
            changeOutput = "Please enter a dollar amount to convert. "
            return
        }
        value = Double(Int(value * 100)) / 100 // truncate to 2 decimals to look like money
        let totalPennies = Int(value * 100)
        nickels = totalPennies / 5
        pennies = totalPennies % 5

        let pennyUnit = pennies != 1 ? "pennies" : "penny"
        let nickelUnit = nickels != 1 ? "nickels" : "nickel"

        changeOutput = "We can make change for $\(value) with \(nickels) \(nickelUnit) and \(pennies) \(pennyUnit)"
    }
}
