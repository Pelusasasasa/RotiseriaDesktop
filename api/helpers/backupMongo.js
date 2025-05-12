const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');


const BACKUP_DIR = path.join(__dirname, '../backup/backups');
const DB_NAME = 'Rotiseria';
const MONGO_BIN = 'mongodump';

//Creo la carpeta si no sirve
if (!fs.existsSync(BACKUP_DIR)){
    fs.mkdirSync(BACKUP_DIR, {recursive: true});
};


const fecha = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
const backupPath = path.join(BACKUP_DIR, `backup_${fecha}`);

const comando = `${MONGO_BIN} --db=${DB_NAME} --out=${backupPath}`;

console.log(`[INFO] ejecutando el backup en mongodb`);
exec(comando, (error, stdout, stderr) => {   
    if (error){
        console.error(`[ERROR] fallo el bakcup: ${error.message}`);
        return ;
    }
    if (stderr) {
       console.error(`[STDERR] ${stderr}`);
    }
    
    console.log(`[OK] Backup guardado en: ${backupPath}`);
})