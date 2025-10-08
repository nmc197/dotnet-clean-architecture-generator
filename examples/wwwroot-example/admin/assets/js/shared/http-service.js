"use strict";
class HttpService {

    /**
     * 
     * @param {string} method
     * @param {string} url
     * @param {object} data
     * @param {string} contentType
     * @param {boolean} isFormData
     * @returns
     */
    _sendRequest(method, url, data = null, contentType = "application/json", isFormData = false) {
        return new Promise((resolve, reject) => {
            const makeRequest = (token, formattedData) => {
                const ajaxOptions = {
                    type: method,
                    url: url,
                    data: formattedData,
                    contentType: isFormData ? false : contentType,
                    processData: isFormData ? false : true,
                    beforeSend: function (xhr) {
                        if (token) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        }
                    },
                    success: resolve,
                    error: async function (jqXHR) {
                        if (jqXHR.status === AppSettings.httpStatusCode.UNAUTHORIZED) {
                            try {
                                const newToken = await TokenService.refreshToken();
                                makeRequest(newToken, formattedData); // Retry after refresh
                            } catch (e) {
                                reject(jqXHR);
                            }
                        } else {
                            reject(jqXHR);
                        }
                    }
                };

                $.ajax(ajaxOptions);
            };

            let formattedData = data;
            if (data && !isFormData && typeof data !== "string" && contentType === "application/json") {
                formattedData = JSON.stringify(data);
            }

            makeRequest(TokenService.getAccessToken(), formattedData);
        });
    }

    getAsync(url) {
        return this._sendRequest("GET", url);
    }

    postAsync(url, data, contentType = "application/json") {
        return this._sendRequest("POST", url, data, contentType);
    }

    putAsync(url, data, contentType = "application/json") {
        return this._sendRequest("PUT", url, data, contentType);
    }

    deleteAsync(url) {
        return this._sendRequest("DELETE", url);
    }

    postFormDataAsync(url, formData) {
        if (!(formData instanceof FormData)) {
            throw new Error("Data must be FormData");
        }
        return this._sendRequest("POST", url, formData, null, true);
    }
}

const httpService = new HttpService();

