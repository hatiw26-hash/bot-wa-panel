const express = require("express")
const fs = require("fs")

const {
 default: makeWASocket,
 useMultiFileAuthState
} = require("@adiwajshing/baileys")

const app = express()
const PORT = process.env.PORT || 3000

const OWNER = ["625188689814"]
const OWNER_NAME = "BALSKUYY"

let db = { users: [], premium: [] }

try {
 db = JSON.parse(fs.readFileSync("./database.json"))
} catch {}

app.use(express.static("views"))

async function startBot() {
 const { state, saveCreds } = await useMultiFileAuthState("session")

 const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false
 })

 if (!sock.authState.creds.registered) {
  const code = await sock.requestPairingCode(OWNER[0])
  console.log("PAIRING CODE:", code)
 }

 sock.ev.on("creds.update", saveCreds)

 sock.ev.on("messages.upsert", async ({ messages }) => {
  const m = messages[0]
  if (!m.message) return

  const text = m.message.conversation || ""
  const sender = m.key.participant || m.key.remoteJid
  const nomor = sender.split("@")[0]

  if (!db.users.includes(nomor)) {
   db.users.push(nomor)
   fs.writeFileSync("./database.json", JSON.stringify(db, null, 2))
  }

  if (text === ".menu") {
   sock.sendMessage(m.key.remoteJid, {
    text: `🤖 BOT AKTIF\nOwner: ${OWNER_NAME}`
   })
  }

  if (text === ".owner") {
   sock.sendMessage(m.key.remoteJid, {
    text: `👑 ${OWNER_NAME}\nwa.me/${OWNER[0]}`
   })
  }
 })
}

startBot()

app.get("/api/users", (req, res) => {
 res.json(db.users)
})

app.listen(PORT, () => {
 console.log("Panel jalan di port " + PORT)
})
