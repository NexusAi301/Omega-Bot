// يجب عليك عدم تعديل اي شئ من بدايه السطر ال13 لعدم تخريب اللبوت #
// 𝑩𝒐𝒅𝒆 𝑪𝒐𝒓𝒍𝒆𝒐𝒏𝒆 𝑩𝑶𝑻-𝑴𝑫
import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['201205083639', '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪', true],
  ['201103286334', '𓆩𝑨𝒍𝒊𓆪', true],
  // ✅ أضف LID الخاص بك هنا (يظهر في الكونسول كـ 254...)
  ['254198377611387', '𓆩 𝑴𝒐𝒂𝒛 𝑵𝒆𝒙𝒖𝒔 𓆪 (LID)', true],
]

// ✅ أضف LID الخاص بك هنا أيضًا (للتحقق من المطور)
global.mods = ['201205083639', '254198377611387']
global.prems = ['201103286334', '254198377611387']

global.libreria = 'Baileys'
global.baileys = 'V 7.0.0-rc14' 
global.vs = '3.8.7'
global.nameqr = '𝑸𝑹'
global.namebot = '*𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪* '
global.namedev = '*𓆩𝑨𝒍𝒊𓆪*'
global.tg = 'https://t.me/bot_Gojo'
global.sessions = 'sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true

global.packname = 'بــ𝑶𝒎𝒆𝒈𝒂ــوت'
global.author = '𓆩𝑨𝒍𝒊𓆪'
global.moneda = 'Dolar'
global.canalreg = '//'

global.namecanal = '𓆩 𝑶𝒎𝒆𝒈𝒂 𓆪'
global.canal = 'https://whatsapp.com/channel/0029VbE2XcqBvvscmXZFzA1J'
global.idcanal = '120363411787524639@newsletter'

global.ch = {
ch1: '120363411787524639@newsletter',
}

global.multiplier = 69
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
