#Modelo de producto

Este archivo define el esque de Producto en mongoDB

##Campos

- `_id` (String): ID personalizado del producto.
- `descripcion` (String): Nombre del producto.
- `precio` (String): Precio del producto.
- `seccion` (ObjectId): Referencia la modelo `seccion`.

Se utiliza para representar los productos de la rotiseria en el sistema
