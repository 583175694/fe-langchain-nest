import * as fs from 'fs';
import {GlobalService} from 'src/service/global';
import { EmbeddingManager } from 'src/embeddings/embedding-manager';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HNSWLib } from 'langchain/vectorstores/hnswlib';

const PERSIST_DIRECTORY_CHINESE = 'docs/chroma/matplotlib/';

export class FileService {

  //上传文件向量化
  async refactorVectorStore() {
    const loader = new DirectoryLoader(
      "./fileUpload",
      {
        //".json": (path) => new JSONLoader(path, "/texts"),
        //".jsonl": (path) => new JSONLinesLoader(path, "/html"),
        ".txt": (path) => new TextLoader(path),
        ".docx": (path) => new DocxLoader(path),
        ".pdf": (path) => new PDFLoader(path),
        //".csv": (path) => new CSVLoader(path, "text"),
      }
    );
    // Split the docs into chunks
    // 文本切割,将文档拆分为块
    const textsplitter = new RecursiveCharacterTextSplitter({
      separators: ["\n\n", "\n", "。", "！", "？"],
      chunkSize: 400,
      chunkOverlap: 100,
    })
    const docs = await loader.loadAndSplit(textsplitter);
    // Load the docs into the vector store
    // 加载向量存储库
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      EmbeddingManager.getCurrentEmbedding()
    );
    GlobalService.globalVar=vectorStore
  }

  //获取本地文件列表
  async getFileList() {
    const directoryPath = './fileUpload';
    const files = fs.readdirSync(directoryPath);
    return files;
  }

  //删除文件
  async deleteFile(fileName) {
    const directoryPath = './fileUpload';
    fs.rmSync(`${directoryPath}/${fileName}`);
  }

  // 初始化向量数据库
  async initVectorStore() {
    try {
      const directoryPath = './fileUpload';
      const files = fs.readdirSync(directoryPath);
      const loadersChinese = files.map((res) => {
        const type = res.split('.')[1];
        if (type === 'txt') {
          return new TextLoader(`./fileUpload/${res}`)
        } else if (type === 'docx') {
          return new DocxLoader(`./fileUpload/${res}`)
        } else if (type === 'pdf') {
          console.log(`./fileUpload/${res}`);
          return new PDFLoader(`./fileUpload/${res}`);
        }
      })
      let docs = [];

      for (let i = 0; i < loadersChinese.length; i++) {
        docs = docs.concat(await loadersChinese[i].load());
      }

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800, // 每个文本块的大小。这意味着每次切分文本时，会尽量使每个块包含 1500 个字符。
        chunkOverlap: 100, // 每个文本块之间的重叠部分。
        separators: ["\n\n", "\n", "。", "！", "？"],
      });

      const splits = await textSplitter.splitDocuments(docs);

      console.log(splits.length); // 40

      // 从文档创建一个向量存储。
      const vectorStore = await HNSWLib.fromDocuments(splits, EmbeddingManager.getCurrentEmbedding());

      // 初始化完数据库后，存成本地文件
      await vectorStore.save(PERSIST_DIRECTORY_CHINESE);
      console.log('向量数据库初始化成功!');

      GlobalService.globalVar=vectorStore;
    } catch(err) {
      console.log(err);
    }
  }
}
