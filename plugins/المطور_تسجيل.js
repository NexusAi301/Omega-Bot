let handler = async (m, { conn }) => {
    let txt = `*اهلا بك يا ${m.name}*\n\n*مطور هذا البوت هو: غوجو*\n*رابط القناه :https://whatsapp.com/channel/0029Vb7kRJz6rsQoHcFN5Z3M *`
    m.reply(txt)
}
handler.command = ['المطور', 'dev'] // الكلمات التي تشغل الأمر
export default handler