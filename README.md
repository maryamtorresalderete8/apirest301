# API REST de productos

API sencilla construida con Node.js, Express y `mysql2` para consultar y administrar la tabla `productos`.

## Requisitos

- Node.js 18 o posterior
- MySQL

## Instalación

```bash
npm install
cp .env.example .env
```

Configura en `.env` el host, usuario, contraseña y nombre de la base de datos. Ejecuta
[sql/productos.sql](sql/productos.sql) en la base de datos seleccionada.

El fragmento original incluía una restricción `CONSTRAINT productos_ibfk_1` incompleta. El
archivo SQL deja el índice disponible, pero no inventa la tabla y columna a la que debe apuntar
la llave foránea. Si existe una tabla de categorías, agrega su `FOREIGN KEY` con los nombres
reales de esa tabla.

## Ejecución

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Muestra información básica de la API |
| GET | `/api/health` | Comprueba la conexión con MySQL |
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/productos/:id` | Obtiene un producto |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Reemplaza un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

Ejemplo de cuerpo para `POST` y `PUT`:

```json
{
  "nombre": "Teclado",
  "precio": 499.99,
  "stock": 10,
  "fk_clave_cat": 1
}
```
