import fs from 'fs';

const getAllFilesInSubDirs = function (dir, filelist) {
  fs.readdirSync(dir)
    .filter(file => file !== 'index.js' && !file.includes('.js.map'))
    .forEach(file => {
      if (fs.statSync(`${dir}/${file}`).isDirectory()) {
        filelist = getAllFilesInSubDirs(`${dir}/${file}`, filelist);
      } else {
        filelist.push(require(`${dir}/${file}`).default);
      }
    });
  return filelist;
};

export default getAllFilesInSubDirs(__dirname, []);
