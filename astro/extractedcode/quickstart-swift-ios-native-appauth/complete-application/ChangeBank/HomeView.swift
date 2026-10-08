//
//  HomeView.swift
//  ChangeBank
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var userAuth: UserAuth
    var body: some View {
        VStack{
            Text("Welcome \(userAuth.given_name) \(userAuth.family_name)")
                .padding(.bottom, 20).font(.headline)
            Text("Your balance is:")
            Text("$0.00").font(.largeTitle)
            Button("Log out"){
                userAuth.logout()
            }.buttonStyle(SecondaryButtonStyle())
        
        }
    }
    
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
