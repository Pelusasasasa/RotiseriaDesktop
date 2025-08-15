const puppeteer = require('puppeteer');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

async function generarImagenDesdeHTML(venta) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage(); 

    const html =
    `
        <html>
            <head></head>

            <body>

                <div id='cliente'>
                    <p>Nombre: ${venta.cliente.nombre}</p>
                    <p>DNI: ${venta.cliente.dni}</p>
                    <p>Teléfono: ${venta.cliente.telefono}</p>
                </div>

                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </body>
        </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.screenshot({ type:'png', fullPage: true});
    await browser.close();


    return buffer;
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

module.exports = imprimirVenta;