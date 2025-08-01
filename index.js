const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Asegurate de tenerlo instalado con: npm install node-fetch@2


const app = express();
const PORT = 3001;
console.log("back corriendo puerto:", PORT);
app.use(cors());
app.use(express.json());

// Ruta para recibir y reenviar datos a Google Sheets
app.post("/api/enviar", async (req, res) => {
  const datos = req.body;
  console.log("Datos recibidos:", datos); // Esto debería aparecer en tu consola
  if (!datos || !datos.destino) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan datos o destino" });
  }

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzgJfnLRfNXZKRqKOZ-Ps0Mcs0MM8pZtO8aSfmPAtbffZR4RGo_L2xKq2qG8Tpfj43XzA/exec",

      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }
    );

    const result = await response.json();
    console.log("Respuesta de Google Sheets:", result); // Opcional

    if (datos.destino === "listar") {
      return res.json({ message: "datos recibidos para listar", result });
    } else {
      return res.json({
        success: true,
        message: "Datos enviados a Sheets correctamente",
        result,
      });
    }
  } catch (error) {
    console.error("Error enviando datos a Sheets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//nueva ruta para verifica usuarios habilitados
app.post("/api/verificar-usuario", async (req, res) => {
  console.log("Cuerpo recibido en backend:", req.body);
  /*const { email, clave } = req.body;*/
  const datos = req.body;
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzgJfnLRfNXZKRqKOZ-Ps0Mcs0MM8pZtO8aSfmPAtbffZR4RGo_L2xKq2qG8Tpfj43XzA/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos /*{ email, clave ,destino: "verifica"}*/),
        redirect: "follow",
      }
    );
    //const data=await response.json();
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Error al parsear JSON:", e, text);
      return res
        .status(500)
        .json({ success: false, error: "Respuesta inválida del script" });
    }

    console.log("Respuesta del script de Sheets:", data);
    if (!data.email) {
      console.warn("Advertencia: 'email' no está definido en la respuesta");
    }
    if (!data.rol) {
      console.warn("Advertencia: 'rol' no está definido en la respuesta");
    }
    res.json(data);
  } catch (error) {
    console.error("Error verificacion usuario sheets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//ruta para eliminar vtos
app.post("/api/eliminar", async (req, res) => {
  const datos = req.body;
  if (
    !datos ||
    !datos.destino ||
    datos.destino !== "eliminar" ||
    !datos.codigo_barras
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan datos para eliminar" });
  }
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzgJfnLRfNXZKRqKOZ-Ps0Mcs0MM8pZtO8aSfmPAtbffZR4RGo_L2xKq2qG8Tpfj43XzA/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }
    );
    const result = await response.json();
    console.log("Respuesta eliminar google sheets", result);
    return res.json(result);
  } catch (error) {
    console.error("Error eliminando en Sheets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//ruta para editar vtos
async function actualizatFilaenSheets(data) {
  const datos = { ...data, destino: "editar" };
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzgJfnLRfNXZKRqKOZ-Ps0Mcs0MM8pZtO8aSfmPAtbffZR4RGo_L2xKq2qG8Tpfj43XzA/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }
    );
    const result = await response.json();
    console.log("Respuesta de Sheets al editar", result);
    return result;
  } catch (error) {
    console.error("Error actualizando en Sheets:", error);
    return { success: false, message: "Error en fetch de edición" };
  }
}

app.put("/api/editar", async (req, res) => {
  console.log("🟢 Llegó una petición a /api/editar");
  console.log("📦 Datos recibidos para editar:", req.body);
  const datosActualizados = req.body;
 
  try {
    const result = await actualizatFilaenSheets(datosActualizados);
     console.log("📤 Resultado de actualización en Sheets:", result)

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("error en /api/enviar", error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
 