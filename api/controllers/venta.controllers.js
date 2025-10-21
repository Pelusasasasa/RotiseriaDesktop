const ventaCTRL = {};

const getNextNumberContado = require('../helpers/getNextNumberContado');
const getNextNumberPedido = require('../helpers/getNextNumberPedido');
const imprimirTicketComanda = require('../helpers/imprimirTicketComanda');

const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const { imprimirVenta } = require('../helpers/generarImagenDesdeHTML');

ventaCTRL.deleteVenta = async(req, res) => {
    const { id } = req.params;

    try {
        const ventaEliminada = await Venta.findByIdAndUpdate(id, {eliminada: true}, {new: true});
        if(!ventaEliminada) return res.status(404).json({
            ok: false,
            msg: 'No se encontró la venta',
        });

        res.status(200).json({
            ok: true,
            ventaEliminada
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo eliminar la venta, hable con el administrador',
        })
    }
};

ventaCTRL.getAll = async(req, res) => {
    try {
        const ventas = await Venta.find();
        
        res.status(200).json({
            ok: true,
            ventas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las ventas, hable con el administrador',
            
        })
    }
};

ventaCTRL.getFacturas = async(req, res) => {
    const { desde, hasta } = req.params;
    const inicioDia = new Date(`${desde}T00:00:00`);
    const finDia = new Date(`${hasta}T23:59:59`);

    try {
        const ventas = await Venta.find({
            $and: [
                { fecha: { $gte: inicioDia }},
                { fecha: { $lte: finDia }},
                { F: true}
            ]
        });

        if(!ventas || ventas.length === 0) return res.status(404).json({
            ok: false,
            msg: 'No se encontraron facturas para esta fecha',
        });

        res.status(200).json({
            ok: true,
            ventas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las facturas, hable con el administrador'
        })
    }
};

ventaCTRL.getForDia = async(req, res) => {
    const {fecha} = req.params;
    try {
        const fechaBase = new Date(`${fecha}T00:00:00-03:00`)
        const inicioDia = new Date(fechaBase);
        const finDia = new Date(fechaBase);
        finDia.setHours(23, 59, 59, 999);

        const ventas = await Venta.find({
            $and: [
                { fecha: { $gte: inicioDia } },
                { fecha: { $lte: finDia } },
                {eliminada: { $ne: true }}
            ]
        });

        res.status(200).json({
            ok: true,
            ventas
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las ventas del dia, hable con el administrador',  
        })
    }
};

ventaCTRL.getVentasEliminadas = async(req, res) => {
    try {
        const ventas = await Venta.find({
            $and: [
                {eliminada: true }
            ]
        });

        res.status(200).json({
            ok: true,
            ventas
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las ventas eliminadas, hable con el administrador',
        })
    }
}

ventaCTRL.getForMes = async(req, res) => {
    const {fecha} = req.params;

    try {

        const anio = new Date().getFullYear();
        const mesActual = parseInt(fecha);
        const siguienteMes = mesActual + 1;
        

        const inicioMes = new Date(`${anio}-${mesActual.toString().padStart(2, '0')}-01T00:00:00-03:00`);
        const finMes = new Date(`${siguienteMes > 12 ? anio + 1 : anio}-${(siguienteMes % 13 || 1).toString().padStart(2, '0')}-01T00:00:00-03:00`);

        const ventas = await Venta.find({
            $and: [
                { fecha: { $gte: inicioMes } },
                { fecha: { $lt: finMes } },
                {eliminada: { $ne: true }}
            ]
        });

        if(!ventas || ventas.length === 0)return res.status(404).json({
            ok: false,
            msg: 'No se encontraron ventas para este mes',
        });

        res.status(200).json({
            ok: true,
            ventas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las ventas del mes, hable con el administrador',  
        })
    }

};

ventaCTRL.getforAnio = async(req, res) => {
    const { fecha } = req.params;

    try {
        const inicioYear = new Date(`${fecha}-01-01T00:00:00-03:00`);
        const finYear = new Date(`${fecha}-12-31T23:59:59-03:00`);

        const ventas = await Venta.find({
            $and: [
                { fecha: { $gte: inicioYear } },
                { fecha: { $lte: finYear } },
                {eliminada: { $ne: true }}
            ]
        }); 

        if(!ventas || ventas.length === 0)return res.status(404).json({
            ok: false,
            msg: 'No se encontraron ventas para este año',
        });

        res.status(200).json({
            ok: true,
            ventas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener las ventas del año, hable con el administrador',  
        })
    }

};

ventaCTRL.getOne = async(req, res) => {
    const { id } = req.params;
    try {
        const venta = await Venta.findById(id);

        if(!venta){
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró la venta',
            });
        };

        res.status(200).json({
            ok: true,
            venta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener la venta, hable con el administrador',
        })
    }
};

ventaCTRL.notaCreditoTrue = async(req, res) => {
    const { id } = req.params;

    try {
        const venta = await Venta.findOneAndUpdate({_id: id}, { notaCredito: true }, { new: true });
        if(!venta){
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró la venta',
            });
        };

        res.status(200).json({
            ok: true,
            venta
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo modificar nota credito a true, hable con el administrador',
        })
    }
};

ventaCTRL.postOne = async(req, res) => {

    const { listaProductos, tipo_comp, imprimirCliente, F, dispositivo } = req.body;
    
    try {

        const numero = await getNextNumberContado();
        const nPedido = await getNextNumberPedido(tipo_comp);

        listaProductos.forEach(async({producto, cantidad}) => {
            if(producto._id){    
            await Producto.findOneAndUpdate(
                { _id: producto._id },
                { $inc: { stock: -cantidad } },
                { new: true }
            );
            };
        })

        const newVenta = new Venta({
            ...req.body,
            numero,
            nPedido
        });

        // if(F  && dispositivo === 'MOVIL'){
        //     subirFacturaAfip();
        // }

        await newVenta.save();
        await imprimirVenta(newVenta);

        

        if(imprimirCliente){
            await imprimirVenta(newVenta);
        };


        res.status(201).json({
            ok: true,
            venta: newVenta
        });    
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo cargar la venta, hable con el administrador',
            error
        })
    }
};

module.exports = ventaCTRL;