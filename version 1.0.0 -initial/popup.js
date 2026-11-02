const startButton = document.getElementById("start");
const statusText = document.getElementById("status");

startButton.addEventListener("click", async () => {
  statusText.textContent = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !/^https?:/.test(tab.url || "")) {
      statusText.textContent = "Open a regular website first. This page cannot be modified.";
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
    window.close();
  } catch (error) {
    statusText.textContent = "Could not open here. Try refreshing the website.";
    console.error(error);
  }
});