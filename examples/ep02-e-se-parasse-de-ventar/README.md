# E SE...? EP02 — "E se parasse de ventar no mundo?"

Episódio da série **E SE...? | HISTÓRIAS DO TABOCAL** (vertical 1080×1920, ~94 s), feito com esta plataforma.

```bash
# na raiz do repositório
node examples/ep02-e-se-parasse-de-ventar/build.ts   # narração, legendas, trilha, index.html
npx hfr preview examples/ep02-e-se-parasse-de-ventar
npx hfr render  examples/ep02-e-se-parasse-de-ventar --quality high
```

- **Roteiro:** 14 falas em `build.ts` (`LINES`), com palavras-chave coloridas nas legendas (`emph`).
- **Cenas:** 13 cenas ancoradas nas falas. Se a narração mudar de duração, tudo se reajusta.
- **Voz:** a narração incluída usa a voz neural `pt-BR-AntonioNeural` via [edge-tts](https://github.com/rany2/edge-tts) (`pip install edge-tts`):
  ```bash
  export HFR_TTS_COMMAND="edge-tts --voice pt-BR-AntonioNeural --rate=+12% -f /dev/stdin --write-media {out}"
  ```
  Sem isso, o script usa ElevenLabs ou OpenAI quando há chave (`HFR_TTS_PROVIDER`), ou o espeak-ng offline.
- **Legendas:** o tempo de cada palavra vem do alinhamento offline por silêncios.
- **Áudio:** a trilha e o vento são sintetizados com FFmpeg. O vento para na fala "O cata-vento parou" e volta na virada. A música abaixa sob a voz (ducking), e a mixagem é normalizada para −14 LUFS.
- **Fontes:** Anton e Montserrat (OFL), locais.

Os fatos da virada estão simplificados para o formato: o vento é gerado pelo aquecimento desigual da Terra pelo Sol.
A eólica responde por mais de 10% da eletricidade gerada no Brasil, segundo os dados de 2024.
Milho, trigo e arroz são polinizados principalmente pelo vento.
