# Mercadillo del Tercio

Web estática gratuita para catálogo + carrito + preparación de pedidos en Telegram.

## Importante sobre Telegram
Esta primera versión NO guarda un token de bot dentro de la web (eso sería inseguro).
Por ahora prepara el pedido y abre Telegram con el mensaje listo para enviarlo.

Para conectarlo automáticamente a un bot de Telegram, necesitaremos configurar:
1. Un bot creado con @BotFather.
2. El token del bot guardado como secreto en un pequeño backend/serverless.
3. El chat/grupo donde queréis recibir los pedidos.

## Productos
Edita `app.js` y cambia el array `products` con nombres, precios, descripciones y emojis.
Las fotos reales se pueden añadir después.

## Publicación gratis
Podéis subir estos archivos a GitHub Pages, Cloudflare Pages o Vercel.
Cuando tengáis la URL pública, esa URL se convierte en un QR para imprimir.

## Nota
El precio inicial está puesto a 0 € tal y como se indicó; podéis cambiarlo cuando queráis.
