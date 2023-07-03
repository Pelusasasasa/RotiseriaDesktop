let XLSX = require('xlsx')
let ventas = [];
let alicuotas = [];
let nombreArchivoVentas;
let nombreArchivoAlicuotas;
let selectedFile;

document.getElementById('input').addEventListener('change',e=>{
    selectedFile = e.target.files[0];
    if (selectedFile) {
        let fileReader = new FileReader();
        fileReader.onload = function(e){
            let data = e.target.result;
            let woorbook = XLSX.read(data,{
                type:"binary"
            });
            woorbook.SheetNames.forEach(async sheet=>{
                let datos = XLSX.utils.sheet_to_json(woorbook.Sheets[sheet]);
                for await(let {Fecha,Tipo,"Denominación Receptor":Cliente,"Punto de Venta":puntoVenta,"Número Desde":numeroDesde,"Tipo Doc. Receptor":tipo_dni,"Nro. Doc. Receptor":dni,"Imp. Total":total} of datos){
                    const arregloFecha = Fecha.split('/',3);
                    console.log(Cliente)
                    const dia = arregloFecha[0];
                    const mes = arregloFecha[1];
                    const anio = arregloFecha[2];
                    nombreArchivoVentas = `${new Date(parseFloat(`${mes}/${dia}/${anio}`)).toLocaleString("es-AR", { month: "long" })} - ${(new Date(`${mes}/${dia}/${anio}`)).getFullYear()}Ventas.txt`;
                    nombreArchivoAlicuotas = `${new Date(parseFloat(`${mes}/${dia}/${anio}`)).toLocaleString("es-AR", { month: "long" })} - ${(new Date(`${mes}/${dia}/${anio}`)).getFullYear()}Alicuotas.txt`;
                    const cod_comp = (Tipo.split(' - ',2)[0]).padStart(3,'0');
                    const tipo_comp = Tipo.split(' - ',2)[1];
                    const cliente =  Cliente ? Cliente.padEnd(30," ") : "Consumidor Final".padEnd(30," ");
                    const entero = total.toString().split('.',2)[0]
                    const decimal = total.toString().split('.',2)[1] === undefined ? "00" : total.toString().split('.',2)[1];
                    const venta = anio+mes+dia+cod_comp+puntoVenta.toString().padStart(5,'0')+numeroDesde.toString().padStart('20',0)+numeroDesde.toString().padStart('20',0)+tipo_dni+dni.toString().padStart(20,'0')+cliente+entero.padStart(13,'0')+decimal.padEnd(2,'0')+"".padStart(105,'0')+"PES0001000000"+"".padEnd(25,'0');
                    ventas.push(`${venta}\n`);

                    const alicuota = cod_comp + puntoVenta.toString().padStart(5,'0')+numeroDesde.toString().padStart('20',0)+entero.padStart(13,'0')+decimal.padEnd(2,'0')+"0003"+"0".padStart(13,'0')+"0".padEnd(2,'0');
                    alicuotas.push(`${alicuota}\n`);
                }
            });
        }
        fileReader.readAsBinaryString(selectedFile);
    }
});

const generarTexto = async(lista)=>{
    return new Blob(lista,{type:'text/plain'});
};

const descargarArchivo = async(contenidoBlob,nombreArchivo)=>{
    let reader = new FileReader();
    reader.onload = function (event) {
        let save = document.createElement('a');
        save.href = event.target.result;
        save.target = '_blank';
        save.download = nombreArchivo || 'archivo.dat';
        let clicEvent = new MouseEvent('click',{
            'view':window,
            'bubbles':true,
            'cancelable':true
        });
        save.dispatchEvent(clicEvent);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
    console.log(contenidoBlob)
    reader.readAsDataURL(contenidoBlob);
}

document.querySelector('.venta').addEventListener('click',async e=>{
    descargarArchivo(await generarTexto(ventas),nombreArchivoVentas)
});


document.querySelector('.alicuota').addEventListener('click',async e=>{
    descargarArchivo(await generarTexto(alicuotas),nombreArchivoAlicuotas)
});