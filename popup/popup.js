const btn = document.getElementById("toggleBtn");
const status = document.getElementById("status");
const popupBody = document.getElementById("popupBody");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    obtenerEstado().then(actualizarUI);
    btn.addEventListener("click", manejarToggle);
});

function manejarToggle() {
    const activar = btn.dataset.active !== "true";
    chrome.runtime.sendMessage(activar ? "activar" : "desactivar", () => {
        obtenerEstado().then(actualizarUI);
    });
}

function obtenerEstado() {
    return new Promise(resolve => {
        chrome.runtime.sendMessage("estado", resolve);
    });
}

function actualizarUI(activo) {
    btn.textContent = activo ? "Desactivar" : "Activar";
    btn.dataset.active = activo;
    status.textContent = `Estado: ${activo ? "Activado" : "Desactivado"}`;

    status.classList.toggle("estado-activo", activo);
    status.classList.toggle("estado-inactivo", !activo);

    btn.style.backgroundColor = activo ? "#f44336" : "#4CAF50";
    popupBody.style.backgroundColor = activo ? "#fff3e0" : "#e8f5e9";
}
