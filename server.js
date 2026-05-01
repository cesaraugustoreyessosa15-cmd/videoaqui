const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ðŸ”‘ API KEY PIXABAY
const API_KEY = ""const API_KEY = "41023169-4ecf3a9fabae7d25d2fe6cb69";

// ðŸ”— TU LINK DE VENTA (SYSTEME.IO o PAYHIP)
const LINK_VENTA = "https://TU-LINK-AQUI.com";

app.post("/generar", async (req, res) => {
  const { nicho } = req.body;

  try {
    const url = `https://pixabay.com/api/videos/?key=${API_KEY}&q=${nicho}&per_page=2`;
    const response = await fetch(url);
    const data = await response.json();

    const clips = data.hits.map((v, i) => {
      const path = `video${i}.mp4`;
      return { url: v.videos.medium.url, path };
    });

    // Descargar videos
    await Promise.all(clips.map(c => descargar(c.url, c.path)));

    // Lista FFmpeg
    const lista = clips.map(c => `file '${c.path}'`).join("\n");
    fs.writeFileSync("list.txt", lista);

    const texto = `Aprende sobre ${nicho}. Link en bio`;

    // Crear video final
    const comando = `
      ffmpeg -f concat -safe 0 -i list.txt 
      -vf "drawtext=text='${texto}':fontcolor=white:fontsize=28:x=10:y=H-th-20"
      -c:v libx264 -c:a aac final.mp4
    `;

    exec(comando, (err) => {
      if (err) return res.status(500).send("Error en video");

      res.json({
        mensaje: texto,
        video: "/final.mp4",
        link: LINK_VENTA
      });
    });

  } catch (e) {
    res.status(500).send("Error general");
  }
});

// Descargar helper
async function descargar(url, path) {
  const res = await fetch(url);
  const file = fs.createWriteStream(path);
  return new Promise(resolve => {
    res.body.pipe(file);
    file.on("finish", resolve);
  });
}

app.listen(3000, () => console.log("ðŸ”¥ Imperio activo"));
