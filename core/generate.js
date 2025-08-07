const axios = require("axios");
const fs = require('fs');
const path = require('path');
const {dayjs} = require('./dayjs')
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');



const delay = t => new Promise(resolve => setTimeout(resolve, t));

async function generate() {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const mainImagePath = path.resolve(__dirname, '../output', `main.png`);
    const catImagePath = path.resolve(__dirname, '../material', `cat.gif`);
    const musicPath = path.resolve(__dirname, '../material', `music.mp3`);
    const outputDirPath = path.resolve(__dirname, '../output');
    const outputVideoPath = path.resolve(outputDirPath, 'main.mp4');
    if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
    }

    try {
        const res = await axios.get(`https://www.36jxs.com/api/Commonweal/almanac?sun=${todayStr}`);

        const htmlTplContent = fs.readFileSync(path.resolve(__dirname, '../index.tpl'), 'utf-8');
        const htmlContent = htmlTplContent.replace('%data%', JSON.stringify(res.data));
        fs.writeFileSync(path.resolve(__dirname, '../index.html'), htmlContent);

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1080, height: 1920 },
        });

        const page = await browser.newPage();
        await page.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'networkidle2' });
        await delay(500);

        await page.screenshot({
            path: mainImagePath,
            fullPage: false,
        });

        await browser.close();

        return await new Promise((resolve, reject) => {
            ffmpeg()
                .input(mainImagePath).inputOptions(['-loop 1'])
                .input(catImagePath).inputOptions(['-stream_loop', '-1'])
                .input(musicPath)
                .complexFilter([
                    '[0:v]scale=1080:1920,format=rgba[bg]',
                    '[1:v]scale=500:-1[gif]',
                    '[bg][gif]overlay=W-w-130:H-h-230:shortest=1'
                ])
                .outputOptions([
                    '-map', '0:a?',
                    '-map', '2:a',
                    '-t', '19',
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-pix_fmt', 'yuv420p',
                ])
                .save(outputVideoPath)
                .on('start', command => console.log('执行命令: ' + command))
                .on('progress', progress => console.log('处理中', progress))
                .on('end', () => {
                    console.log('视频生成成功: ' + outputVideoPath);
                    resolve(outputVideoPath);
                })
                .on('error', err => {
                    console.error('错误: ', err.message);
                    reject(err);
                });
        });

    } catch (err) {
        console.error('发生错误:', err);
        throw err;
    }
}

module.exports = { generate };
