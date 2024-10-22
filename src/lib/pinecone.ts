import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(file_Key: string) {
  //obtaining the pdf
  console.log(`downloading s3 into file system!`);
  const file_name = await downloadFromS3(file_Key);
  if (!file_name) {
    throw new Error("couldn't download from s3");
  }
  const loader = new PDFLoader(file_name);
  console.log(loader);

  const pages = (await loader.load()) as PDFPage[];
  // console.log(pages);

  const documents = await Promise.all(pages.map(prepareDocument));
  //console.log(documents);

  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log(`Number of vectors generated: ${vectors.length}`);

  if (!vectors || vectors.length === 0) {
    throw new Error("No vectors generated to upsert into Pinecone.");
  }

  //uploading to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf-ai");
  const namespace = pineconeIndex.namespace(convertToAscii(file_Key));

  await namespace.upsert(vectors);
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent } = page;
  const { metadata } = page;

  pageContent = pageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  //console.log(docs);
  return docs;
}
