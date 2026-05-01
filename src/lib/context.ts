import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("chatpdf-ai");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 8,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const strictQualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.55
  );

  type metaData = {
    text: string;
    pageNumber: number;
  };

  // Fallback: for broad summary questions ("what is this PDF about?")
  // semantic scores can be lower; still return top chunks instead of empty context.
  const docs =
    strictQualifyingDocs.length > 0
      ? strictQualifyingDocs
      : matches.filter((match) => Boolean(match.metadata?.text)).slice(0, 5);

  const context = docs.map((match) => (match.metadata as metaData).text).join("\n");
  return context.substring(0, 6000);
}