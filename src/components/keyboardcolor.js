
const SPECIAL_KEYS = [
  "tab",
  "caps",
  "shift",
  "ctrl",
  "alt",
  "win",
  "fn",
  "menu",
  "enter",
  "backspace"
];

export default class KeyboardColorSettings {
  constructor(sceneMain) {
    this.sceneMain = sceneMain;
    this.keyboard = sceneMain.keyboard;

    this.specialKeyColor = localStorage.getItem("specialKeyColor") || "#66BCC2"; 
    this.normalKeyColor = localStorage.getItem("normalKeyColor") || "#ffffff"; 

    this.initUI();
  }

  initUI() {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "180px";
    container.style.right = "10px";
    container.style.background = "rgba(0,0,0,0.5)";
    container.style.color = "white";
    container.style.padding = "8px";
    container.style.borderRadius = "6px";
    container.style.zIndex = 1000;

    const title = document.createElement("div");
    title.textContent = "Keyboard Colors";
    title.style.marginBottom = "6px";
    title.style.fontWeight = "bold";

    // SPECIAL KEYS PICKER
    const specialLabel = document.createElement("div");
    specialLabel.textContent = "Special Keys";
    specialLabel.style.margin = "4px 0 2px";

    this.specialPicker = document.createElement("input");
    this.specialPicker.type = "color";
    this.specialPicker.value = this.specialKeyColor;
    this.specialPicker.addEventListener("input", (e) => {
      this.specialKeyColor = e.target.value;
      localStorage.setItem("specialKeyColor", this.specialKeyColor);
      this.applyColors();
    });

    // NORMAL KEYS PICKER
    const normalLabel = document.createElement("div");
    normalLabel.textContent = "Normal Keys";
    normalLabel.style.margin = "8px 0 2px";

    this.normalPicker = document.createElement("input");
    this.normalPicker.type = "color";
    this.normalPicker.value = this.normalKeyColor;
    this.normalPicker.addEventListener("input", (e) => {
      this.normalKeyColor = e.target.value;
      localStorage.setItem("normalKeyColor", this.normalKeyColor);
      this.applyColors();
    });

    container.appendChild(title);
    container.appendChild(specialLabel);
    container.appendChild(this.specialPicker);
    container.appendChild(normalLabel);
    container.appendChild(this.normalPicker);

    document.body.appendChild(container);

    this.applyColors();
  }

  applyColors() {
    if (!this.keyboard || !this.keyboard.keyStates) return;

    const specialSet = new Set(SPECIAL_KEYS);

    Object.keys(this.keyboard.keyStates).forEach(key => {
      const arr = this.keyboard.keyStates[key];
      const isSpecial = specialSet.has(key);

        const hex = isSpecial ? this.specialKeyColor : this.normalKeyColor;

        arr.forEach(s => {
          if (s && s.mesh) {
            s.mesh.material.color.set(hex);
          }
        });
      });
    }
}
