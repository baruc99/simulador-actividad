let intervalId = null;
let simulacionIndex = 0;
const tiposDisponibles = ["mouse", "scroll", "click", "tecla"];

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

function iniciarSimulacion() {
    if (!intervalId) {
        chrome.storage.local.get("intervalo", ({ intervalo }) => {
            const delay = intervalo || 60000;
            intervalId = setInterval(ejecutarSimulacion, delay);
            console.log(`🟢 Simulación activada cada ${delay / 1000}s`);
        });
    }
}

async function detenerSimulacion() {
    clearInterval(intervalId);
    intervalId = null;
    console.log("🔴 Simulación desactivada");

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const cursor = document.getElementById('cursor-falso');
                if (cursor) cursor.remove();

                const boton = document.getElementById('boton-falso');
                if (boton) boton.remove();
            }
        });
    } catch (err) {
        console.error("❌ No se pudo eliminar el cursor falso:", err);
    }
}

async function ejecutarSimulacion() {
    try {
        const { tipoSimulacion } = await chrome.storage.local.get("tipoSimulacion");
        let tipo = tipoSimulacion || "mouse";

        if (tipo === "todas") {
            tipo = tiposDisponibles[simulacionIndex % tiposDisponibles.length];
            simulacionIndex++;
        }

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (esURLValida(tab?.url)) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: simularActividad,
                args: [tipo]
            });
        } else {
            abrirGoogleYSimular(tipo);
        }
    } catch (error) {
        console.error("❌ Error al ejecutar simulación:", error);
    }
}

function esURLValida(url) {
    return url?.startsWith("http") &&
        !url.startsWith("chrome://") &&
        !url.startsWith("chrome-extension://") &&
        !url.startsWith("about:");
}

function abrirGoogleYSimular(tipo) {
    chrome.tabs.create({ url: "https://www.google.com.mx/" }, (newTab) => {
        const listener = (tabId, info) => {
            if (tabId === newTab.id && info.status === "complete") {
                chrome.scripting.executeScript({
                    target: { tabId: newTab.id },
                    func: simularActividad,
                    args: [tipo]
                });
                chrome.tabs.onUpdated.removeListener(listener);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

function simularActividad(tipo) {
    if (document.readyState !== 'complete') {
        setTimeout(() => simularActividad(tipo), 1000);
        return;
    }

    const cursorId = 'cursor-falso';
    if (tipo === "mouse") {
        let cursor = document.getElementById(cursorId);
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
            cursor.id = cursorId;
            document.body.appendChild(cursor);
        }

        const x = Math.floor(Math.random() * window.innerWidth);
        const y = Math.floor(Math.random() * window.innerHeight);
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;

        const evt = new MouseEvent("mousemove", {
            clientX: x, clientY: y,
            bubbles: true, cancelable: true
        });
        document.dispatchEvent(evt);
        console.log("🖱 Cursor movido a", x, y);
    }

    if (tipo === "scroll") {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const y = Math.floor(Math.random() * maxScroll);
        window.scrollTo({ top: y, behavior: 'smooth' });
        console.log("📜 Scrolleado a", y);
    }

    if (tipo === "click") {
        const existingBtn = document.getElementById("boton-simulado");

        // Si ya existe, simplemente haz click en él
        if (existingBtn) {
            existingBtn.click();
            console.log("🖱 Click simulado en botón existente");
        } else {
            // Crear un nuevo botón
            const btn = document.createElement("button");
            btn.id = "boton-simulado";
            btn.textContent = "Botón Simulado";

            Object.assign(btn.style, {
                position: "fixed",
                top: "20px",
                left: "20px",
                zIndex: 9999,
                padding: "10px",
                backgroundColor: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
            });

            // Agrega comportamiento al botón (solo para efectos visuales)
            btn.addEventListener("click", () => {
                console.log("✅ Botón simulado fue clickeado");
            });

            document.body.appendChild(btn);

            // Haz click en el botón luego de insertarlo
            btn.click();
            console.log("🆕 Botón creado y clickeado");
        }
    }

    if (tipo === "tecla") {
        // Letras A-Z y números 0-9
        const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
        const randomChar = caracteres[Math.floor(Math.random() * caracteres.length)];

        const keyEvent = new KeyboardEvent("keydown", {
            key: randomChar,
            code: `Key${randomChar.toUpperCase()}`,
            keyCode: randomChar.charCodeAt(0),
            which: randomChar.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(keyEvent);
        console.log("⌨️ Tecla simulada:", randomChar);
    }
}
