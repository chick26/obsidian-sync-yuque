import NodeHttp from './Request';
import User from './User';
import { join } from 'path';

export default class LarkClient {
  config: any;
  client: NodeHttp;
  user?: User;

  constructor(token: string, user?: User) {
    const baseURL = 'https://www.yuque.com/api/v2';
    this.user = user;
    this.client = new NodeHttp(
      {
        baseURL: baseURL,
        url: '',
        headers: {
          'X-Auth-Token': token,
          "Access-Control-Allow-Origin": "*"
        }
      });
  }

  repoPath(path: string) {
    return join('/repos', this.config.lark.repo, path);
  }

  // createDoc(doc: any) {
  //   return this.client.post(this.repoPath('docs'), doc) as Promise<any>;
  // }

  // updateDoc(id: number, doc: any) {
  //   return this.client.put(this.repoPath(`/docs/${id}`), doc) as Promise<any>;
  // }

  // async getDoc(id: number | string) {
  //   const { data } = await this.client.get(this.repoPath(`/docs/${id}?raw=1`));
  //   return data.data;
  // }

  // async getDocs() {
  //   const { data } = await this.client.get(this.repoPath('/docs'));
  //   return data.data;
  // }

  // updateRepo(repo: any) {
  //   this.client.put(this.repoPath('/'), repo);
  // }

  // async getRepo() {
  //   const { data } = await this.client.get(this.repoPath('/'));
  //   return data.data;
  // }

  // async getRepoToc() {
  //   const { data } = await this.client.get(this.repoPath('/toc'));
  //   return data.data;
  // }

  async getRepos() {
    if (this.user) {
      const res = await this.client.get(`/users/${this.user.login}/repos`);
      return res;
    } else {
      return {
        status: 500,
        data: '请先登录'
      }
    }
  }

  async getUser() {
    const res = await this.client.get('/user');
    return res;
  }
}
