export default class TimerSettings {
  constructor(sceneMain) {
    this.sceneMain = sceneMain;
    this.typingPanel = sceneMain.typingPanel;

    this.initUI();
  }

  initUI() {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "350px";
    container.style.right = "10px";
    container.style.background = "rgba(0,0,0,0.5)";
    container.style.color = "white";
    container.style.padding = "8px";
    container.style.borderRadius = "5px";
    container.style.zIndex = "1000";
    container.style.width = "160px";

    const title = document.createElement("div");
    title.textContent = "Timer Settings";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    container.appendChild(title);

    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.color = "white";
    select.style.background = "black";
    select.style.marginBottom = "6px";

    select.innerHTML = `
      <option value="15">15 seconds</option>
      <option value="30" selected>30 seconds</option>
      <option value="60">60 seconds</option>
    `;

    container.appendChild(select);

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Toggle Timer";
    toggleBtn.style.width = "100%";
    toggleBtn.style.padding = "4px";
    toggleBtn.style.background = "black";
    toggleBtn.style.color = "white";
    toggleBtn.style.cursor = "pointer";
    toggleBtn.style.marginTop = "6px";
    container.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
      if (this.typingPanel.timerMesh.visible) {
        this.typingPanel.isRunning = false;
        this.typingPanel.timerMesh.visible = false;
        if (this.typingPanel.resetAll) {
          this.typingPanel.resetAll();
        }
      
        return;
      }
      let time = parseInt(select.value);
      this.typingPanel.timeLimit = time;
      this.typingPanel.timeLeft = time;
  
      if (this.typingPanel.resetAll) {
        this.typingPanel.resetAll();
      }
      this.typingPanel.timerMesh.visible = true;
    
    });


    document.body.appendChild(container);
  }
}
