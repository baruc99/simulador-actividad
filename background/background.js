let intervalId = null;

// 🧠 Escucha comandos del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message) {
        case "activar":
            iniciarSimulacion();
            break;
        case "desactivar":
            detenerSimulacion();
            break;
        case "estado":
            sendResponse({ activo: !!intervalId });
            break;
    }
});

// 🟢 Inicia la simulación en intervalos
function iniciarSimulacion() {
    if (!intervalId) {
        intervalId = setInterval(ejecutarSimulacion, 60000); // cada 60s
        console.log("🟢 Simulación activada");
    }
}

// 🔴 Detiene la simulación
function detenerSimulacion() {
    clearInterval(intervalId);
    intervalId = null;
    console.log("🔴 Simulación desactivada");
}

// 🖱 Función que se ejecuta cada intervalo
async function ejecutarSimulacion() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (esURLValida(tab?.url)) {
            console.log("🧪 Inyectando en:", tab.url);
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: simularMouse
                },
                (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("🚫 Error al inyectar:", chrome.runtime.lastError.message);
                    } else {
                        console.log("✅ Script inyectado exitosamente");
                    }
                }
            );
        } else {
            abrirGoogleYSimular();
        }
    } catch (error) {
        console.error("❌ Error al ejecutar simulación:", error);
    }
}

// 🧪 Verifica si la URL es válida para inyectar código
function esURLValida(url) {
    return url?.startsWith("http") &&
        !url.startsWith("chrome://") &&
        !url.startsWith("chrome-extension://") &&
        !url.startsWith("about:");
}

// 🌐 Abre Google si la pestaña actual no es válida
function abrirGoogleYSimular() {
    console.warn("⚠️ Pestaña no válida. Abriendo Google...");
    chrome.tabs.create({ url: "https://www.google.com.mx/" }, (newTab) => {
        const listener = (tabId, info) => {
            if (tabId === newTab.id && info.status === "complete") {
                chrome.scripting.executeScript({
                    target: { tabId: newTab.id },
                    func: simularMouse
                });
                chrome.tabs.onUpdated.removeListener(listener);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

// 🖱 Código inyectado que simula el movimiento del mouse
function simularMouse() {
    if (document.readyState !== 'complete') {
        console.log("Esperando a que la página cargue...");
        setTimeout(simularMouse, 1000);
        return;
    }

    let cursor = document.getElementById('cursor-falso');
    if (!cursor) {
        cursor = document.createElement('div');
        Object.assign(cursor.style, {
            position: 'fixed',
            width: '10px',
            height: '10px',
            backgroundColor: 'red',
            borderRadius: '50%',
            zIndex: '9999',
            pointerEvents: 'none'
        });
        cursor.id = 'cursor-falso';
        document.body.appendChild(cursor);
    }

    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    const evt = new MouseEvent("mousemove", {
        clientX: x,
        clientY: y,
        view: window,
        bubbles: true,
        cancelable: true
    });

    document.dispatchEvent(evt);
    console.log("🖱 Cursor movido a", x, y);
}
