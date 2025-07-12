# Changelog
Changelog del proyecto. No es la gran cosa pero *podría* ser útil a futuro

# [1.6.5]
- Se agregó la malla que rige desde 2025 de Ingeniería Civil Informática
  - (Se dejó la malla antigua, para que alumnos que la sigan usando, no tengan problemas)
  - (Ahora en el índice habrán 2 mallas de Ingeniería Civil Informática)

# [1.6.4]
- La información de contacto se ha puesto al día
  - Se agregó el contacto del desarrollador original del proyecto

# [1.6.3]
- Se actualizó la malla de Ingeniería Civil Informática
- Ahora la pagina se actualiza con cada nuevo tag release en vez de cambiar una branch

# [1.6.2]
- Iconos restaurados de manera temporal (Despues de x visitas mensuales volveran a desaparecer...)
- Agregada Malla de Ingeniería en Biotecnología 
- Se reorganizaron las carreras en orden alfabetico

# [1.6.1]
> Esta *versión* recopila cambios que no fueron anotados previamente acá

- Ahora se muestran los créditos SCT por defecto
- Se movieron varios assets a la `/assets`para mejorar presentación del repo
- Se actualizó la malla de Inegiería Civil en Minas
- Ahora al entrar a la malla desde la url principal, se accede automaticamente a la última malla visitada (contribución de [@uwo-o](https://github.com/uwo-o))
- Se actualizó la malla de Licenciatura en Física
- Se actualizó la malla de Licenciatura en Quimica
- Se actualizó el indicator de Google Analytics
- se actuaizaron varios links hacias el repo del proyecto
- Se actualizó la malla de Ingeniería Civil Eléctrica.

# [1.6.0]
- Ahora se pueden compartir mallas generadas localmente. Basta con descargar un archivo y enviarlo a tus compañeros para que lo carguen en la malla
- Se agrega la malla de Ingeniería en Informática
- Se arreglaron errores de tipeo - issue #32 y pr #33.
- Se arreglaron ramos y se actualizaron las carreras CIV, ELI, ICI, ICQ, MEC e ICM.
- Se arreglo un problema que causaba un fondo blanco en modo oscuro en algunos dispositivos móviles.
- Agregada carrera Ingeniería en Informática - INGINF.
- readme actualizado.
- Se movieron las imágenes a assets para limpiar carpeta raíz.

# [1.5.3]

- Se agregaron links en contacto
- Se arregló un problema que impedía crear nuevas categorías - issue #24
- Se arregló un problema que evitaba registrar cambios en las categorías de los ramos - issue #25

# [1.5.2]

- Se agregó un link a las discusiones del repo
- Se arregló un typo en el nombre del paquete browser-sync

# [1.5.1]

- Ahora prioridad/index.html usa nuevamente los archivos minificados.
- Se arregló un problema que impedía acceder a las instrucciones de la generadora
- Se arregló un problema donde al eliminar la categoría, no se reasignaban los ramos a otra categoría
- Se creó el script devBuild que permite el probar cambios a archivos javascript durante el desarrollo
- Ahora el script build usa devBuild de manera interna
- Los archivos min# han sido eliminados
- Se removió el sitio de donaciones debido a que este daba una impresión equivocada. Ha sido remplazado
  por un indicador de la fecha de la última actualización
- Detalles de contacto agregadas

# [1.5.0]

- Ahora la malla podrá ser mostrada en mallas.labcomp.cl
- Se actualizaron varias mallas
- Se actualizó el readme

# [1.4.2]

- En caso de cambios importantes en la malla, se avisa al usuario de las asignaturas no encontradas
- se corrigieron errores al generar el código de la malla personal
- Ahora es posible clickear ramos creados fuera de la malla en la malla personal
- La malla ahora muestra los años correctos
- cambios en el footer y en la barra de navegación

# [1.4.1]

- La interfaz ahora no cambia mucho al cargar la malla
- Se redujeron los bloqueos de renderizado
- Ahora la malla muestra que ramos se dictan en que semestres si existe la información.
- Malla informática actualizada con información de los semestres en que se dictan ramos

# [1.4.0]

- Se corrigió un problema donde las carreras no se mostraban al cargar la página sin cache
- Gran parte del código ahora está basado en OOP
- El código ha sido refactorizado y ahora sigue el estándar ECMAScript 6

- Ajustes de interfaz 
- La malla ahora tiene un identificador de año para una mejor lectura visual
- Pulsar el indicador de semestre o año selecciona todos los ramos de dicho semestre o año

- La calculadora de prioridad ahora calcula la prioridad usando créditos USM y créditos SCT al mismo tiempo.
- Se corrigió un problema donde al volver al semestre pasado, la prioridad calculada era errónea
- Se redujeron faltas ortográficas en general.
- Spamear clicks en los ramos ya no genera ramos duplicados en la calculadora
- Existe una nueva "Pantalla de bienvenida" que cubre la ventana completa
- Ahora se pueden eliminar asignaturas sin importar si están asignadas a algún semestre
- Ahora se pueden editar asignaturas desde la tabla de asignaturas
- Ahora se pueden restaurar asignaturas de la malla as sus valores originales
- Ahora se pueden eliminar y restaurar categorías
- El formato de las mallas ha sido cambiado (compatibilidad para futuras funciones)
- Contacto ahora tiene una página dedicada
- Se agregaron instrucciones a la generadora y a la calculadora


# [1.3.5]

- Se agregó un link a un formulario para informar cambios de las mallas.
- Se corrigen faltas ortográficas en el changelog.

# [1.3.4]

- Se arregló un error al generar una malla con un ramo creado con la categoría "Fuera de la malla oficial" usando la opción de crear ramos avanzados.
- Instrucciones Mejoradas
- Actualizada Malla Matemática

# [1.3.3]

- Malla De Ing. Civil en minas agregada

# [1.3.2]

- Malla química actualizada con Malla 2017

# [1.3.1]

- Arreglado error de tipeo
- Contacto ahora es clickleable en mobiles
- El botón para cambiar sistema de créditos vuelve a funcionar en la página de inicio
# [1.3.0]

- Se agrega una opción a la malla generada para hacer más fácil 
la edición de Mallas
- se separaron los headers y footers de las páginas para reducir duplicación de código

# [1.2.1]

- Se arreglaron errores de tipeo
- Las direcciones ahora son relativas

# [1.2.0]

- La generadora puede cambiar pre requisitos, categorías,
 créditos y nombres de ramos ya existentes
- Actualización a Bootstrap V4 de toda la página
- etra0 dejó de mantener el proyecto, CsarMan toma su lugar
- Ramos, SelectableRamo y CustomRamo ahora heredan métodos 
y propiedades de manera correcta
- Se agregó la opción de tener la página en modo oscuro según la configuración del explorador usado


# [1.1.0]

- Agregada Calculadora
- Agregada Generadora de Mallas

# [1.0.0]

- Versión Inicial
