import {StyleSheet, Text, View, Button} from 'react-native';
import React from 'react';
import {authorize, refresh, AuthConfiguration} from 'react-native-app-auth';
import {AuthConfig} from './micro/AuthConfig';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GraphManager} from './micro/GraphManager'
import { User } from '@microsoft/microsoft-graph-types';



const config: AuthConfiguration = {
  clientId: AuthConfig.appId,
  redirectUrl: 'graph-tutorial://react-native-auth/',
  scopes: AuthConfig.appScopes,
  additionalParameters: {prompt: 'select_account'},
  serviceConfiguration: {
    authorizationEndpoint:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
};

const App = () => {
  const login = async () => {
   try {
    const user: User = await GraphManager.getUserAsync();
    const result = await authorize(config);
    await AsyncStorage.setItem('userToken', result.accessToken);
    await AsyncStorage.setItem('refreshToken', result.refreshToken);
    await AsyncStorage.setItem('expireTime', result.accessTokenExpirationDate);
    console.log(user)
    // console.log('result :- ', result);
   } catch (error) {
     console.log("error :- ",error)
   }
  };


  const  getAccessTokenAsync = async () => {
    const expireTime = await AsyncStorage.getItem('expireTime');

    if (expireTime !== null) {
      // Get expiration time - 5 minutes
      // If it's <= 5 minutes before expiration, then refresh
      const expire = moment(expireTime).subtract(5, 'minutes');
      const now = moment();

      if (now.isSameOrAfter(expire)) {
        // Expired, refresh
        console.log('Refreshing token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        console.log(`Refresh token: ${refreshToken}`);
        const result = await refresh(config, {
          refreshToken: refreshToken || '',
        });

        // Store the new access token, refresh token, and expiration time in storage
        await AsyncStorage.setItem('userToken', result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken || '');
        await AsyncStorage.setItem(
          'expireTime',
          result.accessTokenExpirationDate,
        );

        return result.accessToken;
      }

      // Not expired, just return saved access token
      const accessToken = await AsyncStorage.getItem('userToken');
      return accessToken;
    }

    return null;
  };

  return (
    <View style={{justifyContent: 'center', flex: 1}}>
      <Text style={{marginBottom: '5%'}}>App</Text>
      <Button title="Log In" onPress={() => login()} />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
