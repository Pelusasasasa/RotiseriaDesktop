#Modelo Venta

Este archivo define el esquema de Venta en MongoDB

##Campos

- `fecha` (Date): Fecha de el numero de pedido que se va a ir mostrando en los tickets
- `nPedido` (Number): Numero que representa el numero de pedido hecho
- `idCliente` (String): Identificador del cliente
- `cliente` (String): Nombre del Cliente
- `numero` (Number): Numero de la venta
- `listaProductos` (Array): Lista con los produtos que se vendieron y su precio
- `precio` (Number): Precio de la venta final
- `descuento` (Number): Descuento de la venta si es que la hay
- `tipo_venta` (String): Tipo de venta, puede ser contado, cuenta corriente
- `tipo_comp` (String): Tipo de comprobante habla de si es una factura o solamente un comprobante

Se utiliza para representar la cantidad de pedidos que se hacen por dia.
