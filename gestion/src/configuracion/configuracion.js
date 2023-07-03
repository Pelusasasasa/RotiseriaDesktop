const archivo = require('../configuracion.json');
const fs = require('fs');
const { cerrarVentana, verificarUsuarios } = require('../helpers');
const path = require('path');

const axios = require('axios');
require('dotenv').config();
const URL = process.env.GESTIONURL;

const sweet = require('sweetalert2');

const {vendedores} = require('../configuracion.json')

const caja = document.getElementById('caja');
const puntoVenta = document.getElementById('puntoVenta');
const cuit = document.getElementById('cuit');
const condIva = document.getElementById('condIva');
const multiple = document.querySelectorAll("input[name=multipleVendedores]");
const multipleStockNegativos = document.querySelectorAll("input[name=stockNegativo]");
const dolar = document.querySelectorAll("input[name=dolar]");


const si = document.getElementById('si');
const no = document.getElementById('no');

const siStockNegativo = document.getElementById('siStockNegativo');
const noStockNegativo = document.getElementById('noStockNegativo');

const siDolar = document.getElementById('siDolar');
const noDolar = document.getElementById('noDolar');

const modificar = document.querySelector('.modificar');


window.addEventListener('load',async e=>{

    if (vendedores) {
        const vendedor = await verificarUsuarios();

        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña incorrecta"
            });
            location.reload();
        }else if(vendedor.permiso !== 0){
            await sweet.fire({
                title:"Acceso denegado"
            });
            window.close();
        }
    }

    caja.value = archivo.caja;  
    archivo.vendedores === false ? no.checked = true : si.checked = true;
    archivo.stockNegativo === false ? noStockNegativo.checked = true : siStockNegativo.checked = true;
    archivo.dolar === false ? noDolar.checked = true : siDolar.checked = true;
    cuit.value = archivo.cuit;
    puntoVenta.value = archivo.puntoVenta;
    condIva.value = archivo.condIva;

});


modificar.addEventListener('click',async e=>{
    const objeto = {};
    objeto.caja = caja.value;
    objeto.vendedores = await verMultiplesRadios(multiple);
    objeto.stockNegativo = await verMultiplesRadios(multipleStockNegativos);
    objeto.puntoVenta = puntoVenta.value;
    objeto.cuit = cuit.value;
    objeto.dolar = await verMultiplesRadios(dolar);
    objeto.condIva = condIva.value;
    
    fs.writeFile(path.join(__dirname, '../configuracion.json'),JSON.stringify(objeto),(error)=>{
        if(error) throw error;
        console.log("Informacion Recibida");
    });

    window.close();
})


const verMultiplesRadios = (lista)=>{
    for(let elem of lista){
        if (elem.checked && elem.value === "true") {
            return true
        }
        return false
    }
};


document.addEventListener('keyup',e=>{
    cerrarVentana(e)
});

