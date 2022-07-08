import { requestUrl, RequestUrlParam } from 'obsidian';

export interface RequestOptions extends RequestUrlParam {
  baseURL?: string;
}
export default class NodeHttp {

  config: RequestOptions;

  constructor( config: RequestOptions ) {
    this.config = config;
  }

  async get(url: string) {
    try {
      const res = await requestUrl(
        {
          url: [this.config.baseURL, url].join(''), 
          headers: this.config.headers
        })
      return {
        data: res.json,
        status: res.status
      }
    } catch (error) {
      return {
        status: 500,
        data: error,
      }
    }
  }

  // async post(url: string, data: any) {
  //     const res = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //             'X-Auth-Token': this.token,
  //             'Access-Control-Allow-Origin': "*",
  //         },
  //         body: JSON.stringify(data),
  //     });
  //     return res.json();
  // }
}