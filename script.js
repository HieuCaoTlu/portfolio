const jihyoBtn = document.getElementById("jihyoBtn");
const lilyBtn = document.getElementById("lilyBtn");
const modalOverlay = document.getElementById("modalOverlay");
const resetBtn = document.getElementById("resetBtn");

function dodgeJihyo() {
  const rect = jihyoBtn.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 16;
  const maxY = window.innerHeight - rect.height - 16;
  const x = Math.max(16, Math.random() * maxX);
  const y = Math.max(16, Math.random() * maxY);

  jihyoBtn.classList.add("fleeing");
  jihyoBtn.style.left = `${x}px`;
  jihyoBtn.style.top = `${y}px`;
}

jihyoBtn.addEventListener("mouseenter", dodgeJihyo);

lilyBtn.addEventListener("click", () => {
  modalOverlay.classList.add("show");
});

resetBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("show");
  jihyoBtn.classList.remove("fleeing");
  jihyoBtn.style.left = "";
  jihyoBtn.style.top = "";
});
