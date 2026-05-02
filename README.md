# 🤖 AI Executive Assistant (Chrome Extension)

A lightweight, serverless Chrome extension that lives right inside your Gmail. Powered by Google's Gemini AI, this assistant can extract meeting dates, summarize long email threads, and draft context-aware replies directly into your compose box.

Everything runs locally in your browser using Vanilla JavaScript—no heavy backend servers, no databases, and no monthly subscription fees.

## ✨ Features

*   **📅 Schedule Meetings:** Instantly reads an email, extracts dates and agendas, and generates a pre-filled Google Calendar invite.
*   **📝 Summarize Emails:** Turns 20-message-long email chains into 3-4 highly readable bullet points.
*   **✍️ Draft Replies:** Writes polite, context-aware responses and magically types them directly into your active Gmail reply box.
*   **👤 Custom Sign-offs:** Saves your name locally in the browser to ensure every drafted email signs off perfectly.

## 🛠️ Tech Stack

*   **Architecture:** Chrome Extension (Manifest V3)
*   **Frontend UI:** HTML5 & CSS3
*   **Logic & Scraping:** Vanilla JavaScript (ES6+)
*   **AI Engine:** Google Gemini API (gemini-2.5-flash)
*   **Storage:** Chrome Storage API (`chrome.storage.local`)

## 🚀 Getting Started

To install and run this extension locally on your machine, follow these steps:

### 1. Get your Free API Key
This extension requires a Google Gemini API key to function.
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account and click **Get API key**.
3. Generate a new key and copy it to your clipboard.

### 2. Download the Code
1. Clone or download this repository to your local machine.
2. Open the project folder.
3. Open the `popup.js` file in any text editor.
4. Locate **Line 4**: `const API_KEY = 'INSERT_YOUR_API_KEY_HERE';`
5. Paste your API key between the single quotes.
   > **⚠️ IMPORTANT SECURITY NOTE:** Never upload your personal API key to a public GitHub repository! If you fork this project, keep your key strictly on your local machine.

### 3. Install in Chrome
1. Open Google Chrome and type `chrome://extensions/` into the URL bar.
2. Toggle on **Developer mode** in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select the folder containing your extension files.
5. Pin the extension to your toolbar for easy access!

## 📖 How to Use

1. Open any email inside Gmail.
2. Click the **AI Assistant** icon in your Chrome toolbar.
3. **To set your name:** Type your name in the text box and hit "Save". The AI will now use this to sign off your emails.
4. **To Draft a Reply:** Click the "Reply" button in Gmail *first* so your text cursor is blinking inside the compose box. Then, click **✍️ Draft Reply** in the extension to watch the AI type it out for you!

## 🔧 Troubleshooting

*   **"Please open an email first" / Extension Buttons Do Nothing:** Ensure you have refreshed your Gmail tab after installing or updating the extension. Chrome requires a page reload to inject the reading scripts.
*   **"Quota Exceeded" Error:** Google limits the free tier of the Gemini API to 20 requests per minute or 1,500 per day. If you hit this limit while testing, take a 60-second break or switch to a pay-as-you-go billing account in Google AI Studio.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).