//
//  Styles.swift
//  Change Bank
//

import Foundation
import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    var color = Color(red: 0.0353, green: 0.3882, blue: 0.1412)
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.padding([
                                        .trailing, .leading], 48)
            .padding([.top, .bottom], 12).background(color)
            .foregroundColor(.white).clipShape(Capsule())
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    var color: Color = .white
    var textColor = Color(red: 0.0353, green: 0.3882, blue: 0.1412)

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding([.trailing, .leading], 48)
            .padding([.top, .bottom], 12)
            .background(color)
            .foregroundColor(textColor)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(textColor, lineWidth: 2)) // overlay with Capsule stroke for the border
    }
}

struct CurrencyTextFieldStyle: TextFieldStyle {
    // swiftlint:disable:next identifier_name
    func _body(configuration: TextField<Self._Label>) -> some View {
        HStack {
            Text("$").foregroundColor(Color(red: 0.0353, green: 0.3882, blue: 0.1412))
            configuration
        }
        .padding(10)
        .overlay(
            Capsule().stroke(Color(red: 0.0353, green: 0.3882, blue: 0.1412), lineWidth: 2)
        )
        .keyboardType(.numberPad)
        .textContentType(.oneTimeCode)
    }
}
