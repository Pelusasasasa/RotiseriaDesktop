const sharp = require("sharp");
const moment = require('moment-timezone');

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const imprimirTicketComanda = async(venta) => {
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'tcp://192.168.0.15:6001'
    });

    //Redimensionar imagen
    const resizedImagePath = 'img/reducida.png';

    await sharp('img/Logo.png')
        .resize({width: 200})
        .toFile(resizedImagePath)

    const fechaConvertida = moment(venta.fecha).tz('America/Argentina/Buenos_Aires').format();
    
    const fecha = fechaConvertida.slice(0, 10).split('-').reverse().join('/');
    const hora = fechaConvertida.slice(11, 19);

    printer.alignCenter();
    await printer.printImage(resizedImagePath);
    printer.newLine();
    printer.println('Sabor Urbano');
    printer.newLine();

    printer.alignLeft();  
    printer.print(`${venta.tipo_comp ? venta.tipo_comp : 'Comprobante'}     `);
    printer.println(`${venta.numero.toString().padStart(8, '0')}`)

    printer.print(`Fecha: ${fecha}     `);
    printer.println(`Hora: ${hora}`);
    printer.bold(true);
    printer.println(`Pedido N: ${venta?.nPedido}`);
    printer.bold(false);
    
    printer.println('------------------------------------------');
    
    //Info cliente
    printer.setTextDoubleHeight(),
    printer.setTextDoubleWidth(),
    printer.println(`${venta?.cliente}`);
    printer.setTextNormal();
    printer.println(`DNI: ${venta.num_doc ? venta.num_doc : '00000000'}`);
    venta.telefono && printer.println(`Telefono ${venta?.telefono}`);
    venta.direccion && printer.println(`Direccion ${venta.direccion}`);
    printer.println('------------------------------------------');

    //Title producto
    printer.println('Cantidad - Descripcion - Precio');
    printer.println('------------------------------------------');

    //Productos
    printer.bold(true);
    printer.setTextDoubleHeight(),
    printer.setTextDoubleWidth(),
    
    venta.listaProductos.forEach(({producto, cantidad}) => {
        printer.println(`${cantidad.toFixed(2)} - ${producto.descripcion}`);
        printer.alignRight();
        printer.println(`${producto.precio.toFixed(2)}`);
        printer.alignLeft();
        printer.newLine();
    });

    printer.setTextNormal();
    printer.println('------------------------------------------');

    //Total
    printer.alignRight();
    printer.setTextDoubleHeight(),
    printer.setTextDoubleWidth(),
    printer.println(`Total: $${venta.precio.toFixed(2)}`);


    printer.cut();

    try {
        printer.execute()
        console.log("Print done!");
    } catch (error) {
        console.error("Print failed:", error);
    }
};


module.exports = imprimirTicketComanda;