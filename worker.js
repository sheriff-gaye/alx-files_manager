import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

const generateThumbnails = async (width, localPath) => {
  const thumbnail = await imageThumbnail(localPath, {
    width,
  });
  return thumbnail;
};

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;
  if (!userId) {
    done(new Error('Missing userId'));
  }
  if (!fileId) {
    done(new Error('Missing fileId'));
  }

  const files = dbClient.db.collection('files');
  const file = await files.findOne({ _id: fileId, userId });
  if (!file) {
    done(new Error('File not found'));
  }

  // generate thumbnail
  const thumbnail500 = await generateThumbnails(500, file.localPath);
  const thumbnail250 = await generateThumbnails(250, file.localPath);
  const thumbnail100 = await generateThumbnails(100, file.localPath);

  const localPath500 = `${file.localPath}_500`;
  const localPath250 = `${file.localPath}_250`;
  const localPath100 = `${file.localPath}_100`;

  await fs.promises.writeFile(localPath500, thumbnail500);
  await fs.promises.writeFile(localPath250, thumbnail250);
  await fs.promises.writeFile(localPath100, thumbnail100);
});
