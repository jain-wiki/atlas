import axios from 'axios'
import { Notify } from 'quasar';

import router from "../router";

import { VITE_APP_API_URL } from '@/helper/constants.ts'
import { prettifyError } from 'zod/v4/core';

const axiosClient = axios.create({
  baseURL: VITE_APP_API_URL,
  withCredentials: true, // Include cookies in requests
})

axiosClient.interceptors.request.use(
  async function (request) {
    // 1. Check if the request url is to the domain of the API
    // if (request.baseURL === undefined) {
    //   // If the request is not to the API, return the request as it is
    //   return request
    // }
    // if (request.baseURL.startsWith(VITE_APP_API_URL)) {
    //   // Since we are using better-auth, the cookies will be set automatically
    //   // So, this code is currently comment out
    // }
    // 4. Return the request
    return request
  }
);

axiosClient.interceptors.response.use(
  // Intercept success 🟢
  async function (response) {
    // Using try catch, as in an edge case if something goes wrong, we don't want to skip returning response.
    try {

      const show = response?.data?.show;
      const message = response?.data?.message;
      const success = response?.data?.success;
      if (show && message) {
        Notify.create({
          message,
          type: success ? 'positive' : 'negative',
          timeout: durationShow(message),
          position: 'bottom',
          progress: true,
        });
      }
    } catch (error) {
      console.error('Not able to Show Notify', error);
    }
    return response
  },

  // Intercept Error 🔴
  async function (error) {
    let customMsg = ''
    // Intercept Error
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (Array.isArray(error.response.data?.error?.issues)) { // It means Zod error
            customMsg = prettifyError(error.response.data.error);
          }
          break
        case 412:
        case 401:

          router.replace({ name: 'Login' });
          break;

        default:
          break;
      }

    }

    // Show Notify notification
    try {
      const message = customMsg || error.response?.data?.message || error.message;
      Notify.create({
        message,
        type: 'negative',
        timeout: durationShow(message),
        position: 'bottom',
        progress: true,
      });
    } catch (err2) {
      console.error('Not able to Show Notify', err2);
    }

    return Promise.reject(error);
  }
);

function durationShow(msg: string) {
  msg = msg.toString();
  const wordsCount = msg.split(' ').length;
  if (wordsCount < 3) {
    return 1800
  } else if (wordsCount < 5) {
    return 2100
  } else if (wordsCount < 9) {
    return 2800
  } else {
    return 4000
  }
}


// Exporting both axios,
//  as the axiosClient has auth token. Which should not be used in any other requests
export { axiosClient as Ax, axios }
