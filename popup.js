const btn = document.getElementById('toggleBtn');
const status = document.getElementById('status');

// Pedimos el estado actual al background
chrome.runtime.sendMessage("estado", response => {
    actualizarUI(response.activo);
});

// Alternar entre activar/desactivar
btn.addEventListener("click", () => {
    chrome.runtime.sendMessage(btn.dataset.active === "true" ? "desactivar" : "activar", () => {
        chrome.runtime.sendMessage("estado", response => {
            actualizarUI(response.activo);
        });
    });
});

// Actualizar el botón y el estado con estilos
function actualizarUI(activo) {
    btn.textContent = activo ? "Desactivar" : "Activar";
    btn.dataset.active = activo;

    status.textContent = "Estado: " + (activo ? "Activado" : "Desactivado");

    if (activo) {
        status.classList.remove("estado-inactivo");
        status.classList.add("estado-activo");
        btn.style.backgroundColor = "#f44336"; // Rojo al desactivar
    } else {
        status.classList.remove("estado-activo");
        status.classList.add("estado-inactivo");
        btn.style.backgroundColor = "#4CAF50"; // Verde al activar
    }
}
