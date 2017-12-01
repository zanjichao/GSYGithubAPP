/**
 * Created by guoshuyu on 2017/11/8.
 */


import {NetInfo, Platform, AsyncStorage} from 'react-native';
import I18n from '../style/i18n'
import * as Constant from '../style/constant'
import * as Code from './netwrokCode'
import handlerError from './netwrokCode'


export const CONTENT_TYPE_JSON = "application/json";
export const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";

class HttpManager {

    constructor() {
        this.optionParams = {
            timeoutMs: 15000,
            token: null,
            authorizationCode: null,
        };
    };

    /**
     * get请求
     *
     * @param url 请求url
     * @param header 外加头
     * @return {Promise.<*>}
     */
    async getFetch(url, header) {
        return this.netFetch(url, 'GET', null, null, header)
    }

    /**
     * 发起网络请求
     * @param url 请求url
     * @param method 请求方式
     * @param params 请求参数
     * @param json 是否需要json格式的参数请求
     * @param header 外加头
     * @return {Promise.<*>}
     */
    async netFetch(url, method = 'GET', params, json, header) {
        let isConnected = await NetInfo.isConnected.fetch().done;

        if (!isConnected) {
            return {
                result: false,
                code: Code.NETWORK_ERROR,
                msg: I18n('netError')
            }
        }

        let headers = {};
        if (header) {
            headers = Object.assign({}, headers, header)
        }

        //授权码
        if (!this.optionParams.authorizationCode) {
            let authorizationCode = await this.getAuthorization();
            if (authorizationCode)
                this.optionParams.authorizationCode = authorizationCode;
        }

        let requestParams;

        headers.Authorization = this.optionParams.authorizationCode;

        if (method !== 'GET') {
            if (json) {
                requestParams = this.formParamsJson(method, params, headers)
            } else {
                requestParams = this.formParams(method, params, headers)
            }
        } else {
            requestParams = this.formParams(method, params, headers)
        }

        let response = await this.requestWithTimeout(this.optionParams.timeoutMs, fetch(url, requestParams));

        if (__DEV__) {
            console.log('请求url: ', url);
            console.log('请求参数: ', requestParams);
            console.log('返回参数: ', response);
        }

        try {
            let responseJson = await response.json();
            if (response.status === 201 && responseJson.token) {
                this.optionParams.authorizationCode = 'token ' + responseJson.token;
                AsyncStorage.setItem(Constant.TOKEN_KEY, this.optionParams.authorizationCode);
            }

            if (response.status === 200 || response.status === 201) {
                return {
                    result: true,
                    code: Code.SUCCESS,
                    data: responseJson,
                    headers: response.headers
                }
            } else {
                return {
                    result: false,
                    code: response.status,
                    data: handlerError(response.status),
                }
            }
        } catch (e) {
            console.log(e, url);
            return {
                result: false,
                code: Code.NETWORK_JSON_EXCEPTION,
                response
            }
        }
    }

    /**
     * 清除授权
     */
    clearAuthorization() {
        this.optionParams.authorizationCode = null;
        AsyncStorage.removeItem(Constant.TOKEN_KEY);
    }


    /**
     * 获取授权token
     */
    async getAuthorization() {
        let token = await AsyncStorage.getItem(Constant.TOKEN_KEY);
        if (!token) {
            let basic = await AsyncStorage.getItem(Constant.USER_BASIC_CODE);
            if (!basic) {
                //提示输入账号密码
            } else {
                //通过 basic 去获取token，获取到设置，返回token
                return `Basic ${basic}`;
            }
        } else {
            this.optionParams.authorizationCode = token;
            return token;
        }

    }

    /**
     * 格式化json请求参数
     */
    formParamsJson(method, params, headers) {
        const body = JSON.stringify(params);
        const req = {
            method: method,
            headers: new Headers({
                'Content-Type': CONTENT_TYPE_JSON,
                ...(headers || {})
            }),
            body
        };
        return req
    }

    /**
     * 格式化表单请求参数
     */
    formParams(method, params, headers) {
        const str = [];
        for (let p in params) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
        }
        let body = null;
        if (str.length > 0) {
            body = str.join("&");
        }
        const req = {
            method: method,
            headers: new Headers({
                    'Content-Type': CONTENT_TYPE_FORM,
                    ...(headers || {})
                }
            ),
            body
        };
        return req
    }

    /**
     * 超时管理
     */
    requestWithTimeout(ms, promise) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject({
                    status: Code.NETWORK_TIMEOUT,
                    message: I18n('netTimeout')
                })
            }, ms);
            promise.then(
                (res) => {
                    clearTimeout(timeoutId);
                    resolve(res);
                },
                (err) => {
                    clearTimeout(timeoutId);
                    reject(err);
                }
            );
        })
    }

}

export default new HttpManager();