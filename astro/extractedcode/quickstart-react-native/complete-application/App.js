import {useEffect, useState} from 'react';
import Constants from 'expo-constants';
import CurrencyInput from 'react-native-currency-input';
import styles from './changebank.style';
import {openAuthSessionAsync} from 'expo-web-browser';
import {Text, TouchableOpacity, View} from 'react-native';
import {
  exchangeCodeAsync,
  fetchUserInfoAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  AuthRequest,
  AuthSessionResult
} from 'expo-auth-session';
import {Image} from 'expo-image';
import {StatusBar} from 'expo-status-bar';

export default function App() {
  /**
   * This will hold the access token and the user details after successful authorization
   */
  const [authResponse, setAuthResponse] = useState(null);

  /**
   * This is what the ChangeBank app will use to make change
   */
  const [amount, setAmount] = useState(0);

  /**
   * This is a helper function from expo-auth-session to retrieve the URLs used for authorization
   */
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_FUSIONAUTH_URL);

  /**
   * Creating a new Redirect URI using the scheme configured in app.json.
   * Expo Go will override this with a local URL when developing.
   */
  const redirectUri = makeRedirectUri({
    scheme: Constants.expoConfig.scheme,
    path: 'redirect',
  });

  /**
   * useAuthRequest() is another helper function from expo-auth-session that handles the authorization request.
   * It returns a promptLogin() function that should be called to initiate the process.
   */
  const [requestLogin, responseLogin, promptLogin] = useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FUSIONAUTH_CLIENT_ID,
    scopes: ['openid', 'offline_access'],
    usePKCE: true,
    redirectUri,
  }, discovery);

  /**
   * We do the same thing as above but for the user registration endpoint.
   */
  const [requestRegister, responseRegister, promptRegister] = useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FUSIONAUTH_CLIENT_ID,
    scopes: ['openid', 'offline_access'],
    usePKCE: true,
    redirectUri,
  }, (discovery) ? {
    ...discovery,
    authorizationEndpoint: discovery.authorizationEndpoint.replace('/authorize', '/register')
  } : null);

  /**
   * To log the user out, we redirect to the end session endpoint
   *
   * @return {void}
   */
  const logout = () => {
    const params = new URLSearchParams({
      client_id: process.env.EXPO_PUBLIC_FUSIONAUTH_CLIENT_ID,
      post_logout_redirect_uri: redirectUri,
    });
    openAuthSessionAsync(discovery.endSessionEndpoint + '?' + params.toString(), redirectUri)
      .then((result) => {
        if (result.type !== 'success') {
          handleError(new Error('Please, confirm the logout request and wait for it to finish.'));
          console.error(result);
          return;
        }
        setAuthResponse(null);
      });
  };

  /**
   * Auxiliary function to handle displaying errors
   *
   * @param {Error} error
   */
  const handleError = (error) => {
    console.error(error);
    alert(error.message);
  };

  /**
   * This will handle login and register operations
   *
   * @param {AuthRequest} request
   * @param {AuthSessionResult} response
   */
  const handleOperation = (request, response) => {
    if (!response) {
      return;
    }

    /**
     * If something wrong happened, we call our error helper function
     */
    if (response.type !== 'success') {
      handleError(response.error || new Error(`Operation failed: ${response.type}`));
      return;
    }

    /**
     * If the authorization process worked, we need to exchange the authorization code for an access token.
     */
    exchangeCodeAsync({
      clientId: process.env.EXPO_PUBLIC_FUSIONAUTH_CLIENT_ID,
      code: response.params.code,
      extraParams: {
        code_verifier: request.codeVerifier,
      },
      redirectUri,
    }, discovery).then((response) => {
      // Now that we have an access token, we can call the /oauth2/userinfo endpoint
      fetchUserInfoAsync(response, discovery).then((userRecord) => setAuthResponse({
        accessToken: response.accessToken,
        user: userRecord,
      })).catch(handleError);
    }).catch(handleError);
  };

  /*
   * This is a React Hook that will call the handleOperation() method
   * whenever the login process redirects from the browser to our app.
   */
  useEffect(() => {
    handleOperation(requestLogin, responseLogin);
  }, [responseLogin]);

  /*
   * This is a React Hook that will call the handleOperation() method
   * whenever the signup process redirects from the browser to our app.
   */
  useEffect(() => {
    handleOperation(requestRegister, responseRegister);
  }, [responseRegister]);

  /**
   * Making change for our ChangeBank app
   */
  const amountCents = amount * 100;
  const nickels = Math.floor(amountCents / 5);

  return (
      <View style={styles.container}>
        <StatusBar style="auto"/>
        <View style={[styles.pageHeader, {marginTop: Constants.statusBarHeight}]}>
          <View style={styles.logoHeader}>
            <Image
                source={require('./assets/changebank.svg')}
                style={styles.image}
                contentFit="contain"
                transition={1000}
            />
            <View style={styles.hRow}>
              {(authResponse) ? (
                  <>
                    <Text style={styles.headerEmail}>{authResponse.user.email}</Text>
                    <TouchableOpacity disabled={!requestLogin} onPress={() => logout()}>
                      <Text style={styles.buttonLg}>Log out</Text>
                    </TouchableOpacity>
                  </>
              ) : (
                  <>
                    <TouchableOpacity disabled={!requestLogin} onPress={() => promptLogin()}>
                      <Text style={styles.buttonLg}>Log in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={!requestLogin} onPress={() => promptRegister()}>
                      <Text style={styles.buttonLg}>Register</Text>
                    </TouchableOpacity>
                  </>
              )}
            </View>
          </View>

          <View style={styles.menuBar}>
            <Text style={styles.menuLink}>{(authResponse) ? 'Make Change' : 'Home'}</Text>
          </View>
        </View>

        <View style={styles.appContainer}>
          {(authResponse) ? (
              <>
                <Text style={styles.h1}>We Make Change</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.changeLabel}>Amount in USD:</Text>
                  <CurrencyInput
                      prefix="$ "
                      delimiter=","
                      separator="."
                      value={amount}
                      onChangeValue={setAmount}
                      style={styles.changeInput}
                  />
                </View>
                <Text style={styles.changeMessage}>
                  We can make change for ${(amount || 0).toFixed(2)} with {nickels} nickels and{' '}
                  {Math.round(amountCents % 5)} pennies!
                </Text>
              </>
          ) : (
              <Text style={styles.h1}>Log in to manage your account</Text>
          )}
        </View>
      </View>
  );
}
