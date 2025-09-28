# 🎛️ The TL;DR App
**One input, many outputs.** Upload a PDF or paste text, and get a clean summary, optional MP3 narration, and image prompts—built on Next.js, Tailwind, and Gemini. Modular by design so you can plug in image gen or streaming later.
---

## 🔖 One-liner
**Split one input into many outputs — PDFs, MP3s, images, and videos.**

---

## 🚀 Features
- **Three input modes**: upload file, paste text, or (WIP) lightweight web search.
- **PDF text extraction** on the client using pdfjs-dist with a local worker (public/pdf.worker.min.js).
- **Summarization** powered by **Google Gemini** (@google/genai).
- **Optional** **Text‑to‑Speech** via ElevenLabs (returns an MP3 stream).
- **Modern UI**: Next.js App Router, Tailwind v4, shadcn/ui, Radix primitives, lucide icons.
- **TypeScript-first** with a small, modular lib (/src/lib) and reusable components (/src/components).

---

## 🧠 Inspiration
Different people prefer different mediums — reading, listening, or viewing. This project was inspired by the idea of making the same content accessible across multiple formats simultaneously.

---

## 📦 Tech Stack
- **Framework**: Next.js (App Router)
- **Parsing**: TypeScript
- **AI**: @google/genai (Gemini 2.5 Flash) – text/grounded responses; Imagen (prompt generation) 
- **Audio**: ElevenLabs TTS

---

## 🛠️ How it works
1. Upload a PDF via a form request.  
2. Convert the uploaded file into a buffer.  
3. Extract text using `pdf-parse`.  
4. Send the extracted text to Gemini for summarization.  
5. Return a clean JSON response.  

---

## 📂 Example File Structure

```text
/
src/
  app/
  layout.tsx
  page.tsx # main UI (tabs: file / text / websearch)
  api/
    process-audio/ # POST – calls Gemini on uploaded audio (transcribe + image prompts)
    text-to-speech/ # POST – streams MP3 from ElevenLabs
  components/ # DropZone, OutputDisplay, AudioPlayer, FileViewer, shadcn/ui
  hooks/
  lib/ # geminiService.ts, utils.ts (PDF), types.ts, audioUtils.ts
public/
  pdf.worker.min.js # PDF.js worker (required for client extraction)
```

---

## ⚙️ Environment Variables

Create .env.local in the project root:
```console
# Required for Gemini (summarization, prompts)
GEMINI_API_KEY=your_google_generative_ai_key
# Optional – only if you want MP3 audio via ElevenLabs
ELEVENLABS_API_KEY=your_eleven_labs_key
```
If you don’t set ELEVENLABS_API_KEY, the app still works for text summary; the /api/text-to-speech route will return a helpful error.
## ⚙️ Quickstart
1) Install deps
```console
npm install
```
2) Add them explicitly (some templates omit these):
```console
npm i next@latest react@latest react-dom@latest
```
3) Dev server
```console
npm run dev
```
(remember)-> http://localhost:3000

4) Build & start (production)
```console
npm run build && npm start
```
---
# 🧪 Using the API Routes (cURL examples)
1) Summarize audio (server route)
POST /api/process-audio
```console
curl -X POST http://localhost:3000/api/process-audio \
-H "Content-Type: application/json" \
-d '{
"mimeType": "audio/mpeg",
"data": "<BASE64_AUDIO_DATA>"
}'
```
Response
```console
{
"summary": "...transcription + summary...",
"imagePrompts": ["...prompt 1...", "...prompt 2...", "...prompt 3..."]
}
```
2) Text‑to‑Speech
POST /api/text-to-speech
```console
curl -X POST http://localhost:3000/api/text-to-speech \
-H "Content-Type: application/json" \
-d '{
"text": "Read this text",
"voiceId": "21m00Tcm4TlvDq8ikWAM"
}' \
--output output.mp3
```
---
## 🧭 How the UI Works
DropZone supports PDF, images, and audio (MP3/WAV). For PDFs we call extractTextFromPdf(file) which uses a client-only PDF.js worker.
The main page composes an AppOutput:
```console
export interface AppOutput {
summary?: string;
images?: string[];
webSearchResults?: string[];
originalFile?: { name: string; url: string; type: string; size?: number };
}
```
**OutputDisplay** renders the uploaded file preview, the summary, and an **AudioPlayer** that calls /api/text-to-speech.

---
## 🔐 Notes & Limits
Next.js body size for server actions is raised to 10mb in next.config.ts
PDF.js worker path must match public/pdf.worker.min.js (see utils.ts).
Grounding: geminiService.ts includes a Google grounding tool config for better web‑aware answers
Image generation: prompts are produced; you can plug them into your preferred image model (Imagen, SDXL, etc.).

---

## 🎉 Accomplishments
- Built a system that transforms one input into multiple outputs.  
- Successfully demonstrated PDF → Text → AI Summary.  
- Designed modular architecture for extending into audio, images, and video.  

---

## ⚠️ Challenges
- Large PDFs and memory optimization.  
- Summarization accuracy and prompt tuning.  
- Handling quirks of different formats (PDF layout vs. audio pronunciation).  

---

## 📚 What we learned
- Working with multiple content formats in one pipeline.  
- How to integrate AI models into serverless functions.  
- The importance of accessibility-first design.  

---

## 🎯 Goals

- Make one input accessible across **multiple formats** (PDF, audio, images).
- Improve **accessibility** for people with different needs (visual, auditory, cognitive).
- Provide **education-ready** content (summaries, study notes, slides).
- Offer **plug-and-play modules** so others can extend the pipeline (TTS, diagrams, video).
- Keep it **open-source**, documented, and easy to adopt.
---
## 🌍 How this fits: AI for Good — Helping Humanity

- **Accessibility & Inclusion:** Converts the same content into formats that serve screen-reader users, language learners, and people on the go.
- **Equity of Access:** Lowers friction for communities with constrained devices or connectivity by generating lightweight alternatives (text, compressed audio).
- **Education & Literacy:** Produces clear summaries and multimodal learning aids that support students and lifelong learners.
- **Crisis & Public Info:** Supports rapid reformatting of guidance (health, safety, disaster updates) into readable, audible, and visual versions.
- **Sustainable Use of AI:** Promotes **right-sized** outputs (only what’s needed, when it’s needed) to reduce unnecessary compute and storage.


