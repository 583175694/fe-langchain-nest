import { ChatGlm6BLLM } from "../chat_models/chatglm-6b";
import { LLMChain, loadQAStuffChain } from "langchain/chains";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";
import { GlobalService } from "src/service/global";

export class ChatglmService {
  //文档问答
  async chatfile(body) {
    const { message, history } = body;
    console.log("step1", message, history);

    // 向量数据库检索
    const vectorStore = GlobalService.globalVar;
    const docs = await vectorStore.similaritySearch(message, 3);
    console.log({ docs });
    const fileSourceStr = docs.map((res) => {
      return res.metadata.source;
    });
    const chat = new ChatGlm6BLLM({ temperature: 0.1, history: history });
    // const translationPrompt = ChatPromptTemplate.fromPromptMessages([
    //   SystemMessagePromptTemplate.fromTemplate(
    //     `基于已知内容, 回答用户问题。如果无法从中得到答案，请说'没有足够的相关信息'。已知内容:${docs[0].pageContent}`
    //   ),
    //   /* new MessagesPlaceholder("history"), */
    //   HumanMessagePromptTemplate.fromTemplate("{text}"),
    // ]);

    // const chain = new LLMChain({
    //   prompt: translationPrompt,
    //   llm: chat,
    // });
    // const response = await chain.call({
    //   text: message,
    // });

    // TODO
    const chainA = loadQAStuffChain(chat);
    const response = await chainA.call({
      input_documents: docs,
      question: message,
    });

    return {
      response: response,
      url: fileSourceStr.join("\n"),
    };
  }

  //自由对话
  async chat(body) {
    const { message, history } = body;
    const chat = new ChatGlm6BLLM({ temperature: 0.01, history: history });
    const translationPrompt = ChatPromptTemplate.fromPromptMessages([
      /*   SystemMessagePromptTemplate.fromTemplate(
        ), */
      /* new MessagesPlaceholder("history"), */
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    const chain = new LLMChain({
      prompt: translationPrompt,
      llm: chat,
    });
    const response = await chain.call({
      text: message,
    });

    return response;
  }
}
