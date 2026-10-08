//
//  ContentView.swift
//  ChangeBank
//

import SwiftUI
import AppAuth


struct ContentView: View {
    @EnvironmentObject var userAuth: UserAuth

    var body: some View {
            if userAuth.isLoggedIn {
                
                // Top logo
                VStack(alignment: .leading) {
                    HStack {
                        Image("changebank")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 150)
                            .padding()
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .topLeading)
                    
                    
                    TabView {
                        HomeView().tabItem {
                            Label("Home", systemImage: "house")
                        }
                        MakeChangeView().tabItem {
                            Label("Make Change", systemImage: "centsign.circle")
                        }
                    }.accentColor(Color(red: 0.0353, green: 0.3882, blue: 0.1412))
                }
            } else {
                LoginView()
            }
    }

}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}



