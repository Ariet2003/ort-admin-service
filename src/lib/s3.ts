import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Конфигурация S3 клиента
const s3Client = new S3Client({
  region: 'ru-1',
  endpoint: 'https://s3.twcstorage.ru',
  credentials: {
    accessKeyId: process.env.PICTURES_TRIAL_TEST_BUCKET_S3_ACCESS_KEY || '',
    secretAccessKey: process.env.PICTURES_TRIAL_TEST_BUCKET_S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true
});

// Имя бакета без URL
const BUCKET_NAME = process.env.PICTURES_TRIAL_TEST_BUCKET || '';

export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    
    console.log('Starting S3 upload:', {
      bucket: BUCKET_NAME,
      fileName: uniqueFileName,
      contentType,
      fileSize: file.length
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: file,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 год кеширования
      ACL: 'public-read'
    });

    await s3Client.send(command);
    console.log('S3 upload successful');

    // Формируем URL для доступа к файлу
    const fileUrl = `https://s3.twcstorage.ru/${BUCKET_NAME}/${uniqueFileName}`;
    console.log('Generated URL:', fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}
