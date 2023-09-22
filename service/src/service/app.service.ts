import { Injectable } from '@nestjs/common';
import { FileService } from 'src/service/file';
import {ChatglmService} from 'src/service/chatglm'
import { BingService } from './bing';


@Injectable()
export class AppService {

 //chatglm交互
    //自由对话
  async chat(body) {
    const res=new ChatglmService
    return res.chat(body)
  }
    //文档问答
  async chatfile(body) {
    const res=new ChatglmService
    return res.chatfile(body)
  }

  //文件相关处理
     //文件向量化
  async refactorVectorStore() {
    const res=new FileService
    return res.refactorVectorStore()
  }
    //获取文件列表
  async getFileList() {
    const res=new FileService
    return res.getFileList()
  }
  //删除文件
  async deleteFile(fileName) {
    const res=new FileService
    return res.deleteFile(fileName)
  }

  //bing搜索
  async bingsearch(body){
    const res=new BingService
    return res.search(body)
  }

  // 初始化向量数据库
  async initVectorStore() {
    const res = new FileService();
    return res.initVectorStore();
  }
}
