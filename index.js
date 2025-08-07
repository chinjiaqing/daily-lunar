require('dotenv').config();
const { generate } = require('./core/generate')
const { upload } = require('./core/upload')
const { sendMail } = require('./core/notify')
const dayjs = require('./core/dayjs')
const axios = require('axios')
  ; (async () => {
    try {
      const localVideoPath = await generate()
      // 如果配置了OSS，则上传OSS
      let ossUrl = ''
      if (process.env.OSS_ACCESS_KEY) {
        const ossResult = await upload(localVideoPath)
        ossUrl = ossResult.url
        // 如果配置了回调地址
        if (process.env.CALLBACK_URL) {
          axios.post(process.env.CALLBACK_URL, {
            data: {
              date: dayjs().format('YYYY-MM-DD'),
              oss_url: ossUrl,
              oss_name:ossResult.name
            }
          })
        }
      }
      sendMail([`已生成`, ossUrl ? `下载地址：${ossUrl}` : ''].join('，'), 'success')
    } catch (err) {
      await sendMail(err.message || '操作失败[1]', 'error')
    }
  })()