import { Color } from "three";

export default class BackgroundSettings {
  constructor(sceneMain) {
    this.sceneMain = sceneMain;
    this.scene = sceneMain.scene;

    this.savedColor = localStorage.getItem("backgroundColor");
    if (this.savedColor) {
      this.scene.background = new Color(this.savedColor);
    }

    this.initUI();
  }

  initUI() {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "120px";
    container.style.right = "10px";
    container.style.background = "rgba(0,0,0,0.5)";
    container.style.color = "white";
    container.style.padding = "6px";
    container.style.borderRadius = "5px";
    container.style.zIndex = 1000;

    const label = document.createElement("div");
    label.textContent = "Background Color";
    label.style.fontWeight = "bold";
    label.style.marginBottom = "4px";

    this.colorPicker = document.createElement("input");
    this.colorPicker.type = "color";
    this.colorPicker.value = this.savedColor || "#222222";

    this.colorPicker.addEventListener("input", (e) => {
      const hex = e.target.value;
      this.scene.background = new Color(hex);
      localStorage.setItem("backgroundColor", hex);
    });

    container.appendChild(label);
    container.appendChild(this.colorPicker);
    document.body.appendChild(container);
  }
}
