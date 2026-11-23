# App de regalo 🌻 + Mazo de Preguntas 🃏

Plantilla sin contenido personal. Personaliza:

- `config/media.js`: foto de portada, foto del disco y la URL de tu playlist de Spotify.
- `components/gift/*`: textos (portada, splash, trivia, ticket, playlist).
- `components/gift/PassCode.jsx`: la clave (DDMMAAAA) y su pista.
- `lib/letter.js`: fecha de desbloqueo de la carta. Pon la imagen en `private/` con el nombre de `LETTER_FILE`.
- `lib/game/questions.js`: preguntas y penalidades base del juego.
- Juego en tiempo real: copia `.env.local.example` a `.env.local` con tu proyecto de Firebase (sin él funciona en modo local).

```
npm install
npm run dev
```
