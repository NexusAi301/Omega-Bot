// نفس الكود بس غير atempo=1.5 إلى atempo=0.7
const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  if (!/audio/.test(q.mimetype || '')) return m.reply('⚠️ اعمل ريبلاي على صوت.')

  await m.reply('⏳ جاري تبطيء الصوت...')
  const media = await q.download()
  fs.writeFileSync('./tmp/in.mp3', media)

  try {
    await execPromise(`ffmpeg -i ./tmp/in.mp3 -filter:a "atempo=0.7" ./tmp/out.mp3`)
    const output = fs.readFileSync('./tmp/out.mp3')
    await conn.sendMessage(m.chat, { audio: output, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    fs.unlinkSync('./tmp/in.mp3'); fs.unlinkSync('./tmp/out.mp3')
  } catch { m.reply('❌ حدث خطأ.') }
}
handler.command = ['تبطيء', 'slow']
handler.tags = ['audio']
export default handler