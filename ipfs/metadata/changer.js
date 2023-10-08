const fs = require('fs');

const path = require('path');
const directorio = path.join(__dirname, './');

const cidOriginal = 'ipfs://[enter the CID here]';
const nuevoCID = 'ipfs://QmWJ3udcvB2XjvgWjcn8YrC7w8VEL2VWaUMq1x6Ns4t29k';

for (let i = 0; i < 2000; i++) {
    const nombreArchivo = `${directorio}${i}`;

    fs.readFile(nombreArchivo, 'utf8', (error, data) => {
        if (error) {
            console.error(`Error al leer ${nombreArchivo}: ${error}`);
            return;
        }

        const nuevoContenido = data.replace(new RegExp(cidOriginal.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), nuevoCID);

        fs.writeFile(nombreArchivo, nuevoContenido, 'utf8', (error) => {
            if (error) {
                console.error(`Error al escribir ${nombreArchivo}: ${error}`);
            } else {
                console.log(`Se ha reemplazado en ${nombreArchivo}`);
            }
        });
    });
}
