const fs = require('fs');

var getAllFilesInSubDirs = function(dir, filelist) {
  fs.readdirSync(dir)
    .filter(file => file !== 'index.js')
    .forEach(file =>  {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      filelist = getAllFilesInSubDirs(`${dir}/${file}`, filelist);
    }
    else {
      filelist.push(require(`${dir}/${file}`));
    }
  });
  return filelist;
};

module.exports = getAllFilesInSubDirs(__dirname, []);
