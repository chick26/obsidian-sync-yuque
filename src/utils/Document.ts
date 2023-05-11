// import * as yamlFront from "yaml-front-matter";
import { Base64 } from "js-base64";
import LarkClient from './LarkClient';

export interface DocumentConfig {
  originFile: string,
  slug: string,
  title: string,
  body: string,
}

export default class Document {
  body!: string;
  title!: string;
  slug!: string;
  lark: LarkClient;
  raw: string;
  id?: number;

  constructor(lark: LarkClient, file: string, title?: string) {
    this.lark = lark;
    this.title = title ?? '';
    this.raw = file;
  }

  async createDoc(layout?: string) {
    let body: any = [];
    let prevLine = '';

    const lines = this.raw?.split('\n') ?? [];
    for (const line of lines) {
      if (!this.title) {
        if (line.startsWith('# ')) {
          this.title = line.replace('# ', '');
          continue;
        }
        if (line.startsWith('====')) {
          this.title = prevLine;
          body.shift();
          continue;
        }
      }
      prevLine = line;
      body.push(line);
    }

    body = body.join('\n').trim();

    this.title = this.title.trim();
    this.body = body;
    this.body = this.body + this.signature();

    this.loadConfig();

    return this;
  }

  signature() {
    return '\n\n---\n <sub>本文档由 chick26创建</sub>';
  }

  loadConfig() {
    this.slug = Base64.encode(this.title + '.md')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\\.\\-]/g, "");
  }

  dump() {
    this.createDoc();
    return {
      originFile: this.raw,
      slug: this.slug,
      title: this.title,
      body: this.body,
    };
  }

  validate() {
    const result: {
      valid: boolean;
      messages: string[];
    } = {
      valid: true,
      messages: [],
    };
    if (!this.title) {
      result.valid = false;
      result.messages.push('缺少文章标题');
    }
    if (!/\w+/.test(this.slug)) {
      result.valid = false;
      result.messages.push('文件名只能是字母、数字、_和-');
    }
    return result;
  }
}
