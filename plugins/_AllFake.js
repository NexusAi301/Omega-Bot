import fetch from 'node-fetch'

export async function before(m, { conn }) {
  const idcanal = global.idcanal || '120363000000000000@newsletter'
  const namecanal = global.namecanal || 'قناة البوت'

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 200,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idcanal,
        serverMessageId: 100,
        newsletterName: namecanal,
      }
    }
  }
}