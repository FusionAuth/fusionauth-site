//
//  LoginView.swift
//  ChangeBank
//

import SwiftUI
import AppAuth



struct LoginView: View {
    @EnvironmentObject var userAuth: UserAuth
    var body: some View {
        VStack {
            Image("changebank")
                .resizable()
                .aspectRatio(contentMode: .fit)
            
            Text("Welcome to ChangeBank!")
            Button("Login"){
                userAuth.login()
            }.buttonStyle(PrimaryButtonStyle())
        }
        .padding()
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
