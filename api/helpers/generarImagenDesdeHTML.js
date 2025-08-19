const puppeteer = require('puppeteer');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const path = require('node:path');
const fs = require('node:fs');
const sharp = require('sharp');


async function generarImagenDesdeHTML(venta) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage(); 
    console.log(venta);
    const html =
    `
        <html>
            <head>
                <style>
                    ${css}
                </style>
            </head>

            <body class=''>

                <div class='flex justify-center mb-1'>
                </div>

                <div id='encabezado' class='border-b border-gray-800 pb-1'>
                    ${venta.F 
                        ? `
                            <p>Razon Social: AYALA NORMA BEATRIZ</p>
                            <p>Domicilio Comercial: 9 de Julio 4080</p>
                            <p>CUIT: 27272214900</p>
                            <p>Ingreso Brutos: 27272214900</p>
                            <p>Inicio de actividades: 01/01/2021</p>
                            <p>Conmidicion Frente Iva: Responsable Monotributo</p>
                            <p>Factura C: ${venta.afip.puntoVenta.padStart(4, '0')}-${venta.afip.numero.toString().padStart(8, '0')}</p>
                        ` 
                        : `
                            <p>Comprobante: ${venta.numero.toString().padStart(8, '0')}</p>
                        `}
                    
                    <p>Fecha: ${parsearFecha(venta.fecha)}</p>
                    <p>Pedido N: ${venta.nPedido}</p>
                </div>

                <div id='cliente' class='mt-4 border-b border-gray-800 pb-1'>
                    <p class='font-bold'>Nombre: ${venta.cliente}</p>
                    <p>${venta.num_doc?.length > 8 ? 'CUIT' : 'DNI'}: ${venta?.num_doc ?? '00000000'}</p>
                    <p>Teléfono: ${venta?.telefono}</p>
                    <p>Direccion: ${venta?.direccion}</p>
                </div>

                <div class='mt-4 border-b border-gray-800 pb-1'>
                        
                ${venta.listaProductos.map(({ cantidad, producto }) => `
                    <div class='grid grid-cols-3'>
                            <p class='font-bold text-xl'>${cantidad.toFixed(2)}</p>
                            <p class='font-bold text-xl'>${producto.descripcion}</p>
                            <p class='font-bold text-xl'>$${producto.precio.toFixed(2)}</p>
                    </div>
                `)}
                </div>


                <div id='total' class='flex justify-end border-b border-gray-800 pb-1'>
                    <p class='font-bold text-2xl'>Total: $${venta.precio.toFixed(2)}</p>
                </div>

                    ${venta?.observaciones ? `
                        
                        <div id='varios' class='border-b border-gray-800 pb-1'>
                            <p class='text-2xl'>Observaciones: ${venta.observaciones}</p>
                        </div>
                        ` 
                        : ''}

                <div id='forma'>
                    <p class='mb-1 text-2xl'>Forma de pago: ${venta.tipo_pago}</p>
                    <p class='mb-1 text-2xl'>Modalidad: ${venta.envio ? 'Envio a Domicilio' : 'Retiro en el local'}</p>
                    <p class='text-2xl'>${venta?.vuelto ? `El cliente paga con: $${venta?.vuelto}` : ''}</p>
                </div>

                <div class='text-center mt-4'>
                    <p class='font-bold text-xl'>*Gracias por su compra*</p>
                </div>

                ${venta.F 
                    ? ` <div class='flex justify-center gap-4 mt-4'>
                        <p class='text-xs'>CAE: ${venta.afip.cae}</p>
                        <p class='text-xs'>CAE: ${venta.afip.vencimiento}</p>
                    </div>`
                    : ''
                }
            </body>
        </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.screenshot({ type:'png', fullPage: true});
    const pdfPath = path.join(process.cwd(), `factura.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();


    return buffer;
};

async function mostrarEnElNavegador(html){
    const filePath = path.join(process.cwd(), 'ticket.html');
    fs.writeFileSync(filePath, html, 'utf-8');
}

async function imprimirVenta(venta) {
    let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            // interface: '//localhost/POS-80C'
            interface: 'tcp://192.168.0.15:6001'
    });

    //Redimensionar imagen
    const resizedImagePath = 'img/reducida.png';
    
    await sharp('img/Logo.png')
        .resize({width: 200})
        .toFile(resizedImagePath)

    const imagenBuffer = await generarImagenDesdeHTML(venta);
    await printer.isPrinterConnected();
    await printer.alignCenter();
    await printer.printImage(resizedImagePath);

    await printer.alignLeft();
    await printer.printImageBuffer(imagenBuffer);

    // venta.F && await printer.printQR(venta.afip.QR, {
    //     cellSize: 4,
    //     correction: 'Q'
    // })

    await printer.cut();
    await printer.execute();
    console.log("✅ Ticket impreso");
};

module.exports = {
    imprimirVenta,
    generarImagenDesdeHTML
};


const parsearFecha = (date) => {
    const fecha = new Date(date);
    const fechaUTC3 = new Date(fecha.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const fechaParseada = `${fechaUTC3.slice(0, 10)} - ${fechaUTC3.slice(11, 19)}`;
    return fechaParseada;
}

const css = `
    @page{
        margin: 0;
        width: 80mm;
    }
    html, body{
        font-family: Arial, sans-serif;
        font-size: 24px;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        padding: 0;
    }
    body{
        width: 130mm
    }
    p{
        margin: 0;
    }
    .font-bold{
        font-weight: bold;
    }

    .text-center{
        text-align: center;
    }
    .text-end{
        text-align: end;
    }
    .mt-4{
        margin-top: 1rem;
    }
    .mb-1{
        margin-bottom: 1rem
    }

    .pb-1{
        margin-bottom: 1rem
    }
    .text-xl{
        font-size: 26px;
    }
    .text-2xl{
        font-size: 29px;
    }
    .text-xs{
        font-size: 18px;
    }

    .w-full{
        width: 100%;
    }
    .w-7{
        width: 7rem;
    }
    
    .grid{
        display: grid;
    }

    .flex{
        display: flex
    }

    .justify-center{
        justify-content: center;
    }
    .justify-end{
        justify-content: flex-end;
    }

    .grid-cols-3{
        grid-template-columns: 0.5fr 2fr 0.5fr;
    }

    .gap-4{
        gap: 4rem;
    }
    
    .border-b{
        border-bottom: 3px solid;
    }

    .border-gray-800{
        border-color: #4b4a4aff
    }

    `