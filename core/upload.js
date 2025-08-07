const OSS = require('ali-oss');
const path = require('path');

async function upload(localFilePath) {
  console.log('%c [ localFilePath ]-5', 'font-size:13px; background:pink; color:#bf2c9f;', localFilePath)
  const client = new OSS({
    region: process.env.OSS_REGION_NAME,
    accessKeyId: process.env.OSS_ACCESS_KEY,
    accessKeySecret: process.env.OSS_SECRET_KEY,
    bucket: process.env.OSS_BUCKET_NAME,
  });

  try {
    const remoteDirName = process.env.OSS_DIR_PATH || 'output';
    const fileName = path.basename(localFilePath);
    const remoteObjectName = [remoteDirName, fileName].join('/');
    const result = await client.put(remoteObjectName, localFilePath); // 上传到 OSS 路径
    console.log('上传成功：', result);
    return result;
  } catch (e) {
    console.error('上传失败：', e);
    throw e; // 抛出异常，调用方可捕获
  }
}

module.exports = { upload };
