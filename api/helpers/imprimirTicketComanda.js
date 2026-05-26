const puppeteer = require('puppeteer');

const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const sharp = require('sharp');

const generarImagenDesdeHTML = async (mesa) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 550, height: 1000 });
    const html = `
        <html>
            <head>
                <style>
                    ${css}
                </style>
            </head>

            <body class=''>

                <div id='ticket-root'>

                <div class='flex justify-center mb-1'>
                    <h3>Sabor Urbano</h3>
                </div>

                <div id='encabezado' class='border-b border-gray-800 pb-1'>
                    <p>Fecha: ${parsearFecha(mesa.abierto_en)}</p>
                    <p>Mesa N: ${mesa.nombre}</p>
                </div>

                <div id='cliente' class='mt-4 border-b border-gray-800 pb-1'>
                    <p class='font-bold text-xl'>Nombre: ${mesa.cliente}</p>
                </div>

                <div class='mt-4 border-b border-gray-800 pb-1'>

                    <div class='grid grid-cols-3 gap-2 border-b border-gray-800 mb-1'>
                        <p class='font-bold'>Cantidad</p>
                        <p class='font-bold'>Producto</p>
                        <p class='font-bold'>Precio</p>
                    </div>
                
                    ${mesa.productos.map(({ cantidad, producto }) => `
                        <div class='grid grid-cols-3 productos'>
                            <em class='font-bold text-xl'>${cantidad.toFixed(2)}</em>
                            <em class='font-bold text-xl'>${producto.descripcion}</em>
                            <em class='font-bold text-xl'>$${producto.precio.toFixed(2)}</em>
                        </div>
                    `).join('')}

                </div>


                <div id='total' class='flex justify-end border-b border-gray-800 pb-1'>
                    <p class='font-bold text-2xl mt-4'>Total: $${mesa.precio.toFixed(2)}</p>
                </div>

                ${mesa?.observaciones
            ? `
                        <div id='varios' class='border-b border-gray-800 pb-1'>
                            <p class='text-2xl'>Observaciones: ${mesa.observaciones}</p>
                        </div>`
            : ''
        }

                </div>

            </body>
        </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    let buffer;
    const root = await page.$('#ticket-root');
    if (root) {
        const box = await root.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
            buffer = await page.screenshot({
                type: 'png',
                clip: {
                    x: Math.max(0, Math.floor(box.x)),
                    y: Math.max(0, Math.floor(box.y)),
                    width: Math.ceil(box.width),
                    height: Math.ceil(box.height),
                },
            });
        }
    }
    if (!buffer) {
        buffer = await page.screenshot({ type: 'png', fullPage: true });
    }

    await browser.close();

    return buffer;
};

async function imprimirTicketComanda(venta) {
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: "tcp://192.168.0.47:9100",
        //interface: 'tcp://192.168.0.15:6001',
    });

    const imagenBuffer = await generarImagenDesdeHTML(venta);


    const processedBuffer = await sharp(imagenBuffer)
        .trim({ threshold: 20 })
        .resize({ width: 550 })
        .grayscale()
        .threshold(200)
        .toBuffer();

    await printer.isPrinterConnected();

    await printer.printImageBuffer(processedBuffer);
    await printer.cut();
    try {
        await printer.execute();
        console.log('✅ Ticket impreso');
    } catch (error) {
        console.error('❌ Error al imprimir ticket:', error.message || error);
    }
}

const parsearFecha = (date) => {
    if (!date) return;
    const fecha = new Date(date);
    const fechaUTC3 = new Date(fecha.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const fechaParseada = `${fechaUTC3.slice(0, 10)} - ${fechaUTC3.slice(11, 19)}`;
    return fechaParseada;
};

const css = `
    @page{
        margin: 0;
        width: 100%;
    }
    html, body{
        font-family: Arial, sans-serif;
        font-size: 28px;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        padding: 0;
        background-color: white;
    }
    body{
        width: 100%;
        font-family: 'Inconsolata', monospace;
        background-color: white;
    }
    #ticket-root{
        display: flow-root;
        width: 100%;
        box-sizing: border-box;
    }
    #ticket-root > *:last-child{
        margin-bottom: 0;
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
    .mt-5{
        margin-top: 2rem
    }
    .mb-1{
        margin-bottom: 1rem
    }

    .pb-1{
        margin-bottom: 1rem
    }
    h3{
        font-size: 34px;
        margin: 0;
    }
    .text-lg{
        font-size: 32px;
    }
    .text-xl{
        font-size: 30px;
    }
    .text-2xl{
        font-size: 40px;
    }
    .text-xs{
        font-size: 26px;
    }

    .text-sans{
        font-family: sans
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

    .gap-2{
        gap: 2rem;
    }

    .gap-4{
        gap: 4rem;
    }
    
    .border-b{
        border-bottom: 3px dotted;
    }

    .border-gray-800{
        border-color: #4b4a4aff
    }

    `;

module.exports = imprimirTicketComanda;
