

export const calcularPrecioEmpanadas = (cantidadTotal, docena, mediaDocena, unidad) => {

    const DOCENA = 12;
    const MEDIA_DOCENA = 6

    const EmpanadaDocena = docena;
    const EmpanadaMediaDocena = mediaDocena;
    const EmpanadaUnidad = unidad;

    const docenas = Math.floor(cantidadTotal / DOCENA);
    const restantesTrasDocenas = cantidadTotal % DOCENA;

    const mediasDocenas = Math.floor(restantesTrasDocenas / MEDIA_DOCENA);
    const adicionales = restantesTrasDocenas % MEDIA_DOCENA;

    return (
        docenas * EmpanadaDocena +
        mediasDocenas * EmpanadaMediaDocena +
        adicionales * EmpanadaUnidad
    );

};