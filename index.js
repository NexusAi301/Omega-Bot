console.log('============')
console.log('==  𝑵𝒆𝒙𝒐𝒓  ==')
console.log('============')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

// الجزء المسؤول عن الشعار الكبير
cfonts.say('𝑵𝒆𝒙𝒐𝒓', {
  font: 'block',
  align: 'center',
  gradient: ['#00FFFF', '#FFFFFF']
})

cfonts.say('𓆩𝑨𝒍𝒊𓆪', {
  font: 'console',
  align: 'center',
  gradient: ['#00FFFF', '#0080FF']
})

console.log(chalk.blue.bold('\n--- جاري تشغيل المحرك الرئيسي (main.js) ---'))

let isWorking = false

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    let child = fork()

    child.on('exit', (code) => {
      isWorking = false
      console.log(chalk.red(`[!] توقف البوت بكود: ${code}. جاري إعادة التشغيل...`))
      launch(scripts)

      if (code === 0) return
      watchFile(args[0], () => {
        unwatchFile(args[0])
        launch(scripts)
      })
    })
  }
}

launch(['main.js'])