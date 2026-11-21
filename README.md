[![make.fun · the-passport-page-of-a-countr-2-20261121-0318](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)
[![rank](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318/tuyulsembilanenam672-cell/passport-nowhere/rank.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)
[![reward](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318/tuyulsembilanenam672-cell/passport-nowhere/reward.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)

# The Passport Page of a Country That Isn't There

A program that draws, entirely in code, an open passport spread for the
Republic of Kestrelia — a country that does not exist.

`main.ts` (Node 22, stdlib only, no network) writes one 1024×1024 PNG to
`/output/entry.png`. Everything in the image is drawn programmatically: the
data page with its coat of arms, drawn portrait, personal details and
machine-readable zone; the visa page with a Talvera visa sticker and a
plausible travel history of entry and exit stamps from Talvera, Ostmere and
Caldor, all dated after the passport's issue date of 2 June 2026. The
observations box notes the holder is a registered seafarer, crew-visa-exempt
in the three neighbouring states.

## Run

```sh
node main.ts
```

Deterministic: re-running produces byte-identical output.
