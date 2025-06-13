const Afip = require('@afipsdk/afip.js');
const afip = new Afip({ CUIT: archivo.cuit });

const subirFacturaAfip = async(venta) => {
    try {
        const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const serverStatus = await afip.ElectronicBilling.getServerStatus();
        console.log(serverStatus) // mostramos el estado del servidor

        let ultimaElectronica = await afip.ElectronicBilling.getLastVoucher(puntoVenta, venta.cod_comp);
        console.log(ultimaElectronica);

        let aux = venta.condicionIva === "Inscripo" ? 1 : 6;
        let ventaAnterior = venta.facturaAnterior && await afip.ElectronicBilling.getVoucherInfo(parseFloat(venta.facturaAnterior), puntoVenta, aux);

        let data = {
            'cantReg': 1,
            'CbteTipo': venta.cod_comp,
            'Concepto': 1,
            'DocTipo': venta.cod_doc,
            'DocNro': venta.num_doc,
            'CbteDesde': ultimaElectronica + 1,
            'CbteHasta': ultimaElectronica + 1,
            'CbteFch': parseInt(fecha.replace(/-/g, '')),
            'ImpTotal': venta.precio,
            'ImpTotConc': 0,
            'ImpNeto': venta.condicionIva === "Inscripto" ? parseFloat(redondear(venta.gravado21 + venta.gravado0 + venta.gravado105, 2)) : venta.precio,
            'ImpOpEx': 0,
            'ImpIVA': venta.condicionIva === "Inscripto" ? parseFloat(redondear(venta.iva21 + venta.iva0 + venta.iva105, 2)) : 0,
            'ImpTrib': 0,
            'MonId': 'PES',
            'PtoVta': puntoVenta,
            'MonCotiz': 1,
            'Iva': [],
        };

        if (archivo.condicionIva === 'Inscripto'){
            venta.iva105 !== 0 && (data.Iva.push({
                'Id': 4,
                'BaseImp': venta.gravado105,
                'Importe': venta.iva105
            }));
            
            venta.iva21 !== 0 && (data.Iva.push({
                'Id': 5,
                'BaseImp': venta.gravado21,
                'Importe': venta.iva21
            }));

            venta.gravado !== 0 && (data.Iva.push({
                'Id': 3,
                'BaseImp': venta.gravado0,
                'Importe': venta.iva0
            }));
        }else{
            delete data.Iva;
        };

        console.log(data);
        const res = await afip.ElectronicBilling.createVoucher(data);
        console.log(res)
        
    } catch (error) {
        console.log('Error al hacer la factura ', error);
    }
}