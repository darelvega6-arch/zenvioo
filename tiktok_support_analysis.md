# Análisis del Sistema de Soporte de TikTok

El sistema de soporte de TikTok se compone de dos elementos principales que deben replicarse en la página del usuario: un **Centro de Ayuda** (Knowledge Base) y un **Formulario de Reporte de Problemas** (Contact Form).

## 1. Centro de Ayuda (Knowledge Base)

**Propósito:** Ofrecer soluciones a problemas comunes y guías de uso sin necesidad de interacción directa con el soporte.

**Estructura:**
1.  **Título Principal:** "Hola, ¿en qué podemos ayudarte?"
2.  **Barra de Búsqueda:** Un campo de texto prominente para que los usuarios busquen soluciones directamente.
3.  **Artículos Populares/Categorías:** Una sección con enlaces a las categorías de ayuda más comunes (e.g., Cuenta, Seguridad, Uso de la aplicación).

**Implementación Sugerida:**
*   Se puede simular la estructura con enlaces a categorías que, por ahora, pueden ser estáticas o llevar a una página de "En construcción" o a una sección de preguntas frecuentes (FAQ).
*   El diseño debe ser limpio y centrado en la búsqueda, similar al de TikTok.

## 2. Formulario de Reporte de Problemas (Contact Form)

**Propósito:** Permitir a los usuarios enviar un problema específico o un comentario al equipo de soporte.

**Estructura del Formulario:**
1.  **Título:** "Informar de un problema"
2.  **Descripción:** Un texto introductorio sobre el uso de la información.
3.  **Campos Requeridos y Opcionales:**
    *   **Tema** (Requerido, Dropdown/Selección)
    *   **Nombre de usuario** (Opcional, Campo de texto)
    *   **Correo electrónico de contacto** (Requerido, Campo de texto)
    *   **Datos adicionales** (Requerido, Área de texto, Mínimo 50 caracteres)
    *   **Datos adjuntos** (Opcional, Carga de archivos, hasta 10 capturas de pantalla)
4.  **Declaración de Responsabilidad/Aceptación:** Casillas de verificación para confirmar la veracidad de la información y la aceptación de la política de privacidad.
5.  **Botón de Envío:** "Enviar".

**Implementación Sugerida:**
*   El formulario debe ser funcional. Dado que el proyecto tiene un `server.py`, se puede crear un *endpoint* simple en el backend para recibir y registrar estos reportes.
*   Se utilizará **Tailwind CSS** para replicar el estilo de la página del usuario, asegurando que el formulario se vea integrado y profesional.

**Flujo General:**
El usuario accede a la sección de soporte. Primero ve el **Centro de Ayuda** para intentar resolver su problema. Si no encuentra solución, tiene la opción de usar el **Formulario de Reporte de Problemas** para contactar directamente.
