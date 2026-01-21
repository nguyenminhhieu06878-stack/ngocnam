import { ChromaClient } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { getEmbedding } from './aiService.js';

// ChromaDB client - connect without tenant for compatibility
const client = new ChromaClient({
  path: process.env.CHROMA_HOST || 'http://localhost:8000',
  tenant: 'default_tenant',
  database: 'default_database'
});

const COLLECTION_NAME = 'doan_thanh_nien_docs';

async function getCollection() {
  try {
    // Thử lấy collection, nếu không có thì tạo mới
    try {
      const collection = await client.getCollection({ name: COLLECTION_NAME });
      console.log('✅ Đã kết nối collection:', COLLECTION_NAME);
      return collection;
    } catch (e) {
      console.log('📝 Collection chưa tồn tại, đang tạo mới...');
      const collection = await client.createCollection({
        name: COLLECTION_NAME,
        metadata: { description: 'Tài liệu Đoàn thanh niên' }
      });
      console.log('✅ Đã tạo collection:', COLLECTION_NAME);
      return collection;
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối ChromaDB:', error.message);
    throw error;
  }
}

export async function embedDocument(documentId, content, metadata) {
  const collection = await getCollection();
  
  // Chia nhỏ văn bản thành chunks lớn hơn (1200 ký tự) với overlap 200 ký tự
  const chunks = splitIntoChunks(content, 1200, 200);
  const ids = [];
  const embeddings = [];
  const documents = [];
  const metadatas = [];
  
  console.log(`📝 Đang tạo embeddings cho ${chunks.length} chunks (chunk size: 1200, overlap: 200)...`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `${documentId}_chunk_${i}`;
    console.log(`   Chunk ${i + 1}/${chunks.length}...`);
    const embedding = await getEmbedding(chunks[i]);
    
    ids.push(chunkId);
    embeddings.push(embedding);
    documents.push(chunks[i]);
    metadatas.push({
      documentId,
      chunkIndex: i,
      ...metadata
    });
  }
  
  await collection.add({
    ids,
    embeddings,
    documents,
    metadatas
  });
  
  console.log(`✅ Đã tạo xong ${chunks.length} embeddings`);
  
  return documentId;
}

export async function searchSimilarDocuments(query, topK = 5, category = null) {
  const collection = await getCollection();
  const queryEmbedding = await getEmbedding(query);
  
  // Tạo where clause nếu có category filter
  const queryParams = {
    queryEmbeddings: [queryEmbedding],
    nResults: topK
  };
  
  if (category) {
    queryParams.where = { category };
  }
  
  const results = await collection.query(queryParams);
  
  return results;
}

function splitIntoChunks(text, chunkSize, overlap = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';
  let previousChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      
      // Tạo overlap: lấy 200 ký tự cuối của chunk hiện tại
      previousChunk = currentChunk.slice(-overlap);
      currentChunk = previousChunk + ' ' + sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  if (currentChunk && currentChunk.trim() !== previousChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
