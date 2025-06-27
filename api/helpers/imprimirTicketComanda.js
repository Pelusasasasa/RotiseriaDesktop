const sharp = require("sharp");
const moment = require('moment-timezone');

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const imprimirTicketComanda = async(venta) => {
    console.log(venta)
    try {
        let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: '//localhost/POS-80C'
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

        if(venta.F){
            printer.alignLeft(); 
            printer.println('Razon Social: AYALA NORMA BEATRIZ');
            printer.println('Domicilio Comercial: 9 de Julio 4080');
            printer.println('CUIT: 27272214900');
            printer.println('Ingreso Brutos: 27272214900');
            printer.println('Inicio de actividades 01/01/2021');
            printer.println('Condicion Frente Iva: Responsable Monotributo');
        }


        printer.alignLeft();  
        printer.print(`${venta.tipo_comp ? venta.tipo_comp : 'Comprobante'}     `);
        printer.println(`${venta.F ? `${venta.afip.puntoVenta.padStart(4, '0')}-${venta.afip.numero.toString().padStart(8, '0')}` : venta.numero.toString().padStart(8, '0')}`)

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
        printer.println(`${venta?.num_doc.length > 8 ? 'CUIT' : 'DNI'}: ${venta?.num_doc ? venta.num_doc : '00000000'}`);
        venta.direccion && printer.println(`Direccion ${venta?.direccion}`);
        venta.telefono && printer.println(`Telefono ${venta?.telefono}`);
        printer.println('------------------------------------------');

        //Title producto
        printer.println('Cantidad - Descripcion - Precio');
        printer.println('------------------------------------------');

        //Productos
        printer.bold(true);
        
        venta.listaProductos.forEach(({producto, cantidad, observaciones}) => {
            const maxLineLength = 37;
            const cantidadDesc = `${cantidad} - ${producto.descripcion}`;
            const precioTexto = `$${producto.precio.toFixed(2)}`;
            
            const espacioDisponible = maxLineLength - precioTexto.length;
            if (cantidadDesc.length <= espacioDisponible) {
                // Todo entra en una sola línea
                const linea = cantidadDesc + " ".repeat(espacioDisponible - cantidadDesc.length) + precioTexto;
                printer.println(linea);
                observaciones && printer.println(observaciones)
            } else {
                // Imprimir descripción dividida
                printer.print(cantidadDesc); // línea con cantidad y descripción larga
                printer.println(" ".repeat(maxLineLength - precioTexto.length) + precioTexto); // precio alineado a la derecha
                observaciones && printer.println(observaciones)
            }

            printer.alignLeft();
            printer.newLine();
        });

        printer.setTextNormal();
        printer.println('------------------------------------------');

        //Total
        printer.alignLeft();
        printer.setTextDoubleHeight(),
        printer.setTextDoubleWidth(),
        printer.println(`Total: $${venta.precio.toFixed(2)}`);
        printer.alignCenter();
        printer.newLine();
        printer.println('*MUCHAS GRACIAS*');
        printer.newLine();
        printer.setTextNormal();

        if(venta.F){
            printer.printQR(venta.afip.QR, {
                cellSize: 4,
                correction: 'Q'
            })
            printer.newLine();
            printer.println(`CAE: ${venta.afip.cae}`);
            printer.println(`VTO CAE: ${venta.afip.vencimiento}`);
        }


        printer.cut();

    
        printer.execute()
        console.log("Print done!");
    } catch (error) {
        console.error("Print failed:", error);
    }
};


module.exports = imprimirTicketComanda;