

ChatPDF-AI is a web application that combines document management and AI-powered chat functionalities. Users can upload PDF files, view previously uploaded files, and interact with their content through an AI chat interface. The application uses cutting-edge technologies for seamless file handling, vector storage, and conversational AI.

Features
Authentication: Users log in or sign up using Clerk.
PDF Upload: Upload and manage PDF files, which are stored securely in AWS S3.
AI Interaction: Chat with AI about the content of uploaded PDFs, powered by OpenAI's API.
Chat History: View all previously uploaded PDFs and their associated chats in a centralized interface.
Efficient Vector Storage: PDF content is converted to vectors using OpenAI's embeddings and stored in PineconeDB for fast retrieval.
Technology Stack
Frontend: Built with Next.js for a modern, responsive UI.
Database: Utilizes NeonDB for managing structured data with Drizzle ORM.
Vector Database: Powered by Pinecone for efficient vector storage and retrieval.
File Storage: AWS S3 is used for secure file handling.
AI Integration: OpenAI's API and Vercel AI SDK enable advanced text embeddings and chat functionality.
Deployment: Hosted on Vercel for seamless scalability and performance.

<img width="1707" alt="Screenshot 2024-11-25 at 02 28 25" src="https://github.com/user-attachments/assets/9e23bccf-1cd8-48b7-9d55-84d59a009c63">

