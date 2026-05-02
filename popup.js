document.addEventListener('DOMContentLoaded', () => {

    // ---> PASTE YOUR API KEY HERE <---
    const API_KEY = 'INSERT_YOUR_API_KEY_HERE'; 

    const statusEl = document.getElementById('status');
    const userNameInput = document.getElementById('userName');
    const saveNameBtn = document.getElementById('saveNameBtn');

    // Load saved name
    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['savedName'], (result) => {
            if (result.savedName) userNameInput.value = result.savedName;
        });
    }

    // Save name
    saveNameBtn.addEventListener('click', () => {
        const nameToSave = userNameInput.value.trim();
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ savedName: nameToSave }, () => {
                statusEl.innerText = "Name saved!";
                setTimeout(() => { statusEl.innerText = ""; }, 2000); 
            });
        } else {
            statusEl.innerText = "Storage permission missing!";
        }
    });

    async function getEmailText() {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            }, (injectionResults) => {
                resolve(injectionResults[0]?.result);
            });
        });
    }

    // --- FEATURE 1: SCHEDULE MEETING ---
    document.getElementById('processEmail').addEventListener('click', async () => {
        statusEl.innerText = "Reading email...";
        const emailText = await getEmailText();
        if (!emailText || emailText.includes("ERROR")) return statusEl.innerText = "Please open an email first.";

        statusEl.innerText = "Analyzing dates...";
        const prompt = `You are a scheduling assistant. Extract meeting details from this email. Return ONLY a valid JSON object. No markdown. Keys: "title" (string), "details" (string), "start_date" (format: YYYYMMDDTHHMMSSZ), "end_date" (format: YYYYMMDDTHHMMSSZ). Assume current year is 2026. Email: ${emailText}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            // SAFETY CHECK: Ensure the AI actually returned text
            if (!data.candidates || !data.candidates[0].content) {
                throw new Error("AI returned no data (Possible Safety Block or Rate Limit).");
            }

            let aiText = data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const meetingData = JSON.parse(aiText);

            statusEl.innerText = "Opening Calendar...";
            const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingData.title)}&dates=${meetingData.start_date}/${meetingData.end_date}&details=${encodeURIComponent(meetingData.details)}`;
            chrome.tabs.create({ url: calUrl });
            statusEl.innerText = "Done!";
        } catch (error) {
            statusEl.innerText = "Error: " + error.message;
        }
    });

    // --- FEATURE 2: SUMMARIZE EMAIL ---
    document.getElementById('summarizeEmail').addEventListener('click', async () => {
        const replyBox = document.getElementById('replyBox');
        const copyBtn = document.getElementById('copyBtn');
        replyBox.style.display = 'none';
        copyBtn.style.display = 'none';
        
        statusEl.innerText = "Reading email...";
        const emailText = await getEmailText();
        if (!emailText || emailText.includes("ERROR")) return statusEl.innerText = "Please open an email first.";

        statusEl.innerText = "Summarizing...";
        const prompt = `You are an AI assistant. Provide a concise summary of the following email thread in 3 to 4 bullet points. Do NOT use markdown, asterisks, or bolding. Return ONLY plain text bullet points formatted with standard dashes. Email text: ${emailText}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            if (!data.candidates || !data.candidates[0].content) throw new Error("AI returned no data.");

            let summaryText = data.candidates[0].content.parts[0].text.trim();
            summaryText = summaryText.replace(/\*/g, '').replace(/#/g, '');

            replyBox.value = summaryText;
            replyBox.style.display = 'block';
            copyBtn.style.display = 'block';
            statusEl.innerText = "Summary ready!";
        } catch (error) {
            statusEl.innerText = "Error: " + error.message;
        }
    });

    // --- FEATURE 3: DRAFT & AUTO-INSERT REPLY ---
    document.getElementById('draftReply').addEventListener('click', async () => {
        const replyBox = document.getElementById('replyBox');
        const copyBtn = document.getElementById('copyBtn');
        replyBox.style.display = 'none';
        copyBtn.style.display = 'none';
        
        statusEl.innerText = "Reading email...";
        const emailText = await getEmailText();
        if (!emailText || emailText.includes("ERROR")) return statusEl.innerText = "Please open an email first.";

        const signatureName = userNameInput.value.trim() || "[Your Name]";
        statusEl.innerText = "Drafting reply...";
        const prompt = `You are a professional Executive Assistant. Draft a concise, polite reply to the following email. If the sender asks a question that you don't know the answer to, use brackets like [Insert Answer Here] so the user knows to fill it in. Do not use formatting like bolding or backticks. Return ONLY the raw email text. Sign off using this name: ${signatureName}. Email text: ${emailText}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            if (!data.candidates || !data.candidates[0].content) throw new Error("AI returned no data.");

            let draftText = data.candidates[0].content.parts[0].text.trim();
            draftText = draftText.replace(/\*\*/g, '').replace(/\*/g, ''); 

            const plainText = draftText;
            let htmlText = draftText.replace(/\n/g, '<br>'); 
            htmlText = htmlText.replace(/(\[.*?\])/g, '<b>$1</b>'); 

            statusEl.innerText = "Injecting into Gmail...";
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (textToInject) => {
                    const composeBox = document.querySelector('div[role="textbox"][contenteditable="true"]');
                    if (composeBox) {
                        composeBox.focus();
                        document.execCommand('insertHTML', false, textToInject);
                        return "SUCCESS";
                    } else {
                        return "NO_BOX";
                    }
                },
                args: [htmlText] 
            }, (results) => {
                if (results[0]?.result === "SUCCESS") {
                    statusEl.innerText = "Inserted into Gmail!";
                } else {
                    statusEl.innerText = "Hit 'Reply' in Gmail first! (Draft saved below)";
                    replyBox.value = plainText; 
                    replyBox.style.display = 'block';
                    copyBtn.style.display = 'block';
                }
            });
        } catch (error) {
            statusEl.innerText = "Error: " + error.message;
        }
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const replyBox = document.getElementById('replyBox');
        replyBox.select();
        document.execCommand('copy');
        statusEl.innerText = "Copied to clipboard!";
    });

});