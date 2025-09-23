const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

//Configuracion
const DB_NAME = 'Rotiseria';
const BACKUP_DIR = path.join(__dirname, './backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR)
};

const backUpMongoLocal = () => {
    try {
        const backUpDir = path.join(BACKUP_DIR);

        const cmd = `mongodump --db ${DB_NAME} --out "${backUpDir}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error haciendo el backup: ${error.message}`);
                return
            }

            if (stderr) {
                console.log(`Error en stderr: ${stderr}`);
                return
            }

            console.log(`Backup completado: ${backUpDir}`);
        })
    } catch (error) {
        console.error(error);
    }

};

module.exports = backUpMongoLocal;