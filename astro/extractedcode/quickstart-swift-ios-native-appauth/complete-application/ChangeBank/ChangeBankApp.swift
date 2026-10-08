//
//  Change_BankApp.swift
//  Change Bank
//

import SwiftUI

@main
struct ChangeBankApp: App {
    var userAuth = UserAuth()
    var body: some Scene {
    
        WindowGroup {
            ContentView()
                .environmentObject(userAuth)
                .preferredColorScheme(.light)
        }
    }
}
