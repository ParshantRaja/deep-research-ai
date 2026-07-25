🚀 Deep Research AI

---

📌 Project Overview & Objective

Deep Research AI is an advanced autonomous intelligence agent designed to perform **deep web research** and generate **academic-grade reports**.

The system combines **Large Language Models (LLMs)** with intelligent search APIs to collect, analyze, and structure information from multiple sources into well-organized documents.

---

🧠 System Architecture & Workflow

🔍 Query Expansion & Intent Recognition  
The system uses Google Gemini 1.5 Flash to understand user intent and expand a single query into multiple focused research queries covering different aspects of the topic.

🌐 Autonomous Data Collection  
Using Tavily AI, the system performs deep web searches and extracts relevant information including structured data and academic sources.

🧩 Data Synthesis & Structuring  
The collected data is processed and structured into a detailed report format including sections like:
- Abstract  
- Introduction  
- Literature Review  
- Methodology  
- Findings  
- Conclusion  

📚 Smart Citation System  
The system automatically generates:
- In-text citations (e.g., [1], [2])  
- Reference list for source tracking  

---

✨ Key Features

🔄 Cross-Device Synchronization  
Real-time sync using Firebase Firestore  

🔐 Secure Authentication  
OTP-based login using NextAuth.js and Nodemailer  

🧾 Research History  
Stores and retrieves previously generated reports  

🚧 Navigation Protection  
Prevents interruption during report generation  

---

🛠️ Tech Stack

💻 Frontend:
- Next.js 14  
- TypeScript  
- Tailwind CSS  

⚙️ Backend:
- Next.js API Routes  

🤖 AI & Search:
- Google Gemini 1.5 Flash  
- Tavily AI  

🗄️ Database:
- Firebase Firestore  

🔑 Authentication:
- NextAuth.js  
- Gmail SMTP (OTP System)  

🚀 Deployment:
- Docker  
- Google Cloud Run  

---

⚙️ Setup Instructions

📥 Clone Repository:
git clone https://github.com/ParshantRaja/deep-research-ai.git  
cd deep-research-ai  

📦 Install Dependencies:
npm install  

▶️ Run Project:
npm run dev  

---

🔑 Environment Variables

Create a `.env.local` file and add:

GEMINI_API_KEY=your_key  
TAVILY_API_KEY=your_key  
FIREBASE_CONFIG=your_config  
NEXTAUTH_SECRET=your_secret  
EMAIL_USER=your_email  
EMAIL_PASS=your_password  

---

🎯 Future Improvements

- Multi-model AI support  
- Advanced research agents  
- Data visualization  
- Multi-language support  

---

📬 Contact

👤 Parshant Raja  
🐙 GitHub: ParshantRaja  
📧 Email: parshantraja888@gmail.com  

---

⭐ If you like this project, give it a star!
