# Malla interactiva


![Contribuidores](https://img.shields.io/github/contributors/csarman/malla-interactiva)
![package version](https://img.shields.io/github/package-json/v/csarman/malla-interactiva)
![license](https://img.shields.io/github/license/csarman/malla-interactiva)
![Docker build status](https://img.shields.io/github/workflow/status/csarman/malla-interactiva/Docker%20Build?label=docker%20build%20)
![Docker image size](https://img.shields.io/docker/image-size/booterman/malla-interactiva?label=docker%20image%20size)
![Docker pull count](https://img.shields.io/docker/pulls/booterman/malla-interactiva)


Proyecto Universitario open-source en donde se mantiene una plataforma web que facilita información sobre las mallas en la Universidad.
Alojado en [mallas.labcomp.cl](https://mallas.labcomp.cl/) (actualmente no se actualiza, usar [booterman98.github.io/malla-interactiva](https://booterman98.github.io/malla-interactiva) mientras)


# Índice
2. [Caracteristicas de la malla](#Características-de-la-malla)
3. [TODO](#TODO)
4. [¿Cómo funciona la malla?](#¿Cómo-funciona-la-malla?)
4. [Agregar o cambiar una malla](#Agregar-o-cambiar-una-malla)
5. [Probar malla](#Probar-malla)
6. [Agradecimientos](#Agradecimientos)

# Características de la malla
- Visualiza los créditos de las asignaturas según el sistema **USM** o **SCT** 
- Selecciona asignaturas para aprobarlas, a medida que vayas aprobando más ramos, podrás ver que ramos
  se desbloquean.
- Calcula tu prioridad. Puedes calcularla basado en ambos sistemas de créditos.  
    ![Gif demo de calculo de prioridad](https://media.giphy.com/media/9FZo5ua3aCmXij4xZ5/giphy.gif)
- Crear una malla personal que se adecue a tu desdicha recorrida en la Universidad.
    ![Gif demo de la malla personalidada](https://media.giphy.com/media/QK448lB7juUF0ftL7g/giphy.gif)
    - Agregar y cambiar los pre-requisitos de los ramos, incluyendo los ya existentes!
    - Agregar ramos que no se encuentren en la malla oficial pero que hayas cursado.
- Cualquier cambio realizado queda guardado para la próxima visita a la página
- Modo oscuro y modo claro automático basado en la configuración del SO o explorador

# TODO
* [ ] Arreglar bugs
* [X] Hacer página más usable en móviles
    * [X] Prioridad
    * [X] Malla personal
    * [X] Malla interactiva
* [ ] Facilitar creación y modificación de mallas oficiales
    * [ ] Crear forma rápida para cambiar solo un ramo
* [ ] Hacer un mejor uso de las características de github
    * [ ] Definir Miletones importantes
    * [ ] Crear pruebas y automatizarlas con github actions
    * [ ] Hacer uso de tags (tal vez)



## ¿Cómo funciona la malla?

Cada malla necesita de dos archivos `.json` para que esta se muestre en el sitio. Estos tienen por nombre
`data_CARR.json` y `colors_CARR.json` y se ubican en el directorio `/data`. `CARR` corresponde a la abrebiatura de la carrera (por Ej: INF para informática) El primero (`data_CARR.json`) contiene
la información de cada ramo y sus características agrupados por semestre. Se sigue la siguiente estructura:  
```json5
{
  "s2": [
    ["Química y Sociedad","QUI-010",3,5,"PC",[],"A"],
    ["Matemáticas II","MAT-022",5,7,"PC",["MAT-021"],"A"],
    ["Física General I","FIS-110",5,8,"PC",["MAT-021","FIS-100"],"A"],
    ["Introducción a la Ingeniería","IWG-101",2,3,"TIN",[],"A"],
    ["Humanístico II","HRW-133",2,3,"HUM",[],"A"],
    ["Educación Física II","DEW-101",1,0,"HUM",["DEW-100"],"A"]
  ],
//  ...
}
```
En donde  
`s2` Corresponde al semestre, en este caso, Semestre II. `s2` contiene una lista de ramos, donde cada ramo tiene 7 items en el siguiente orden:
1. ***Ramo***: El nombre completo del ramo.
2. ***Sigla***: Sigla del ramo. **Única** para cada ramo, no se puede repetir y no puede contener espacios. Se pide seguir el formato `sigla-número`
3. ***Créditos USM***: Entero, la cantidad de créditos USM.
4. ***Créditos SCT***: Entero, la cantidad de créditos SCT. Si su valor es `0`, se calcula
   basándose en los créditos USM
5. ***Categoría***: Categoría del ramo al que pertenece (por ejemplo, *PC*: Plan Común), se deben agregar ó editar en el json `colors_CARR.json`.
6. ***Prerrequisitos***: Una lista de strings que contiene las siglas de los prerrequisitos del ramo. **Es importante
   que la sigla ya exista en semestres anteriores**, de lo contrario podría fallar. Esta lista es opcional.
7. ***Indicador Par o Impar***: Puede tener el valor de `"P"`, `"I"`, `"A"` o `""`. Indica
   si el ramo se dicta en un semestre **P**ar, **I**mpar, o en **A**mbos. `""` Actúa como `"A"` pero significa que no se sabe, por favor evitar dejarlo en blanco.
   
El segundo archivo corresponde a `colors_CARR.json`. Este contiene las categorías y los colores de la malla y sigue el siguiente formato:

```json5
{
  "Abreviación": ["Color", "Categoría"],
//  ...
}
```
Para elegir un buen color, puedes buscar Color Picker en [Google](https://www.google.com/search?client=safari&rls=en&q=Color+Picker&ie=UTF-8&oe=UTF-8)  
Ejemplo:

```json5
{
  "PC": ["#00838F", "Plan Común"]
}
```

Si aun hay dudas, puede revisar [data_INF.json](https://github.com/CsarMan/malla-interactiva/blob/master/data/data_INF.json)
y [colors_INF.json](https://github.com/CsarMan/malla-interactiva/blob/master/data/colors_INF.json)

## Agregar o cambiar una malla

Hay varias formas de agregar o cambiar una malla. La más directa es editar o crear directamente los archivos usando el
formato ya explicado, y realizar una pull request con los archivos en directorio correcto.
Otra forma consiste en crear o editar una malla con la [generadora de mallas](https://csarman.github.io/malla-interactiva/personalizar/) (tiene instrucciones **:p**) y contestar este
[formulario](https://docs.google.com/forms/d/e/1FAIpQLSc7im-tmzXlWhHYb5XmRhIMGTLQ5GUZj4haRq8iSECYsuXU8A/viewform?usp=sf_link) con la malla generada.
Por último, usar la malla generada en una pull request

*Nota*: Es recomendable (por no decir necesario) hacer el proceso en un computador.


## Probar malla
Para probar la malla, existen los siguientes métodos:

**NOTA:** Independientemente de la forma en que se prueba la malla, en caso de editar archivos `.js`, para que estos se reflejen, ejecute desde una terminal en la carpeta raíz
```shell
npm run devBuild
```

### Usando Python (preferido)
Lo ideal sería probarlo usando python, ya que permite levantar un mini servidor http lo que facilita la carga
para el navegador. Para esto, se tiene que **abrir una terminal, ir al directorio principal de la malla** y ejecutar lo siguiente:

* Si tiene **Python 2** (el usado en la universidad hasta hace poco):
    ```shell
    python -m SimpleHTTPServer
    ```
* Si tiene **Python 3** (el actual):
    ```shell
    python -m http.server
    ```

Independiente de la version, una vez ejecutado la línea, después se debe abrir un navegador
e ir a la dirección http://localhost:8000 y ahí debería ver la malla.
Dependiendo de la malla a probar, deberá navegar agregando al final de la url `?m=CARR`. Por ejemplo,
para abrir `data_INF.json` debería quedar algo como `http://localhost:8000/index.html?m=INF`.



### Usando Docker
Los únicos requisitos son el tener `docker`, `podman` o cualquier otro _container manager_.

Primero clone el repo y construya la imagen mediante:
```shell
docker build -t malla-interactiva .
```

dentro del mismo directorio del repositorio.

* **Para correr la imagen** ejecute:
    ```shell
    docker run -d -p 8080:8080 --name mallas malla-interactiva
    ```
    Y listo! Con esto podrá visitar la malla utilizando la dirección [http://localhost:8080/](http://localhost:8080/).

* **Para detener y eliminarla** la instancia del container al mismo tiempo ejecute:

    ```shell
    docker rm --force mallas
    ```
* **Para solo detener** la instancia
    ```shell
    docker stop mallas
    ```



### Usando Firefox
Se tiene que abrir el `index.html` con **Firefox** (debido a que los otros navegadores tienen
desactivada la lectura de archivos locales por defecto), y al final de la URL agregar `?m=CARR`. Por ejemplo,
para abrir `data_INF.json` debería quedar algo como `index.html?m=INF`.



### Usando Browser-sync
Con *NPM* instalado en el equipo, ejecute desde una terminal en la carpeta raíz de el repo
```shell
npm install
npx browser-sync -w
```
o simplemente (hay una diferencia entre ambos)
```shell
npx browser-sync -w
```
Ejecutado lo anterior, se tendrá en su explorador favorito una
versión local de la página. La dirección por defecto es `http://localhost:3000`

Si su explorador tiene problemas, abra *Firefox* y copie y pegue la dirección de la página.


---
# Agradecimientos

Se agradece especialmente a:

* [Sebastián Aedo](https://github.com/etra0) como creador original de la malla interactiva. [Malla Original](https://github.com/etra0/ramos)
* [Pablo Aravena](https://github.com/litneet64) por su ayuda en la integración del proyecto con Labcomp y en el build workflow.
* [Carlos Ponce](https://github.com/capgadsx) por su ayuda en la integración del proyecto con Labcomp.

Al mismo tiempo se agradece a todos quienes hayan realizado un aporte al proyecto
<a href="https://github.com/csarman/malla-interactiva/graphs/contributors">
<img src="https://contrib.rocks/image?repo=csarman/malla-interactiva" />
</a>
