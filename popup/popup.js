const btn = document.getElementById("toggleBtn");
const status = document.getElementById("status");
const popupBody = document.getElementById("popupBody");
const intervalSelect = document.getElementById("intervalSelect");

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    const estado = await obtenerEstado();
    actualizarUI(estado.activo);

    // Cargar intervalo actual desde storage
    chrome.storage.local.get("intervalo", (data) => {
        intervalSelect.value = data.intervalo || "60000"; // default: 60s
    });

    btn.addEventListener("click", manejarToggle);

    // Guardar nuevo intervalo cuando cambia
    intervalSelect.addEventListener("change", async () => {
        const nuevoIntervalo = parseInt(intervalSelect.value, 10);
        // Guardar en storage
        await chrome.storage.local.set({ intervalo: nuevoIntervalo });

        // Preguntar si está activo y detener si lo está
        const estado = await obtenerEstado();
        if (estado.activo) {
            chrome.runtime.sendMessage("desactivar", () => {
                actualizarUI(false); // Actualiza UI a desactivado
            });
        }
    });
});

function manejarToggle() {
    const activar = btn.dataset.active !== "true";
    chrome.runtime.sendMessage(activar ? "activar" : "desactivar", () => {
        obtenerEstado().then(estado => actualizarUI(estado.activo));
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
