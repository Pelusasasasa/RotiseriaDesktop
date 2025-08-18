const puppeteer = require('puppeteer');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const path = require('node:path');

async function generarImagenDesdeHTML(venta) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage(); 
    console.log(venta.precio);
    const html =
    `
        <html>
            <head>
                <style>
                    ${css}
                </style>
            </head>

            <body class='w-full'>

                <div id='encabezado'>
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

                <hr/>

                <div id='cliente' class='mt-4'>
                    <p class='font-bold'>Nombre: ${venta.cliente}</p>
                    <p>${venta.num_doc?.length > 8 ? 'CUIT' : 'DNI'}: ${venta?.num_doc ?? '00000000'}</p>
                    <p>Teléfono: ${venta?.telefono}</p>
                    <p>Direccion: ${venta?.direccion}</p>
                </div>

                <hr/>

                <div class='mt-4'>
                    <table class='w-full'>
                        <thead>
                            <tr class='text-center'>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${venta.listaProductos.map(({ cantidad, producto }) => `
                                <tr class='text-center'>
                                    <td class='font-bold'>${cantidad.toFixed(2)}</td>
                                    <td class='font-bold'>${producto.descripcion}</td>
                                    <td class='font-bold'>$${producto.precio.toFixed(2)}</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>

                <hr/>

                <div id='total'>
                    <p class='font-bold'>Total: $${venta.precio.toFixed(2)}</p>
                </div>

                    ${venta?.observaciones ? `
                        <hr/>
                        <div id='varios'>
                            <p>Observaciones: ${venta.observaciones}</p>
                        </div>
                        ` 
                        : ''}

                <hr/>

                <div id='forma'>
                    <p>Forma de pago: ${venta.tipo_pago}</p>
                    <p>Modalidad: ${venta.envio ? 'Envio a Domicilio' : 'Retiro en el local'}</p>
                </div>

                <div class='text-center mt-4'>
                    <p>Gracias por su compra</p>
                </div>

                ${venta.F 
                    ? ` <div class='text-center mt-4'>
                        <p>CAE: ${venta.afip.cae}</p>
                        <p>CAE: ${venta.afip.vencimiento}</p>
                    </div>`
                    : ''
                }
            </body>
        </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    // const buffer = await page.screenshot({ type:'png', fullPage: true});
    const pdfPath = path.join(process.cwd(), `factura-${venta.id}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();


    // return buffer;
};

async function imprimirVenta(venta) {
    let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            // interface: '//localhost/POS-80C'
            interface: 'tcp://192.168.0.15:6001'
    });

    const imagenBuffer = await generarImagenDesdeHTML(venta);
    await printer.isPrinterConnected();

    await printer.printImageBuffer(imagenBuffer);
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
    p{
        margin: 0;
    }
    .font-bold{
        font-weight: bold;
    }

    .text-center{
        text-align: center;
    }

    .mt-4{
        margin-top: 1rem;
    }

    .w-full{
        width: 100%;
    }
        
    `